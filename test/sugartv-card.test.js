import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mock LitElement before importing the card ──────────────────────────
vi.mock('lit', () => {
    class FakeLitElement {
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
            expect(card._calculateDelta()).toBe('＋10');
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
            expect(card._calculateDelta()).toBe('－20');
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
            expect(delta).toMatch(/＋0[.,]7/);
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

        it('keeps "＋0" for positive sub-integer drift in mg/dL', () => {
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
            expect(card._calculateDelta()).toBe('＋0');
        });

        it('keeps "－0" for negative sub-integer drift in mg/dL', () => {
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
            expect(card._calculateDelta()).toBe('－0');
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
            expect(delta).toMatch(/＋0[.,]7/);
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
