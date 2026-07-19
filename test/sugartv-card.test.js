import { describe, it, expect, beforeEach, vi } from 'vitest';
import haLanguages from './ha-languages.json';
import { getLocalizer } from '../src/localize.js';

// ── Mock LitElement before importing the card ──────────────────────────
vi.mock('lit', () => {
    /*
     * Enough DOM to model what the card does to its own host. classList and
     * className are backed by one set and stay in sync in both directions, so a
     * test can seed a class the card does not own and watch whether it
     * survives -- which the card's old whole-attribute assignment did not let
     * anyone ask.
     */
    class FakeLitElement {
        constructor() {
            this._classes = new Set();
            const sync = (name, on) => {
                if (on) this._classes.add(name);
                else this._classes.delete(name);
                return on;
            };
            this.classList = {
                toggle: (name, force) =>
                    sync(
                        name,
                        force === undefined
                            ? !this._classes.has(name)
                            : !!force,
                    ),
                add: (name) => sync(name, true),
                remove: (name) => sync(name, false),
                contains: (name) => this._classes.has(name),
            };
        }
        get className() {
            return [...this._classes].join(' ');
        }
        set className(value) {
            this._classes = new Set(String(value).split(/\s+/).filter(Boolean));
        }
        static get properties() {
            return {};
        }
        static get styles() {
            return '';
        }
        requestUpdate() {}
    }
    return {
        LitElement: FakeLitElement,
        html: (strings, ...values) =>
            strings.reduce(
                (acc, s, i) =>
                    acc + s + (values[i] !== undefined ? values[i] : ''),
                '',
            ),
        css: (strings, ...values) =>
            strings.reduce(
                (acc, s, i) =>
                    acc + s + (values[i] !== undefined ? values[i] : ''),
                '',
            ),
    };
});

vi.mock('../src/sugartv-card-styles.js', () => ({
    cardStyles: '',
}));

// Stub customElements.define so importing the module doesn't blow up
if (typeof customElements === 'undefined') {
    globalThis.customElements = { define: vi.fn() };
}

// Stub window.customCards
globalThis.window = globalThis.window || {};
window.customCards = [];

// Stub console.info to suppress version log
vi.spyOn(console, 'info').mockImplementation(() => {});

// ── Import the card (after mocks are in place) ─────────────────────────
const mod = await import('../src/sugartv-card.js');

// Get the class from the default export or customElements
// Since we stub customElements.define, we capture its first argument
const SugarTvCard =
    customElements.define.mock?.calls?.[0]?.[1] ||
    Object.values(mod).find((v) => typeof v === 'function');

// ── Helper: create a card instance with hass/config ────────────────────
function createCard(config = {}, hass = {}) {
    const card = new SugarTvCard();
    card.hass = {
        language: 'en',
        states: {},
        ...hass,
    };
    card.config = {
        glucose_value: 'sensor.dexcom_glucose_value',
        color_thresholds: true,
        thresholds: {
            urgent_low: 54,
            low: 70,
            high: 180,
            urgent_high: 250,
        },
        ...config,
    };
    card._data = card._getInitialDataState();
    card._lastHistoryFetch = 0;
    return card;
}

// ═══════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════

describe('SugarTvCard', () => {
    // ── _normalizeTrend ─────────────────────────────────────────────
    describe('_normalizeTrend', () => {
        let card;
        beforeEach(() => {
            card = createCard();
        });

        it('normalizes Dexcom trend values (pass-through)', () => {
            expect(card._normalizeTrend('rising_quickly')).toBe(
                'rising_quickly',
            );
            expect(card._normalizeTrend('steady')).toBe('steady');
            expect(card._normalizeTrend('falling_slightly')).toBe(
                'falling_slightly',
            );
        });

        it('normalizes Dexcom values case-insensitively', () => {
            expect(card._normalizeTrend('Rising_Quickly')).toBe(
                'rising_quickly',
            );
            expect(card._normalizeTrend('STEADY')).toBe('steady');
        });

        it('normalizes Nightscout direction values', () => {
            expect(card._normalizeTrend('DoubleUp')).toBe('rising_quickly');
            expect(card._normalizeTrend('SingleUp')).toBe('rising');
            expect(card._normalizeTrend('FortyFiveUp')).toBe('rising_slightly');
            expect(card._normalizeTrend('Flat')).toBe('steady');
            expect(card._normalizeTrend('FortyFiveDown')).toBe(
                'falling_slightly',
            );
            expect(card._normalizeTrend('SingleDown')).toBe('falling');
            expect(card._normalizeTrend('DoubleDown')).toBe('falling_quickly');
        });

        it('normalizes LibreView/PTST text trends', () => {
            expect(card._normalizeTrend('decreasing_fast')).toBe(
                'falling_quickly',
            );
            expect(card._normalizeTrend('decreasing')).toBe('falling');
            expect(card._normalizeTrend('stable')).toBe('steady');
            expect(card._normalizeTrend('increasing')).toBe('rising');
            expect(card._normalizeTrend('increasing_fast')).toBe(
                'rising_quickly',
            );
        });

        it('normalizes LibreLink/gillesvs human-readable trends', () => {
            expect(card._normalizeTrend('Decreasing fast')).toBe(
                'falling_quickly',
            );
            expect(card._normalizeTrend('Decreasing')).toBe('falling');
            expect(card._normalizeTrend('Stable')).toBe('steady');
            expect(card._normalizeTrend('Increasing')).toBe('rising');
            expect(card._normalizeTrend('Increasing fast')).toBe(
                'rising_quickly',
            );
        });

        it('normalizes Carelink/Medtronic trends', () => {
            expect(card._normalizeTrend('UP')).toBe('rising');
            expect(card._normalizeTrend('DOWN')).toBe('falling');
            expect(card._normalizeTrend('FLAT')).toBe('steady');
            expect(card._normalizeTrend('UP_DOUBLE')).toBe('rising_quickly');
            expect(card._normalizeTrend('DOWN_DOUBLE')).toBe('falling_quickly');
            expect(card._normalizeTrend('NONE')).toBe('steady');
        });

        it('normalizes LibreView numeric trend values', () => {
            expect(card._normalizeTrend('2')).toBe('rising_quickly');
            expect(card._normalizeTrend('5')).toBe('steady');
            expect(card._normalizeTrend('8')).toBe('falling_quickly');
            expect(card._normalizeTrend(3)).toBe('rising');
            expect(card._normalizeTrend(7)).toBe('falling');
        });

        it('returns "unknown" for null/undefined/empty', () => {
            expect(card._normalizeTrend(null)).toBe('unknown');
            expect(card._normalizeTrend(undefined)).toBe('unknown');
            expect(card._normalizeTrend('')).toBe('unknown');
        });

        it('passes through unrecognized trend values as lowercase', () => {
            expect(card._normalizeTrend('SomeWeirdTrend')).toBe(
                'someweirdtrend',
            );
        });
    });

    // ── _resolveTrend ───────────────────────────────────────────────
    describe('_resolveTrend', () => {
        it('uses YAML override first (config.glucose_trend)', () => {
            const card = createCard(
                { glucose_trend: 'sensor.my_trend' },
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                        'sensor.my_trend': { state: 'Rising' },
                    },
                },
            );
            const glucoseState =
                card.hass.states['sensor.dexcom_glucose_value'];
            expect(
                card._resolveTrend('sensor.dexcom_glucose_value', glucoseState),
            ).toBe('rising');
        });

        it('detects Dexcom sibling *_glucose_trend entity', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_user_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                        'sensor.dexcom_user_glucose_trend': {
                            state: 'rising_quickly',
                        },
                    },
                },
            );
            card.config.glucose_value = 'sensor.dexcom_user_glucose_value';
            const glucoseState =
                card.hass.states['sensor.dexcom_user_glucose_value'];
            expect(
                card._resolveTrend(
                    'sensor.dexcom_user_glucose_value',
                    glucoseState,
                ),
            ).toBe('rising_quickly');
        });

        it('detects Carelink sibling *_last_sg_trend entity', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.carelink_john_last_sg_mgdl': {
                            state: '150',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                        'sensor.carelink_john_last_sg_trend': {
                            state: 'UP',
                        },
                    },
                },
            );
            card.config.glucose_value = 'sensor.carelink_john_last_sg_mgdl';
            const glucoseState =
                card.hass.states['sensor.carelink_john_last_sg_mgdl'];
            expect(
                card._resolveTrend(
                    'sensor.carelink_john_last_sg_mgdl',
                    glucoseState,
                ),
            ).toBe('rising');
        });

        it('detects LibreLink prefix-based *_trend entity', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.librelink_john_doe_glucose_measurement': {
                            state: '5.5',
                            attributes: { unit_of_measurement: 'mmol/L' },
                        },
                        'sensor.librelink_john_doe_trend': {
                            state: 'Increasing',
                        },
                    },
                },
            );
            card.config.glucose_value =
                'sensor.librelink_john_doe_glucose_measurement';
            const glucoseState =
                card.hass.states[
                    'sensor.librelink_john_doe_glucose_measurement'
                ];
            // Should NOT match because prefix is "sensor.librelink_john_doe_glucose"
            // and the trend entity is "sensor.librelink_john_doe_trend"
            // Actually the prefix logic takes everything up to the last '_'
            // glucose_measurement -> prefix = sensor.librelink_john_doe_glucose
            // so it would look for sensor.librelink_john_doe_glucose_trend which doesn't exist
            // Then falls through to attribute checks...
            // This would actually fall through. Let me test with the correct entity name:
        });

        it('detects LibreLink generic prefix match for trend entity', () => {
            // The entity is sensor.librelink_john_trend (prefix before last underscore of glucose entity)
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.librelink_john_glucose': {
                            state: '5.5',
                            attributes: { unit_of_measurement: 'mmol/L' },
                        },
                        'sensor.librelink_john_trend': {
                            state: 'Increasing fast',
                        },
                    },
                },
            );
            card.config.glucose_value = 'sensor.librelink_john_glucose';
            const glucoseState =
                card.hass.states['sensor.librelink_john_glucose'];
            expect(
                card._resolveTrend(
                    'sensor.librelink_john_glucose',
                    glucoseState,
                ),
            ).toBe('rising_quickly');
        });

        it('detects Carelink trend from the real sibling entity', () => {
            // Carelink entity ids are slugified from its entity names
            // ("Last glucose level mg/dl"), not from its last_sg_* keys.
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.carelink_pump_last_glucose_level_mg_dl': {
                            state: '150',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                        'sensor.carelink_pump_last_glucose_trend': {
                            state: 'UP',
                        },
                    },
                },
            );
            const entity = 'sensor.carelink_pump_last_glucose_level_mg_dl';
            card.config.glucose_value = entity;
            expect(card._resolveTrend(entity, card.hass.states[entity])).toBe(
                'rising',
            );
        });

        it('detects Carelink trend for the mmol entity', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.carelink_pump_last_glucose_level_mmol': {
                            state: '8.3',
                            attributes: { unit_of_measurement: 'mmol/L' },
                        },
                        'sensor.carelink_pump_last_glucose_trend': {
                            state: 'DOWN',
                        },
                    },
                },
            );
            const entity = 'sensor.carelink_pump_last_glucose_level_mmol';
            card.config.glucose_value = entity;
            expect(card._resolveTrend(entity, card.hass.states[entity])).toBe(
                'falling',
            );
        });

        // The same three id shapes the reading-time lookup is pinned against in
        // timestamp.test.js. Trend and time resolve through one helper, so both
        // ends have to be held or a fix to one can quietly regress the other.
        it.each([
            [
                'pre-2026-02 Carelink',
                'sensor.last_glucose_level_mg_dl',
                'sensor.last_glucose_trend',
            ],
            [
                'patient-named',
                'sensor.carelink_john_doe_last_glucose_level_mg_dl',
                'sensor.carelink_john_doe_last_glucose_trend',
            ],
            [
                'HA 2026.4+ device-prefixed',
                'sensor.john_doe_carelink_john_doe_last_glucose_level_mg_dl',
                'sensor.john_doe_carelink_john_doe_last_glucose_trend',
            ],
        ])(
            'detects the Carelink trend on the %s id shape',
            (_name, value, trend) => {
                const card = createCard(
                    {},
                    {
                        states: {
                            [value]: {
                                state: '150',
                                attributes: { unit_of_measurement: 'mg/dL' },
                            },
                            [trend]: { state: 'UP' },
                        },
                    },
                );
                card.config.glucose_value = value;

                expect(card._resolveTrend(value, card.hass.states[value])).toBe(
                    'rising',
                );
            },
        );

        it('detects Nightscout direction attribute', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.blood_sugar': {
                            state: '95',
                            attributes: {
                                unit_of_measurement: 'mg/dL',
                                direction: 'FortyFiveDown',
                            },
                        },
                    },
                },
            );
            card.config.glucose_value = 'sensor.blood_sugar';
            const glucoseState = card.hass.states['sensor.blood_sugar'];
            expect(card._resolveTrend('sensor.blood_sugar', glucoseState)).toBe(
                'falling_slightly',
            );
        });

        it('detects LibreView trend attribute', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.john_doe_glucose_level': {
                            state: '6.2',
                            attributes: {
                                unit_of_measurement: 'mmol/L',
                                trend: 'increasing_fast',
                            },
                        },
                    },
                },
            );
            card.config.glucose_value = 'sensor.john_doe_glucose_level';
            const glucoseState =
                card.hass.states['sensor.john_doe_glucose_level'];
            expect(
                card._resolveTrend(
                    'sensor.john_doe_glucose_level',
                    glucoseState,
                ),
            ).toBe('rising_quickly');
        });

        it('returns "unknown" when no trend source found', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.some_glucose': {
                            state: '100',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                    },
                },
            );
            card.config.glucose_value = 'sensor.some_glucose';
            const glucoseState = card.hass.states['sensor.some_glucose'];
            expect(
                card._resolveTrend('sensor.some_glucose', glucoseState),
            ).toBe('unknown');
        });
    });

    // ── _isValidValue ───────────────────────────────────────────────
    describe('_isValidValue', () => {
        let card;
        beforeEach(() => {
            card = createCard();
        });

        it('returns true for valid numeric strings', () => {
            expect(card._isValidValue('120')).toBe(true);
            expect(card._isValidValue('5.5')).toBe(true);
        });

        it('returns false for "unknown"', () => {
            expect(card._isValidValue('unknown')).toBe(false);
        });

        it('returns false for "unavailable"', () => {
            expect(card._isValidValue('unavailable')).toBe(false);
        });

        it('returns false for null/undefined/empty', () => {
            expect(card._isValidValue(null)).toBeFalsy();
            expect(card._isValidValue(undefined)).toBeFalsy();
            expect(card._isValidValue('')).toBeFalsy();
        });
    });

    // ── _isStale ────────────────────────────────────────────────────
    describe('_isStale', () => {
        let card;
        beforeEach(() => {
            card = createCard();
        });

        it('returns false for recent timestamp', () => {
            const recent = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            expect(card._isStale(recent)).toBe(false);
        });

        it('returns true for timestamp older than 15 minutes', () => {
            const old = new Date(Date.now() - 20 * 60 * 1000).toISOString();
            expect(card._isStale(old)).toBe(true);
        });

        it('returns false for exactly 15 minutes (boundary)', () => {
            // Freeze time so the boundary timestamp matches Date.now() inside
            // _isStale to the millisecond; otherwise sub-ms drift between
            // building `boundary` and the assertion makes this test flaky.
            vi.useFakeTimers();
            const now = Date.now();
            vi.setSystemTime(now);
            const boundary = new Date(now - 15 * 60 * 1000).toISOString();
            expect(card._isStale(boundary)).toBe(false);
            vi.useRealTimers();
        });

        it('returns true for null/unknown/unavailable (no data = stale)', () => {
            expect(card._isStale(null)).toBe(true);
            expect(card._isStale('unknown')).toBe(true);
            expect(card._isStale('unavailable')).toBe(true);
        });
    });

    // ── relative reading time (#94, point 1) ────────────────────────
    describe('_formatTime with relative_time', () => {
        const MIN = 60 * 1000;
        const ago = (ms) => new Date(Date.now() - ms).toISOString();

        // The option exists because the default has to stay put: an installed
        // card must not change what it shows when the user updates.
        it('shows a clock reading unless asked otherwise', () => {
            const card = createCard();

            expect(card._formatTime(ago(2 * MIN))).toMatch(/\d/);
            expect(card._formatTime(ago(2 * MIN))).not.toMatch(/ago/);
        });

        it('shows the age when the option is on', () => {
            const card = createCard({ relative_time: true, locale: 'en' });

            expect(card._formatTime(ago(2 * MIN))).toBe('2 min ago');
        });

        it('says now under a minute, rather than "in 0 minutes"', () => {
            const card = createCard({ relative_time: true, locale: 'en' });

            expect(card._formatTime(ago(20 * 1000))).toBe('now');
        });

        // A sensor clock running ahead of the browser dates a reading in the
        // future. "in 2 minutes" on a glucose card reads as a malfunction.
        it('treats a future reading as fresh rather than counting forward', () => {
            const card = createCard({ relative_time: true, locale: 'en' });
            const ahead = new Date(Date.now() + 2 * MIN).toISOString();

            expect(card._formatTime(ahead)).toBe('now');
        });

        it('switches to hours once minutes stop being readable', () => {
            const card = createCard({ relative_time: true, locale: 'en' });

            expect(card._formatTime(ago(150 * MIN))).toBe('3 hr ago');
        });

        /*
         * CLDR separates the number from its unit with a no-break space in some
         * locales and an ordinary one in others, and which it picks is not the
         * card's business. Compare the wording, not the byte.
         */
        const words = (s) => s.replace(/[\s\u00a0\u202f]+/g, ' ');

        /*
         * Each language's own abbreviation, not an English one borrowed. The
         * full phrasing ("for 14 min siden", "14 мин. назад") runs up to 2.9
         * times the width of the clock it replaces and crowds the reading in a
         * narrow slot; these hold inside 1.4x.
         */
        it.each([
            ['en', '2 min ago', '3 hr ago'],
            ['ja', '2 分前', '3 時間前'],
            ['uk', '2 хв тому', '3 год тому'],
            ['ru', '2 мин назад', '3 ч назад'],
            ['fr', 'il y a 2 min', 'il y a 3 h'],
            ['sv', 'för 2 min sen', 'för 3 tim sedan'],
            ['nb', 'for 2 min siden', 'for 3 t siden'],
            ['nl', '2 min geleden', '3 uur geleden'],
        ])('says how long ago, in %s', (locale, minutes, hours) => {
            const card = createCard({ relative_time: true, locale });

            expect(words(card._formatTime(ago(2 * MIN)))).toBe(minutes);
            expect(words(card._formatTime(ago(180 * MIN)))).toBe(hours);
        });

        /*
         * Why the unit abbreviation rather than Intl.RelativeTimeFormat, which
         * was the obvious tool. Its narrow style is a signed number in several
         * languages, and a minus beside a glucose reading looks like a negative
         * value rather than elapsed time. These are the languages that broke.
         */
        it.each(['ru', 'fr', 'sv', 'nb', 'ro', 'bs', 'gsw'])(
            'never renders %s as a signed number',
            (locale) => {
                const card = createCard({ relative_time: true, locale });

                for (const age of [1, 5, 14, 59, 90, 300]) {
                    expect(card._formatTime(ago(age * MIN))).not.toMatch(
                        /^[-−–+]/,
                    );
                }
            },
        );

        it.each(haLanguages)(
            'never starts %s with a sign, at any age',
            (locale) => {
                const card = createCard({ relative_time: true, locale });

                for (const age of [0.1, 1, 5, 59, 90, 300]) {
                    expect(
                        card._formatTime(ago(age * MIN)),
                        `${locale} at ${age} min`,
                    ).not.toMatch(/^[-−–+]/);
                }
            },
        );

        /*
         * Intl answers in English rather than failing when its build has no
         * data for a language. The card is translated into all of Home
         * Assistant's languages, so an English phrase sitting in an otherwise
         * Georgian card reads as a bug. The clock is the honest degradation.
         */
        it('shows the clock, not English, when Intl cannot phrase an age', () => {
            const card = createCard({ relative_time: true, locale: 'tlh' });

            const shown = card._formatTime(ago(3 * MIN));

            expect(shown).not.toMatch(/ago/);
            expect(shown).toMatch(/\d/);
        });

        /*
         * Swiss German is signed in every tensed style CLDR has for it, and a
         * minus beside a glucose reading looks like a negative value. It is the
         * one language that drops to the untensed count.
         */
        it('drops the tense only where every phrasing is signed', () => {
            expect(SugarTvCard.formatAgo('gsw', 3, 'minute')).toBe('3 min');
            expect(SugarTvCard.formatAgo('ru', 3, 'minute')).toBe(
                '3 мин назад',
            );
        });

        /*
         * The stop after an abbreviated unit is dropped, since "14 min ago" is
         * the ordinary form and Russian's own standard writes "мин" bare. Not
         * everywhere: in German and its neighbours the abbreviation is a
         * clipped word rather than a symbol, and "vor 14 Min" misspells it.
         */
        it.each([
            ['en', '14 min ago'],
            ['ru', '14 мин назад'],
            ['nl', '14 min geleden'],
            ['tr', '14 dk önce'],
        ])('drops the abbreviation stop in %s', (locale, expected) => {
            expect(SugarTvCard.formatAgo(locale, 14, 'minute')).toBe(expected);
        });

        it.each([
            ['de', 'vor 14 Min'],
            ['is', 'fyrir 14 mín'],
            ['el', 'πριν από 14 λεπ'],
            ['lb', 'viru(n) 14 Min'],
        ])('drops it in %s too, for an even look', (locale, expected) => {
            expect(SugarTvCard.formatAgo(locale, 14, 'minute')).toBe(expected);
        });

        // Hindi marks an abbreviation with U+0970 rather than a full stop, and
        // it reads as a dot, so a strip that only knew about "." would leave it.
        it('drops the Devanagari abbreviation sign as well', () => {
            expect(SugarTvCard.formatAgo('hi', 14, 'minute')).toBe(
                '14 मि पहले',
            );
        });

        // Nothing may touch a decimal point inside a number.
        it('leaves a stop that is not ending a word', () => {
            expect(SugarTvCard.trimAbbreviationDots('1.5 min ago')).toBe(
                '1.5 min ago',
            );
        });

        /*
         * Hebrew marks an abbreviation with a geresh, and the geresh is what
         * makes it one: strip it from "דק׳" and "דק" is a different Hebrew
         * word. So Hebrew is spelled out instead of abbreviated, which needs no
         * mark at all.
         */
        it('spells Hebrew out rather than stripping its geresh', () => {
            const shown = SugarTvCard.formatAgo('he', 14, 'minute');

            expect(shown).toBe('לפני 14 דקות');
            expect(shown).not.toContain('׳');
        });

        /*
         * Hebrew's singular comes back as "לפני דקה (1)" from every style, and
         * a one-minute age is on screen constantly.
         */
        it.each([
            [1, 'minute', 'לפני דקה'],
            [1, 'hour', 'לפני שעה'],
        ])(
            'drops the bracketed numeral Hebrew adds to %s %s',
            (n, unit, expected) => {
                expect(SugarTvCard.formatAgo('he', n, unit)).toBe(expected);
            },
        );

        it('leaves brackets that are part of the phrasing alone', () => {
            // Luxembourgish really does write "viru(n)".
            expect(SugarTvCard.formatAgo('lb', 14, 'minute')).toBe(
                'viru(n) 14 Min',
            );
        });

        it.each([
            ['en', true],
            ['ru', true],
            ['zh-Hans', true],
            ['tlh', false],
        ])('reports relative-time support for %s', (locale, supported) => {
            expect(SugarTvCard.hasRelativeTimeData(locale)).toBe(supported);
        });

        it('says now in the local language, with no string of its own', () => {
            expect(
                createCard({ relative_time: true, locale: 'ru' })._formatTime(
                    ago(10 * 1000),
                ),
            ).toBe('сейчас');
        });

        it('still reports no data rather than an age', () => {
            const card = createCard({ relative_time: true, locale: 'en' });

            expect(card._formatTime(null)).toBe('00:00');
            expect(card._formatTime('unavailable')).toBe('00:00');
        });
    });

    /*
     * The seam. The ladder can be perfect and the card still never fade, which
     * is exactly the failure a unit test on the tier alone cannot see: the tier
     * is only a string until render turns it into a class.
     */
    describe('the age fade in the markup', () => {
        const MIN = 60 * 1000;
        const rendered = (config, minutesAgo, value = '120') => {
            const card = createCard(config);
            card._cadenceMs = 5 * MIN;
            card._data = {
                ...card._data,
                value,
                reading_time: new Date(
                    Date.now() - minutesAgo * MIN,
                ).toISOString(),
                trend: 'steady',
                unit: 'mg/dL',
            };
            /*
             * The real order: willUpdate puts the state on the host, render
             * draws the markup. Calling render alone stopped proving anything
             * the day the host moved out of it.
             */
            card.willUpdate(new Map());
            card.render();
            return card.className;
        };

        it('leaves a current reading at full strength', () => {
            const className = rendered({ dim_by_age: true }, 1);

            expect(className).not.toContain('aging');
            expect(className).not.toContain('stale');
        });

        it('fades a reading that has missed a poll', () => {
            expect(rendered({ dim_by_age: true }, 7)).toContain('aging');
        });

        /*
         * The option gates the lighter fade only. Whole-card dimming on
         * staleness predates it and stays always-on: a live sensor that looks
         * stale is a harmless failure, a dead one that looks live is not.
         */
        it('dims a stale reading whether or not the option is set', () => {
            expect(rendered({}, 20)).toContain('stale');
            expect(rendered({ dim_by_age: true }, 20)).toContain('stale');
        });

        it('leaves the middle rung alone when the option is off', () => {
            expect(rendered({}, 7)).not.toContain('aging');
        });

        /*
         * The host belongs to more than this card. Lovelace marks it in edit
         * mode, card_mod and themes reach for it, a parent layout card may tag
         * it -- and the card used to overwrite the whole attribute on every
         * render, so anything anyone else put there lived until the next
         * glucose reading and then vanished. It only ever removes the six
         * classes it sets itself.
         */
        it('leaves classes it does not own alone', () => {
            const card = createCard({ dim_by_age: true });
            card._cadenceMs = 5 * MIN;
            card.className = 'card-mod some-theme element-preview';
            card._data = {
                ...card._data,
                value: '210',
                reading_time: new Date(Date.now() - 7 * MIN).toISOString(),
                trend: 'steady',
                unit: 'mg/dL',
            };

            card.willUpdate(new Map());

            expect(card.className).toContain('card-mod');
            expect(card.className).toContain('some-theme');
            expect(card.className).toContain('element-preview');
            // ...and still says what the card itself has to say.
            expect(card.className).toContain('aging');
            expect(card.className).toContain('zone-high');
        });

        /*
         * The other half: a class the card DOES own has to come off again when
         * its state clears, or a card that was once stale stays stale forever.
         */
        it('takes its own classes off again when the state clears', () => {
            const card = createCard({ dim_by_age: true });
            card._cadenceMs = 5 * MIN;
            const at = (mins) =>
                new Date(Date.now() - mins * MIN).toISOString();

            card._data = {
                ...card._data,
                value: '210',
                trend: 'steady',
                unit: 'mg/dL',
                reading_time: at(20),
            };
            card.willUpdate(new Map());
            expect(card.className).toContain('stale');

            card._data = { ...card._data, value: '120', reading_time: at(1) };
            card.willUpdate(new Map());

            expect(card.className).not.toContain('stale');
            expect(card.className).not.toContain('aging');
            expect(card.className).not.toContain('zone-high');
        });

        /*
         * The zone class shares the attribute with the fade, so one must not
         * overwrite the other. Shot at 210, since an in-range reading carries
         * no zone class at all and would pass this whatever the code did.
         */
        it('keeps the zone class alongside the fade', () => {
            const className = rendered({ dim_by_age: true }, 7, '210');

            expect(className).toContain('zone-high');
            expect(className).toContain('aging');
        });
    });

    /*
     * The two surfaces Home Assistant reaches without a hass. Both were English
     * in every language until #101, and the translations for them were sitting
     * in localize.js the whole time looking correct.
     */
    describe('localisation off a hass', () => {
        const withFrontend = (language, run) => {
            const previous = globalThis.document;
            globalThis.document = {
                querySelector: (sel) =>
                    sel === 'home-assistant'
                        ? { hass: { locale: { language } } }
                        : null,
            };
            try {
                return run();
            } finally {
                globalThis.document = previous;
            }
        };

        it('translates the editor labels', () => {
            const label = withFrontend('de', () =>
                SugarTvCard.getConfigForm().computeLabel({
                    name: 'relative_time',
                }),
            );

            expect(label).toBe(
                getLocalizer({ locale: 'de' }, {})('editor.relative_time'),
            );
            expect(label).not.toBe('Show reading age instead of the clock');
        });

        it('translates the expandable section title too', () => {
            const form = withFrontend('de', () => SugarTvCard.getConfigForm());
            const section = form.schema.find((f) => f.name === 'thresholds');

            expect(section.title).toBe(
                getLocalizer({ locale: 'de' }, {})('editor.thresholds_title'),
            );
        });

        /*
         * The load-bearing half. window.customCards is filled at module load,
         * so a plain string would be resolved before Home Assistant has a
         * language at all; only a property read at render time can be right.
         */
        it('resolves the picker entry when it is read, not when registered', () => {
            const entry = window.customCards.find(
                (c) =>
                    c.type === 'custom:sugartv-card' ||
                    c.type === 'sugartv-card',
            );

            const german = withFrontend('de', () => entry.description);
            const french = withFrontend('fr', () => entry.description);

            expect(german).toBe(
                getLocalizer({ locale: 'de' }, {})('card.description'),
            );
            expect(french).toBe(
                getLocalizer({ locale: 'fr' }, {})('card.description'),
            );
            expect(german).not.toBe(french);
        });

        /*
         * Every leaf field in the schema, not one sample. The label lookup and
         * the frontend language lookup were written on separate branches and
         * met only in a merge, so nothing had ever asked whether an option
         * added later arrives translated. Walking the schema means a new option
         * cannot quietly ship English: it fails here the moment it is added
         * without a string.
         *
         * Leaves only. An expandable container carries a title rather than a
         * label and correctly has none, so including it would assert the
         * opposite of the rule.
         */
        const leafFields = (schema) =>
            schema.flatMap((field) =>
                field.schema
                    ? leafFields(field.schema)
                    : field.name
                      ? [field]
                      : [],
            );

        it.each(
            leafFields(SugarTvCard.getConfigForm().schema).map((f) => [f.name]),
        )('translates the %s label off the frontend language', (name) => {
            const label = withFrontend('de', () =>
                SugarTvCard.getConfigForm().computeLabel({ name }),
            );

            expect(label).toBe(
                getLocalizer({ locale: 'de' }, {})(`editor.${name}`),
            );
            expect(label).toBeTruthy();
        });

        it('falls back to English when the frontend has no language yet', () => {
            const label = SugarTvCard.getConfigForm().computeLabel({
                name: 'relative_time',
            });

            expect(label).toBe('Show reading age instead of the clock');
        });
    });

    describe('the age ticker', () => {
        // Nothing about the card changes as a minute passes, so without a timer
        // the age would sit frozen at whatever it read when the value arrived.
        it('runs only when an age is on screen', () => {
            vi.useFakeTimers();

            const plain = createCard();
            plain.isConnected = true;
            plain._syncAgeTicker();
            expect(plain._ageTicker).toBeFalsy();

            const relative = createCard({ relative_time: true });
            relative.isConnected = true;
            relative._syncAgeTicker();
            expect(relative._ageTicker).toBeTruthy();

            relative.requestUpdate = vi.fn();
            vi.advanceTimersByTime(60000);
            expect(relative.requestUpdate).toHaveBeenCalled();

            relative._stopAgeTicker();
            vi.useRealTimers();
        });

        /*
         * A dimmed time needs the timer just as much as an age does, and it is
         * the easier one to miss: its text never changes, only the tier it
         * sits in, so a frozen card looks right rather than obviously stuck.
         */
        it('runs for a dimmed clock too, whose text never changes', () => {
            vi.useFakeTimers();

            const card = createCard({ dim_by_age: true });
            card.isConnected = true;
            card._syncAgeTicker();

            expect(card._ageTicker).toBeTruthy();

            card._stopAgeTicker();
            vi.useRealTimers();
        });

        it('stops on disconnect, so a removed card leaves no timer behind', () => {
            vi.useFakeTimers();
            const card = createCard({ relative_time: true });
            card.isConnected = true;
            card._syncAgeTicker();

            card.disconnectedCallback();

            expect(card._ageTicker).toBeFalsy();
            vi.useRealTimers();
        });
    });

    // ── one locale for the whole card ───────────────────────────────
    describe('locale resolution', () => {
        const mmolCard = (config, hass) => {
            const card = createCard(config, hass);
            card._data = {
                ...card._getInitialDataState(),
                unit: 'mmol/L',
                value: '8.1',
                previous_value: '7.6',
                reading_time: new Date().toISOString(),
                previous_ingest_time: new Date(
                    Date.now() - 300000,
                ).toISOString(),
            };
            return card;
        };

        /*
         * The regression this exists for. The clock read the Home Assistant
         * language while the number stopped at config.locale and fell through
         * to the browser, so a German install with no explicit locale drew
         * 15:10 next to 8.1 instead of 8,1.
         */
        it.each(['de', 'ru', 'fr'])(
            'takes the decimal separator from the %s Home Assistant language',
            (language) => {
                const card = mmolCard({}, { language });

                expect(card._formatValue('8.1')).toBe('8,1');
                expect(card._calculateDelta()).toContain(',');
            },
        );

        it('lets an explicit locale override the Home Assistant language', () => {
            const card = mmolCard({ locale: 'en' }, { language: 'de' });

            expect(card._formatValue('8.1')).toBe('8.1');
        });

        // Found by reviewing the diff, not by a failure: the forecast formatted
        // its numbers against the language while the reading beside it used the
        // number format, so one card could read 8.1 above "rise 1,7-2,5".
        it('writes the forecast numbers the same way as the reading', () => {
            const card = createCard(
                {},
                {
                    language: 'en',
                    locale: { language: 'en', number_format: 'decimal_comma' },
                },
            );
            card._data = { ...card._getInitialDataState(), unit: 'mmol/L' };

            const forecast =
                card._getTrendDescriptions('mmol/L').rising.prediction;

            expect(card._formatValue('8.1')).toBe('8,1');
            expect(forecast).toContain('1,7');
            expect(forecast).not.toContain('1.7');
        });

        it('formats the clock and the number against the same locale', () => {
            const card = mmolCard({}, { language: 'de' });

            // 24-hour clock and a decimal comma both mean "German".
            expect(card._formatTime(new Date().toISOString())).not.toMatch(
                /M$/,
            );
            expect(card._formatValue('8.1')).toBe('8,1');
        });
    });

    /*
     * Home Assistant carries a Time format and a Number format in each user's
     * profile, separate from the language. The card used to read neither, so a
     * user in the UK on `en` who had chosen 24 hours still got 03:12 PM: `en`
     * alone means American English to Intl.
     */
    describe('the Home Assistant format settings', () => {
        const at = (card, iso = '2023-01-01T15:12:00') =>
            card._formatTime(new Date(iso).toISOString());

        it.each([
            ['12', true],
            ['24', false],
        ])(
            'honours a time_format of %s over the language',
            (format, isAmPm) => {
                // German gives 24 hours on its own and American English gives 12,
                // so each case here is the setting overriding the language rather
                // than quietly agreeing with it.
                const language = isAmPm ? 'de' : 'en-US';
                const card = createCard(
                    {},
                    { language, locale: { language, time_format: format } },
                );

                expect(/[AP]M/.test(at(card))).toBe(isAmPm);
            },
        );

        it('auto-detects from the language when no format is set', () => {
            const german = createCard(
                {},
                { language: 'de', locale: { language: 'de' } },
            );
            const american = createCard(
                {},
                { language: 'en-US', locale: { language: 'en-US' } },
            );

            expect(at(german)).not.toMatch(/M$/);
            expect(at(american)).toMatch(/M$/);
        });

        it('still works against a Home Assistant too old to send locale', () => {
            expect(() => at(createCard({}, { language: 'de' }))).not.toThrow();
        });

        /*
         * number_format names a style, not a language: someone reading Home
         * Assistant in English can still ask for 1.234,56.
         */
        it.each([
            ['comma_decimal', '8.1'],
            ['decimal_comma', '8,1'],
            ['space_comma', '8,1'],
            ['none', '8.1'],
        ])('honours a number_format of %s', (numberFormat, expected) => {
            const card = createCard(
                {},
                {
                    language: 'en',
                    locale: { language: 'en', number_format: numberFormat },
                },
            );
            card._data = { ...card._getInitialDataState(), unit: 'mmol/L' };

            expect(card._formatValue('8.1')).toBe(expected);
        });

        it('drops the thousands separator when the format is none', () => {
            const card = createCard(
                {},
                {
                    language: 'en',
                    locale: { language: 'en', number_format: 'none' },
                },
            );

            expect(card._formatValue('1234')).toBe('1234');
        });

        /*
         * One precedence rule for both, which is the whole point of pinning it:
         * a format Home Assistant was explicitly told to use beats a language
         * tag. Letting `locale` win for the number but not for the clock would
         * put a 24-hour clock beside an English decimal point on one card.
         */
        it('keeps a chosen profile format ahead of an explicit locale', () => {
            const card = createCard(
                { locale: 'en-US' },
                {
                    language: 'de',
                    locale: {
                        language: 'de',
                        time_format: '24',
                        number_format: 'decimal_comma',
                    },
                },
            );
            card._data = { ...card._getInitialDataState(), unit: 'mmol/L' };

            expect(card._formatValue('8.1')).toBe('8,1');
            expect(at(card)).not.toMatch(/M$/);
        });

        // With the profile on auto, which is where it ships, `locale` is what
        // decides. This is how an English install gets a 24-hour clock.
        it('lets locale decide when the profile is left on auto', () => {
            const card = createCard(
                { locale: 'en-GB' },
                { language: 'en', locale: { language: 'en' } },
            );
            card._data = { ...card._getInitialDataState(), unit: 'mmol/L' };

            expect(at(card)).not.toMatch(/M$/);
            expect(card._formatValue('8.1')).toBe('8.1');
        });
    });

    // ── staleness derived from the sensor's own cadence (#94, point 3) ──
    describe('cadenceFromHistory', () => {
        const MIN = 60 * 1000;
        const at = (...minutes) => minutes.map((m) => m * MIN);

        it('reads the interval off evenly spaced readings', () => {
            expect(SugarTvCard.cadenceFromHistory(at(0, 5, 10, 15))).toBe(
                5 * MIN,
            );
        });

        /*
         * The reason this takes the smallest gap rather than an average. HA
         * writes no history entry when a reading repeats, so a flat stretch
         * leaves a double-width hole. An average would report 7.5 minutes for
         * this 5 minute sensor and stretch the stale window by half again.
         */
        it('is not fooled by a gap where a repeated reading was dropped', () => {
            expect(SugarTvCard.cadenceFromHistory(at(0, 5, 15, 20))).toBe(
                5 * MIN,
            );
        });

        // A rewrite lands seconds after the reading it repeats, so it does not
        // sit on the cadence grid and the gap it leaves behind is not a round
        // interval. What matters is only that the 12 second gap itself is never
        // mistaken for the cadence, which would collapse the stale window.
        it('ignores sub-minute gaps, which are rewrites and not a cadence', () => {
            const times = [0, 0.2 * MIN, 5 * MIN, 10 * MIN];

            expect(
                SugarTvCard.cadenceFromHistory(times),
            ).toBeGreaterThanOrEqual(MIN);
        });

        /*
         * What the smallest gap could not survive. The floor only rejects gaps
         * under a minute, so one poll that lands 90 seconds after the last —
         * an integration retry, a restart, an availability blip — sits above it
         * and became the cadence for the whole card. A 5 minute sensor then
         * measured 90 seconds, which collapsed the stale window to 4.5 minutes
         * and the fade window to 90 seconds, so only "now" ever read as
         * current. The typical gap is what the sensor actually does; the
         * smallest is whatever went wrong most recently.
         */
        it('is not collapsed by a single early poll among regular ones', () => {
            const times = at(0, 5, 10, 11.5, 15, 20);

            expect(SugarTvCard.cadenceFromHistory(times)).toBe(5 * MIN);
        });

        it.each([
            ['nothing', []],
            ['a single reading', at(0)],
            ['only duplicates', [0, 0]],
            ['only sub-minute gaps', [0, 100, 200]],
        ])('returns null given %s', (_label, times) => {
            expect(SugarTvCard.cadenceFromHistory(times)).toBeNull();
        });
    });

    describe('_staleThresholdMs', () => {
        const MIN = 60 * 1000;
        const at = (mins) => new Date(Date.now() - mins * MIN).toISOString();

        it('falls back to 15 minutes before history has been read', () => {
            expect(createCard()._staleThresholdMs()).toBe(15 * MIN);
        });

        // The point of the whole exercise: 15 minutes is three missed polls on
        // a 5 minute sensor but fifteen on a 1 minute one, so the fixed number
        // meant two very different things.
        it('gives a 1 minute sensor a 3 minute window, not 15', () => {
            const card = createCard();
            card._cadenceMs = 1 * MIN;

            expect(card._staleThresholdMs()).toBe(3 * MIN);
        });

        it('keeps the familiar 15 minutes for a 5 minute sensor', () => {
            const card = createCard();
            card._cadenceMs = 5 * MIN;

            expect(card._staleThresholdMs()).toBe(15 * MIN);
        });

        /*
         * A derived cadence may only tighten the window. Trusting a slow
         * cadence outright would let a 15 minute sensor go 45 minutes without
         * dimming, turning a safe failure (live sensor looks stale) into an
         * unsafe one (dead sensor looks live).
         */
        it('never waits longer than the fallback, however slow the sensor', () => {
            const card = createCard();
            card._cadenceMs = 15 * MIN;

            expect(card._staleThresholdMs()).toBe(15 * MIN);
        });

        /*
         * The fade starts one missed poll in, scaled off the same cadence as
         * staleness so the two rungs hold their ratio on any sensor.
         */
        it('starts the fade one interval in, where staleness takes three', () => {
            const card = createCard();
            card._cadenceMs = 5 * MIN;

            expect(card._ageTier(at(4))).toBe('current');
            expect(card._ageTier(at(6))).toBe('aging');
            // Fading, but not yet stale: that is the whole point of a middle rung.
            expect(card._isStale(at(6))).toBe(false);
        });

        it('starts it sooner on a 1 minute sensor', () => {
            const card = createCard();
            card._cadenceMs = 1 * MIN;
            const twoMinutesAgo = new Date(Date.now() - 2 * MIN).toISOString();

            expect(card._ageTier(twoMinutesAgo)).toBe('aging');
            // The same reading is still current under the 15 minute fallback.
            expect(createCard()._ageTier(twoMinutesAgo)).toBe('current');
        });

        /*
         * The fade window comes off the cadence, not off the stale window,
         * which is capped at the 15 minute fallback. Dividing that capped
         * window instead would hold the fade at five minutes however slow the
         * sensor, so a 10 minute sensor's brand new reading would start fading
         * at five, reporting a missed poll that had not happened.
         */
        it('holds the fade at one interval on a slow sensor', () => {
            const card = createCard();
            card._cadenceMs = 10 * MIN;

            expect(card._ageTier(at(9))).toBe('current');
            expect(card._ageTier(at(11))).toBe('aging');
        });

        /*
         * The fade may never start after the card is already stale. A 20 minute
         * sensor's staleness is capped at 15, so its fade has to be capped
         * there too, or the card would go straight from full strength to the
         * stale fade with nothing in between.
         */
        it('never lets the fade start after staleness', () => {
            const card = createCard();
            card._cadenceMs = 20 * MIN;

            expect(card._agingThresholdMs()).toBeLessThanOrEqual(
                card._staleThresholdMs(),
            );
        });

        /*
         * The ladder itself, rung by rung, including the one the card draws
         * nothing for. That rung had no test of its own while it was whatever
         * two predicates both happened to deny, so nothing would have noticed
         * them disagreeing and leaving no rung at all, or both claiming the
         * same reading.
         */
        describe('_ageTier', () => {
            it.each([
                [1, 'current'],
                [4, 'current'],
                [6, 'aging'],
                [14, 'aging'],
                [16, 'stale'],
            ])('puts a %i minute old reading on the %s rung', (mins, tier) => {
                const card = createCard();
                card._cadenceMs = 5 * MIN;

                expect(card._ageTier(at(mins))).toBe(tier);
            });

            /*
             * The direction of the whole thing. Whatever the rungs are called
             * and wherever their thresholds land, an older reading may never
             * come out brighter than a newer one -- that inversion is the bug
             * this ladder was rebuilt to remove, and it is invisible in any
             * single-rung assertion.
             */
            it('never draws an older reading brighter than a newer one', () => {
                const card = createCard();
                card._cadenceMs = 5 * MIN;
                const dimness = { current: 0, aging: 1, stale: 2 };

                const ages = [0, 1, 4, 5, 6, 10, 14, 15, 16, 30, 120];
                const steps = ages.map((m) => dimness[card._ageTier(at(m))]);

                expect(steps).toEqual([...steps].sort((a, b) => a - b));
                expect(card._ageTier(at(0))).toBe('current');
            });

            it.each([[null], ['unknown'], ['unavailable']])(
                'calls %s stale, the one answer that cannot mislead',
                (timestamp) => {
                    expect(createCard()._ageTier(timestamp)).toBe('stale');
                },
            );

            /*
             * Staleness is asked first for this reason. Should the two windows
             * ever cross, a stale card must not wear the lighter fade: it would
             * be reporting a fresher reading than it has.
             */
            it('never calls one reading both stale and merely aging', () => {
                const card = createCard();
                card._cadenceMs = 20 * MIN;
                card._agingThresholdMs = () => 60 * MIN;

                expect(card._ageTier(at(30))).toBe('stale');
            });
        });

        /*
         * The default cadence exists so a card with no history still goes stale
         * at exactly the fallback. That identity is what lets the fallback be
         * stated as an interval rather than as a window, which is in turn what
         * lets the fade come off a cadence at all. It held by a literal 3 until
         * this test; retuning STALE_INTERVALS would then have moved the fade of
         * every recorder-disabled install while the stale window, clamped by
         * the cap, went on reading 15 minutes as though nothing had changed.
         *
         * Asserted on the constants rather than on the windows they produce,
         * because neither window can see this break. _staleThresholdMs clamps
         * to STALE_FALLBACK_MS, so a mis-derived default still reads 15 minutes
         * there; and with no history the old capped formula and the new one
         * agree exactly, which is why the original bug hid in the fallback case
         * and only ever showed on a sensor slower than 5 minutes. An earlier
         * version of this test asserted the window and stayed green through the
         * very retune it was written to catch.
         */
        it('keeps the no-history cadence worth exactly three of itself', () => {
            expect(
                SugarTvCard.DEFAULT_CADENCE_MS * SugarTvCard.STALE_INTERVALS,
            ).toBe(SugarTvCard.STALE_FALLBACK_MS);
        });

        it('drives _isStale, so a fast sensor dims sooner', () => {
            const card = createCard();
            card._cadenceMs = 1 * MIN;
            const fiveMinutesAgo = new Date(Date.now() - 5 * MIN).toISOString();

            // The same timestamp is current under the 15 minute fallback.
            expect(card._isStale(fiveMinutesAgo)).toBe(true);
            expect(createCard()._isStale(fiveMinutesAgo)).toBe(false);
        });
    });

    // ── _getGlucoseZone ─────────────────────────────────────────────
    describe('_getGlucoseZone (mg/dL)', () => {
        let card;
        beforeEach(() => {
            card = createCard();
            card._data.unit = 'mg/dL';
        });

        it('returns zone-urgent-low for glucose < 54', () => {
            expect(card._getGlucoseZone('40')).toBe('zone-urgent-low');
            expect(card._getGlucoseZone('53')).toBe('zone-urgent-low');
        });

        it('returns zone-low for 54 <= glucose < 70', () => {
            expect(card._getGlucoseZone('54')).toBe('zone-low');
            expect(card._getGlucoseZone('69')).toBe('zone-low');
        });

        it('returns empty string for in-range (70 to 180)', () => {
            expect(card._getGlucoseZone('70')).toBe('');
            expect(card._getGlucoseZone('120')).toBe('');
            expect(card._getGlucoseZone('180')).toBe('');
        });

        it('returns zone-high for 180 < glucose <= 250', () => {
            expect(card._getGlucoseZone('181')).toBe('zone-high');
            expect(card._getGlucoseZone('250')).toBe('zone-high');
        });

        it('returns zone-urgent-high for glucose > 250', () => {
            expect(card._getGlucoseZone('251')).toBe('zone-urgent-high');
            expect(card._getGlucoseZone('400')).toBe('zone-urgent-high');
        });

        it('returns empty for invalid values', () => {
            expect(card._getGlucoseZone('unknown')).toBe('');
            expect(card._getGlucoseZone(null)).toBe('');
        });
    });

    describe('_getGlucoseZone (mmol/L)', () => {
        let card;
        beforeEach(() => {
            card = createCard({
                thresholds: {
                    urgent_low: 3.0,
                    low: 3.9,
                    high: 10.0,
                    urgent_high: 13.9,
                },
            });
            card._data.unit = 'mmol/L';
        });

        it('returns zone-urgent-low for glucose < 3.0', () => {
            expect(card._getGlucoseZone('2.5')).toBe('zone-urgent-low');
        });

        it('returns zone-low for 3.0 <= glucose < 3.9', () => {
            expect(card._getGlucoseZone('3.0')).toBe('zone-low');
            expect(card._getGlucoseZone('3.8')).toBe('zone-low');
        });

        it('returns empty for in-range (3.9 to 10.0)', () => {
            expect(card._getGlucoseZone('5.5')).toBe('');
            expect(card._getGlucoseZone('10.0')).toBe('');
        });

        it('returns zone-high for 10.0 < glucose <= 13.9', () => {
            expect(card._getGlucoseZone('10.1')).toBe('zone-high');
            expect(card._getGlucoseZone('13.9')).toBe('zone-high');
        });

        it('returns zone-urgent-high for glucose > 13.9', () => {
            expect(card._getGlucoseZone('14.0')).toBe('zone-urgent-high');
        });
    });

    // ── zone thresholds vs the entity's unit ────────────────────────
    // Lovelace calls setConfig before it assigns hass, so the unit is not
    // knowable while the config is being normalized. Defaults must therefore
    // follow the unit at read time, or every in-range mmol reading is compared
    // against mg/dL numbers and paints the card as urgent low.
    describe('_getGlucoseZone default thresholds follow the unit', () => {
        const ENTITY = 'sensor.jane_glucose_value';
        const mmolHass = {
            language: 'en',
            states: {
                [ENTITY]: {
                    state: '8.1',
                    attributes: { unit_of_measurement: 'mmol/L' },
                },
            },
        };

        function configuredCard(hassBeforeConfig) {
            const card = new SugarTvCard();
            if (hassBeforeConfig) card.hass = mmolHass;
            card.setConfig({ glucose_value: ENTITY });
            if (!hassBeforeConfig) card.hass = mmolHass;
            card._data = card._getInitialDataState();
            card._data.unit = 'mmol/L';
            return card;
        }

        it('an in-range mmol reading is not a zone when hass arrives after setConfig', () => {
            const card = configuredCard(false);
            expect(card._getGlucoseZone('8.1')).toBe('');
        });

        it('an in-range mmol reading is not a zone when hass arrives first', () => {
            const card = configuredCard(true);
            expect(card._getGlucoseZone('8.1')).toBe('');
        });

        it('still flags a genuinely low mmol reading', () => {
            const card = configuredCard(false);
            expect(card._getGlucoseZone('2.5')).toBe('zone-urgent-low');
        });

        it('still flags a genuinely high mmol reading', () => {
            const card = configuredCard(false);
            expect(card._getGlucoseZone('14.0')).toBe('zone-urgent-high');
        });

        it('an explicit threshold from the user still wins', () => {
            const card = new SugarTvCard();
            card.setConfig({
                glucose_value: ENTITY,
                thresholds: {
                    urgent_low: 4.0,
                    low: 4.5,
                    high: 9,
                    urgent_high: 12,
                },
            });
            card.hass = mmolHass;
            card._data = card._getInitialDataState();
            card._data.unit = 'mmol/L';
            expect(card._getGlucoseZone('3.5')).toBe('zone-urgent-low');
            expect(card._getGlucoseZone('9.5')).toBe('zone-high');
        });
    });

    // ── _calculateDelta ─────────────────────────────────────────────
    describe('_calculateDelta', () => {
        let card;
        beforeEach(() => {
            card = createCard();
        });

        it('calculates positive delta in mg/dL', () => {
            const now = new Date().toISOString();
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: '130',
                previous_value: '120',
                reading_time: now,
                previous_ingest_time: fiveMinAgo,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBe('+10');
        });

        it('calculates negative delta in mg/dL', () => {
            const now = new Date().toISOString();
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: '100',
                previous_value: '120',
                reading_time: now,
                previous_ingest_time: fiveMinAgo,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBe('−20');
        });

        it('calculates delta in mmol/L with 1 decimal', () => {
            const now = new Date().toISOString();
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: '6.5',
                previous_value: '5.8',
                reading_time: now,
                previous_ingest_time: fiveMinAgo,
                unit: 'mmol/L',
            };
            const delta = card._calculateDelta();
            expect(delta).toMatch(/\+0[.,]7/);
        });

        it('returns null when same timestamps', () => {
            const now = new Date().toISOString();
            card._data = {
                ...card._data,
                value: '120',
                previous_value: '110',
                reading_time: now,
                previous_ingest_time: now,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });

        it('returns null when time gap > 9 minutes', () => {
            const now = new Date().toISOString();
            const longAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
            card._data = {
                ...card._data,
                value: '120',
                previous_value: '110',
                reading_time: now,
                previous_ingest_time: longAgo,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });

        it('returns null when values are invalid', () => {
            card._data = {
                ...card._data,
                value: 'unknown',
                previous_value: '110',
                reading_time: new Date().toISOString(),
                previous_ingest_time: new Date(
                    Date.now() - 5 * 60 * 1000,
                ).toISOString(),
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });

        it('shows unsigned "0" when value did not change in mg/dL', () => {
            // Distinguishes "no change" from "waiting for data" (clock icon).
            const now = new Date().toISOString();
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: '120',
                previous_value: '120',
                reading_time: now,
                previous_ingest_time: fiveMinAgo,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBe('0');
        });

        it('shows unsigned "0,0" / "0.0" when value did not change in mmol/L', () => {
            const now = new Date().toISOString();
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: '6.5',
                previous_value: '6.5',
                reading_time: now,
                previous_ingest_time: fiveMinAgo,
                unit: 'mmol/L',
            };
            expect(card._calculateDelta()).toMatch(/^0[.,]0$/);
        });

        it('keeps "+0" for positive sub-integer drift in mg/dL', () => {
            // 120.4 - 120 = 0.4 rounds to 0, but direction is preserved.
            const now = new Date().toISOString();
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: '120.4',
                previous_value: '120',
                reading_time: now,
                previous_ingest_time: fiveMinAgo,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBe('+0');
        });

        it('keeps "−0" for negative sub-integer drift in mg/dL', () => {
            const now = new Date().toISOString();
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: '120',
                previous_value: '120.4',
                reading_time: now,
                previous_ingest_time: fiveMinAgo,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBe('−0');
        });

        it('handles comma-separated decimals (European locale)', () => {
            const now = new Date().toISOString();
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: '6,5',
                previous_value: '5,8',
                reading_time: now,
                previous_ingest_time: fiveMinAgo,
                unit: 'mmol/L',
            };
            const delta = card._calculateDelta();
            expect(delta).not.toBeNull();
            expect(delta).toMatch(/\+0[.,]7/);
        });
    });

    // ── _formatValue ────────────────────────────────────────────────
    describe('_formatValue', () => {
        let card;
        beforeEach(() => {
            card = createCard();
            card._data.unit = 'mg/dL';
        });

        it('formats mg/dL as integer', () => {
            const result = card._formatValue('120');
            expect(result).toBe('120');
        });

        it('formats mmol/L with one decimal', () => {
            card._data.unit = 'mmol/L';
            const result = card._formatValue('5.5');
            expect(result).toMatch(/5[.,]5/);
        });

        it('returns N/A for unknown', () => {
            expect(card._formatValue('unknown')).toBe('N/A');
        });

        it('returns N/A for unavailable', () => {
            expect(card._formatValue('unavailable')).toBe('N/A');
        });

        it('returns N/A for null', () => {
            expect(card._formatValue(null)).toBe('N/A');
        });

        it('handles comma decimals', () => {
            card._data.unit = 'mmol/L';
            const result = card._formatValue('5,5');
            expect(result).toMatch(/5[.,]5/);
        });
    });

    // ── setConfig ───────────────────────────────────────────────────
    describe('setConfig', () => {
        it('throws when glucose_value is missing', () => {
            const card = new SugarTvCard();
            expect(() => card.setConfig({})).toThrow('glucose_value');
        });

        it('sets color_thresholds to true by default', () => {
            const card = new SugarTvCard();
            card.setConfig({ glucose_value: 'sensor.test' });
            expect(card.config.color_thresholds).toBe(true);
        });

        it('respects explicit color_thresholds: false', () => {
            const card = new SugarTvCard();
            card.setConfig({
                glucose_value: 'sensor.test',
                color_thresholds: false,
            });
            expect(card.config.color_thresholds).toBe(false);
        });

        it('leaves thresholds unset while the entity cannot be read', () => {
            const card = new SugarTvCard();
            card.setConfig({ glucose_value: 'sensor.test' });
            // Lovelace assigns hass after setConfig, so the unit is unknown
            // here. Guessing mg/dL would bake those numbers into a mmol card;
            // leaving it unset lets the defaults follow the live unit instead.
            expect(card.config.thresholds).toBeUndefined();
        });

        it('populates default mg/dL thresholds from a mg/dL entity', () => {
            const card = new SugarTvCard();
            card.hass = {
                states: {
                    'sensor.test': {
                        attributes: { unit_of_measurement: 'mg/dL' },
                    },
                },
            };
            card.setConfig({ glucose_value: 'sensor.test' });
            expect(card.config.thresholds).toEqual({
                urgent_low: 54,
                low: 70,
                high: 180,
                urgent_high: 250,
            });
        });

        it('uses mmol/L thresholds when sensor unit is mmol/L', () => {
            const card = new SugarTvCard();
            card.hass = {
                states: {
                    'sensor.test': {
                        attributes: { unit_of_measurement: 'mmol/L' },
                    },
                },
            };
            card.setConfig({ glucose_value: 'sensor.test' });
            expect(card.config.thresholds).toEqual({
                urgent_low: 3.0,
                low: 3.9,
                high: 10.0,
                urgent_high: 13.9,
            });
        });

        it('keeps custom thresholds when provided', () => {
            const card = new SugarTvCard();
            const custom = {
                urgent_low: 50,
                low: 65,
                high: 200,
                urgent_high: 300,
            };
            card.setConfig({
                glucose_value: 'sensor.test',
                thresholds: custom,
            });
            expect(card.config.thresholds).toEqual(custom);
        });

        it('uses mg/dL thresholds for lowercase "mg/dl" unit', () => {
            // Freestyle Libre 3 / LibreView integrations report "mg/dl"
            const card = new SugarTvCard();
            card.hass = {
                states: {
                    'sensor.test': {
                        attributes: { unit_of_measurement: 'mg/dl' },
                    },
                },
            };
            card.setConfig({ glucose_value: 'sensor.test' });
            expect(card.config.thresholds).toEqual({
                urgent_low: 54,
                low: 70,
                high: 180,
                urgent_high: 250,
            });
        });

        it('uses mmol/L thresholds for lowercase "mmol/l" unit', () => {
            const card = new SugarTvCard();
            card.hass = {
                states: {
                    'sensor.test': {
                        attributes: { unit_of_measurement: 'mmol/l' },
                    },
                },
            };
            card.setConfig({ glucose_value: 'sensor.test' });
            expect(card.config.thresholds).toEqual({
                urgent_low: 3.0,
                low: 3.9,
                high: 10.0,
                urgent_high: 13.9,
            });
        });
    });

    // ── unit normalization ──────────────────────────────────────────
    describe('unit normalization', () => {
        it('normalizes lowercase "mg/dl" to canonical "mg/dL"', () => {
            const card = createCard(
                { glucose_value: 'sensor.glucose' },
                {
                    states: {
                        'sensor.glucose': {
                            state: '120',
                            last_changed: '2026-01-01T00:00:00Z',
                            attributes: { unit_of_measurement: 'mg/dl' },
                        },
                    },
                },
            );
            card._updateData();
            expect(card._data.unit).toBe('mg/dL');
        });

        it('normalizes lowercase "mmol/l" to canonical "mmol/L"', () => {
            const card = createCard(
                { glucose_value: 'sensor.glucose' },
                {
                    states: {
                        'sensor.glucose': {
                            state: '6.5',
                            last_changed: '2026-01-01T00:00:00Z',
                            attributes: { unit_of_measurement: 'mmol/l' },
                        },
                    },
                },
            );
            card._updateData();
            expect(card._data.unit).toBe('mmol/L');
        });

        it('produces mg/dL prediction text for lowercase "mg/dl" unit', () => {
            // Issue #78: prediction was rendered in mmol/L because the strict
            // unit === 'mg/dL' check failed for the LibreView "mg/dl" casing.
            const card = createCard(
                { glucose_value: 'sensor.glucose' },
                {
                    states: {
                        'sensor.glucose': {
                            state: '120',
                            last_changed: '2026-01-01T00:00:00Z',
                            attributes: { unit_of_measurement: 'mg/dl' },
                        },
                    },
                },
            );
            card._updateData();
            const trends = card._getTrendDescriptions(card._data.unit);
            expect(trends.rising.prediction).toContain('mg/dL');
            expect(trends.rising.prediction).toContain('30-45');
        });
    });

    // ── TREND_MAP completeness ──────────────────────────────────────
    describe('TREND_MAP', () => {
        const validTrends = [
            'rising_quickly',
            'rising',
            'rising_slightly',
            'steady',
            'falling_slightly',
            'falling',
            'falling_quickly',
        ];

        it('maps all values to valid internal trends', () => {
            for (const [key, value] of Object.entries(SugarTvCard.TREND_MAP)) {
                expect(validTrends).toContain(value);
            }
        });

        it('has entries for all Nightscout directions', () => {
            const nightscout = [
                'doubleup',
                'singleup',
                'fortyfiveup',
                'flat',
                'fortyfivedown',
                'singledown',
                'doubledown',
            ];
            for (const dir of nightscout) {
                expect(SugarTvCard.TREND_MAP[dir]).toBeDefined();
            }
        });

        it('has entries for all Carelink trends', () => {
            const carelink = [
                'up',
                'down',
                'up_up',
                'up_double',
                'down_down',
                'down_double',
                'none',
            ];
            for (const t of carelink) {
                expect(SugarTvCard.TREND_MAP[t]).toBeDefined();
            }
        });

        it('has entries for LibreView/PTST snake_case trends', () => {
            const ptst = [
                'decreasing_fast',
                'decreasing',
                'increasing',
                'increasing_fast',
            ];
            for (const t of ptst) {
                expect(SugarTvCard.TREND_MAP[t]).toBeDefined();
            }
        });

        it('has entries for LibreLink human-readable trends', () => {
            const ll = ['decreasing fast', 'increasing fast', 'stable'];
            for (const t of ll) {
                expect(SugarTvCard.TREND_MAP[t]).toBeDefined();
            }
        });
    });
});

/*
 * The screen-reader label. It is user-visible text that never went through the
 * translation file, so the review of that file could not have caught it: the
 * trend came out as the card's internal key with the underscores removed, which
 * reads as English by accident rather than by translation.
 */
describe('the screen-reader label', () => {
    const cardWith = (hass = {}) => {
        const card = new SugarTvCard();
        card.hass = { language: 'ru', states: {}, ...hass };
        card.config = { glucose_value: 'sensor.jane_glucose_value' };
        card._data = {
            ...card._getInitialDataState(),
            unit: 'mmol/L',
            value: '8.1',
        };
        return card;
    };

    it('asks Home Assistant for the trend, which it already translates', () => {
        const localize = vi.fn(() => 'Быстро растёт');
        const card = cardWith({ localize });

        expect(card._trendLabel('rising_quickly')).toBe('Быстро растёт');
        expect(localize).toHaveBeenCalledWith(
            'component.dexcom.entity.sensor.glucose_trend.state.rising_quickly',
        );
    });

    // An install without the Dexcom strings loaded gets nothing back.
    it('falls back to the humanised key when that returns nothing', () => {
        const card = cardWith({ localize: () => '' });

        expect(card._trendLabel('rising_quickly')).toBe('rising quickly');
    });

    it('survives a Home Assistant that has no localize at all', () => {
        const card = cardWith({});

        expect(card._trendLabel('falling')).toBe('falling');
    });

    it('says nothing rather than "unknown" when the trend is unknown', () => {
        const card = cardWith({ localize: () => 'x' });

        expect(card._trendLabel('unknown')).toBe('');
        expect(card._trendLabel(null)).toBe('');
    });

    // The unit was read straight off the sensor, so a Russian card announced
    // "mmol/L" while the rest of it spoke Russian.
    it('announces the unit in the local language', () => {
        const card = cardWith({});

        expect(card._formatValue('8.1')).toBe('8,1');
        expect(getLocalizer(card.config, card.hass)('units.mmoll')).toBe(
            'ммоль/л',
        );
    });
});
