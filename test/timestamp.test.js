import { describe, it, expect, vi } from 'vitest';

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

if (typeof customElements === 'undefined') {
    globalThis.customElements = { define: vi.fn() };
}

globalThis.window = globalThis.window || {};
window.customCards = [];

vi.spyOn(console, 'info').mockImplementation(() => {});

const mod = await import('../src/sugartv-card.js');
const SugarTvCard =
    customElements.define.mock?.calls?.[0]?.[1] ||
    Object.values(mod).find((v) => typeof v === 'function');

// ── Helper ─────────────────────────────────────────────────────────────
const ENTITY = 'sensor.dexcom_glucose_value';

function createCard(config = {}, state = {}) {
    const card = new SugarTvCard();
    card.hass = {
        language: 'en',
        states: {
            [ENTITY]: {
                state: '120',
                attributes: { unit_of_measurement: 'mg/dL' },
                ...state,
            },
        },
    };
    card.config = {
        glucose_value: ENTITY,
        ...config,
    };
    card._data = card._getInitialDataState();
    card._lastHistoryFetch = 0;
    return card;
}

const iso = (msAgo) => new Date(Date.now() - msAgo).toISOString();
const MINUTE = 60 * 1000;

// ═══════════════════════════════════════════════════════════════════════
// TIMESTAMP RESOLUTION (issue #93)
// ═══════════════════════════════════════════════════════════════════════

describe('Reading timestamp resolution', () => {
    // ────────────────────────────────────────────────────────────────
    // The reported bug: a steady value makes a live sensor look stale.
    //
    // These cases assume an integration whose attributes move between polls
    // (Nightscout ships a changing delta/direction), which is what makes HA
    // advance last_updated while last_changed stays frozen. An integration
    // that rewrites a byte-identical state freezes both, and no timestamp in
    // hass.states can reveal the poll — see _resolveTimestamp.
    // ────────────────────────────────────────────────────────────────
    describe('steady value that keeps being re-confirmed', () => {
        it('reports the last poll, not when the value first appeared', () => {
            // Glucose hit 120 twelve minutes ago and has not moved since,
            // but the integration polled a fresh 120 one minute ago.
            const card = createCard(
                {},
                {
                    last_changed: iso(12 * MINUTE),
                    last_updated: iso(1 * MINUTE),
                },
            );

            const { reading_time: resolved } = card._getCurrentState(ENTITY);

            expect(resolved).toBe(card.hass.states[ENTITY].last_updated);
        });

        it('does not mark a freshly polled steady reading as stale', () => {
            const card = createCard(
                {},
                {
                    last_changed: iso(20 * MINUTE),
                    last_updated: iso(2 * MINUTE),
                },
            );

            card._updateCurrentData(card._getCurrentState(ENTITY));

            expect(card._isStale(card._data.reading_time)).toBe(false);
        });
    });

    // ────────────────────────────────────────────────────────────────
    // Integration-provided measurement time wins over HA bookkeeping.
    // ────────────────────────────────────────────────────────────────
    describe('measurement_timestamp attribute', () => {
        it('prefers measurement_timestamp over last_updated', () => {
            const measured = iso(3 * MINUTE);
            const card = createCard(
                {},
                {
                    attributes: {
                        unit_of_measurement: 'mg/dL',
                        measurement_timestamp: measured,
                    },
                    last_changed: iso(12 * MINUTE),
                    last_updated: iso(1 * MINUTE),
                },
            );

            expect(card._getCurrentState(ENTITY).reading_time).toBe(measured);
        });

        it('falls back to last_updated when the attribute is unparseable', () => {
            const card = createCard(
                {},
                {
                    attributes: {
                        unit_of_measurement: 'mg/dL',
                        measurement_timestamp: 'not a date',
                    },
                    last_changed: iso(12 * MINUTE),
                    last_updated: iso(1 * MINUTE),
                },
            );

            expect(card._getCurrentState(ENTITY).reading_time).toBe(
                card.hass.states[ENTITY].last_updated,
            );
        });

        it.each([null, undefined, '', 'unknown', 'unavailable'])(
            'falls back to last_updated when the attribute is %s',
            (val) => {
                const card = createCard(
                    {},
                    {
                        attributes: {
                            unit_of_measurement: 'mg/dL',
                            measurement_timestamp: val,
                        },
                        last_changed: iso(12 * MINUTE),
                        last_updated: iso(1 * MINUTE),
                    },
                );

                expect(card._getCurrentState(ENTITY).reading_time).toBe(
                    card.hass.states[ENTITY].last_updated,
                );
            },
        );
    });

    // ────────────────────────────────────────────────────────────────
    // User override for integrations naming the attribute differently.
    // ────────────────────────────────────────────────────────────────
    describe('timestamp_attribute config option', () => {
        it('reads the configured attribute', () => {
            const measured = iso(4 * MINUTE);
            const card = createCard(
                { timestamp_attribute: 'sensor_time' },
                {
                    attributes: {
                        unit_of_measurement: 'mg/dL',
                        sensor_time: measured,
                    },
                    last_changed: iso(12 * MINUTE),
                    last_updated: iso(1 * MINUTE),
                },
            );

            expect(card._getCurrentState(ENTITY).reading_time).toBe(measured);
        });

        it('wins over the built-in measurement_timestamp', () => {
            const configured = iso(4 * MINUTE);
            const card = createCard(
                { timestamp_attribute: 'sensor_time' },
                {
                    attributes: {
                        unit_of_measurement: 'mg/dL',
                        sensor_time: configured,
                        measurement_timestamp: iso(9 * MINUTE),
                    },
                    last_changed: iso(12 * MINUTE),
                    last_updated: iso(1 * MINUTE),
                },
            );

            expect(card._getCurrentState(ENTITY).reading_time).toBe(configured);
        });

        it('falls back when the configured attribute is absent', () => {
            const card = createCard(
                { timestamp_attribute: 'nope' },
                {
                    last_changed: iso(12 * MINUTE),
                    last_updated: iso(1 * MINUTE),
                },
            );

            expect(card._getCurrentState(ENTITY).reading_time).toBe(
                card.hass.states[ENTITY].last_updated,
            );
        });

        it('accepts epoch seconds', () => {
            const seconds = Math.floor((Date.now() - 3 * MINUTE) / 1000);
            const card = createCard(
                { timestamp_attribute: 'sensor_time' },
                {
                    attributes: {
                        unit_of_measurement: 'mg/dL',
                        sensor_time: seconds,
                    },
                    last_changed: iso(12 * MINUTE),
                    last_updated: iso(1 * MINUTE),
                },
            );

            expect(card._getCurrentState(ENTITY).reading_time).toBe(
                new Date(seconds * 1000).toISOString(),
            );
        });
    });

    // ────────────────────────────────────────────────────────────────
    // Nightscout keeps the reading time in a generically-named `date`.
    // ────────────────────────────────────────────────────────────────
    describe('Nightscout date attribute', () => {
        // The integration writes all four keys on every update whatever the
        // server returned, so null values are the norm, not an edge case.
        const nightscout = (extra) => ({
            attributes: {
                unit_of_measurement: 'mg/dL',
                device_class: 'blood_glucose_concentration',
                device: 'nightscout',
                delta: null,
                direction: 'Flat',
                ...extra,
            },
            last_changed: iso(12 * MINUTE),
            last_updated: iso(1 * MINUTE),
        });

        it('uses date when Nightscout companion attributes are present', () => {
            const measured = iso(3 * MINUTE);
            const card = createCard({}, nightscout({ date: measured }));

            expect(card._getCurrentState(ENTITY).reading_time).toBe(measured);
        });

        it('uses date when the server reported no trend at all', () => {
            // Nightscout never sends delta (it computes it client-side), and
            // direction can be null too. Both keys are still written, so this
            // must not be mistaken for a non-Nightscout entity.
            const measured = iso(3 * MINUTE);
            const card = createCard(
                {},
                nightscout({
                    date: measured,
                    delta: null,
                    direction: null,
                }),
            );

            expect(card._getCurrentState(ENTITY).reading_time).toBe(measured);
        });

        it('ignores a generic date on a non-Nightscout entity', () => {
            // `date` is a shared HA constant — without Nightscout's own
            // attributes it could mean anything (an expiry, an install date).
            const card = createCard(
                {},
                {
                    attributes: {
                        unit_of_measurement: 'mg/dL',
                        date: iso(300 * MINUTE),
                    },
                    last_changed: iso(12 * MINUTE),
                    last_updated: iso(1 * MINUTE),
                },
            );

            expect(card._getCurrentState(ENTITY).reading_time).toBe(
                card.hass.states[ENTITY].last_updated,
            );
        });

        it('yields to measurement_timestamp', () => {
            const measured = iso(2 * MINUTE);
            const card = createCard(
                {},
                nightscout({
                    date: iso(9 * MINUTE),
                    measurement_timestamp: measured,
                }),
            );

            expect(card._getCurrentState(ENTITY).reading_time).toBe(measured);
        });
    });

    // ────────────────────────────────────────────────────────────────
    // Carelink and LibreLink publish the time as a separate entity.
    // ────────────────────────────────────────────────────────────────
    describe('sibling entities', () => {
        function withSibling(
            valueEntity,
            siblingEntity,
            siblingState,
            siblingUpdatedMsAgo = 0,
        ) {
            const card = new SugarTvCard();
            card.hass = {
                language: 'en',
                states: {
                    [valueEntity]: {
                        state: '120',
                        attributes: { unit_of_measurement: 'mg/dL' },
                        last_changed: iso(12 * MINUTE),
                        last_updated: iso(12 * MINUTE),
                    },
                    [siblingEntity]: {
                        state: siblingState,
                        last_updated: iso(siblingUpdatedMsAgo),
                        last_changed: iso(siblingUpdatedMsAgo),
                    },
                },
            };
            card.config = { glucose_value: valueEntity };
            card._data = card._getInitialDataState();
            return card;
        }

        const CARELINK = 'sensor.carelink_pump_last_glucose_level_mg_dl';
        const CARELINK_TIME = 'sensor.carelink_pump_last_glucose_update';
        const LIBRELINK = 'sensor.john_doe_glucose_measurement';
        const LIBRELINK_AGE = 'sensor.john_doe_minutes_since_update';

        it('reads the Carelink last glucose update entity', () => {
            const measured = iso(4 * MINUTE);
            const card = withSibling(CARELINK, CARELINK_TIME, measured);

            expect(card._getCurrentState(CARELINK).reading_time).toBe(measured);
        });

        it('handles the mmol Carelink entity', () => {
            const measured = iso(4 * MINUTE);
            const card = withSibling(
                'sensor.carelink_pump_last_glucose_level_mmol',
                CARELINK_TIME,
                measured,
            );

            expect(
                card._getCurrentState(
                    'sensor.carelink_pump_last_glucose_level_mmol',
                ).reading_time,
            ).toBe(measured);
        });

        // HA has composed this object id three different ways over time, and
        // an install keeps whatever id it was first registered with.
        it.each([
            [
                'pre-2026-02 Carelink',
                'sensor.last_glucose_level_mg_dl',
                'sensor.last_glucose_update',
            ],
            [
                'patient-named',
                'sensor.carelink_john_doe_last_glucose_level_mg_dl',
                'sensor.carelink_john_doe_last_glucose_update',
            ],
            [
                'HA 2026.4+ device-prefixed',
                'sensor.john_doe_carelink_john_doe_last_glucose_level_mg_dl',
                'sensor.john_doe_carelink_john_doe_last_glucose_update',
            ],
        ])('resolves the %s entity id shape', (_name, value, sibling) => {
            const measured = iso(4 * MINUTE);
            const card = withSibling(value, sibling, measured);

            expect(card._getCurrentState(value).reading_time).toBe(measured);
        });

        it('falls back when the Carelink sibling is unavailable', () => {
            const card = withSibling(CARELINK, CARELINK_TIME, 'unavailable');

            expect(card._getCurrentState(CARELINK).reading_time).toBe(
                card.hass.states[CARELINK].last_updated,
            );
        });

        it('derives a timestamp from LibreLink minutes since update', () => {
            const card = withSibling(LIBRELINK, LIBRELINK_AGE, '3');

            const resolved = new Date(
                card._getCurrentState(LIBRELINK).reading_time,
            ).getTime();
            const expected = Date.now() - 3 * MINUTE;
            expect(Math.abs(resolved - expected)).toBeLessThan(2000);
        });

        it('lets a frozen age sibling go stale instead of pinning it fresh', () => {
            // If the integration stops polling, minutes_since_update freezes.
            // Anchoring the age to the wall clock would hold the reading at
            // "3 minutes ago" forever, so a dead sensor would never dim.
            const card = withSibling(
                LIBRELINK,
                LIBRELINK_AGE,
                '3',
                40 * MINUTE,
            );

            const resolved = card._getCurrentState(LIBRELINK).reading_time;
            expect(card._isStale(resolved)).toBe(true);
        });

        it('anchors the age to when the sibling last reported', () => {
            const card = withSibling(LIBRELINK, LIBRELINK_AGE, '3', 2 * MINUTE);

            const resolved = new Date(
                card._getCurrentState(LIBRELINK).reading_time,
            ).getTime();
            // Reported 2 minutes ago, and the reading was 3 minutes old then.
            const expected = Date.now() - 5 * MINUTE;
            expect(Math.abs(resolved - expected)).toBeLessThan(2000);
        });

        it.each([
            ['-118', 'the timezone gap reported in gillesvs/librelink#27'],
            ['120', 'a server two hours ahead of the account'],
            ['600', 'a wildly skewed clock'],
            ['not a number', 'garbage'],
        ])('ignores an age of %s minutes: %s', (age) => {
            // The integration subtracts a device-local reading time from the
            // server's local clock, so the error is the offset between the two
            // timezones. It cannot be told apart from an old reading, so an age
            // past the staleness threshold is not trusted at all.
            const card = withSibling(LIBRELINK, LIBRELINK_AGE, age);

            expect(card._getCurrentState(LIBRELINK).reading_time).toBe(
                card.hass.states[LIBRELINK].last_updated,
            );
        });

        it('falls back when the sibling entity does not exist', () => {
            const card = withSibling(CARELINK, 'sensor.unrelated', iso(0));

            expect(card._getCurrentState(CARELINK).reading_time).toBe(
                card.hass.states[CARELINK].last_updated,
            );
        });
    });

    // ────────────────────────────────────────────────────────────────
    // Degraded states must not regress.
    // ────────────────────────────────────────────────────────────────
    describe('fallback chain', () => {
        it('falls back to last_changed when last_updated is absent', () => {
            const changed = iso(12 * MINUTE);
            const card = createCard({}, { last_changed: changed });

            expect(card._getCurrentState(ENTITY).reading_time).toBe(changed);
        });

        it('returns null when the state carries no timestamps at all', () => {
            const card = createCard({}, {});

            expect(card._getCurrentState(ENTITY).reading_time).toBeNull();
        });

        it('does not throw when attributes are missing entirely', () => {
            const card = new SugarTvCard();
            card.hass = {
                language: 'en',
                states: { [ENTITY]: { state: '120' } },
            };
            card.config = { glucose_value: ENTITY };
            card._data = card._getInitialDataState();

            expect(() => card._getCurrentState(ENTITY)).not.toThrow();
        });
    });
});
