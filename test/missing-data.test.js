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
// MISSING DATA TESTS
// ═══════════════════════════════════════════════════════════════════════

describe('Missing data scenarios', () => {
    // ────────────────────────────────────────────────────────────────
    // 1. Entity completely absent from hass.states
    // ────────────────────────────────────────────────────────────────
    describe('Entity not found in hass.states', () => {
        it('_validateEntities returns false when entity is missing', () => {
            const card = createCard({}, { states: {} });
            expect(card._validateEntities('sensor.dexcom_glucose_value')).toBe(
                false,
            );
        });

        it('_validateEntities sets fallback data when entity is missing', () => {
            const card = createCard({}, { states: {} });
            card._validateEntities('sensor.dexcom_glucose_value');
            expect(card._data.value).toBeNull();
            expect(card._data.last_changed).toBeNull();
            expect(card._data.trend).toBe('unknown');
            expect(card._data.unit).toBe('mg/dL');
        });

        it('_validateEntities resets previous_value to null on missing entity', () => {
            const card = createCard({}, { states: {} });
            card._data.previous_value = '120';
            card._data.previous_last_changed = new Date().toISOString();
            card._validateEntities('sensor.dexcom_glucose_value');
            expect(card._data.previous_value).toBeNull();
            expect(card._data.previous_last_changed).toBeNull();
        });

        it('_validateEntities returns true when entity exists', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                    },
                },
            );
            expect(card._validateEntities('sensor.dexcom_glucose_value')).toBe(
                true,
            );
        });

        it('_updateData does nothing when entity is missing', () => {
            const card = createCard({}, { states: {} });
            const dataBefore = { ...card._data };
            card._updateData();
            // Should have set fallback values
            expect(card._data.trend).toBe('unknown');
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 2. Entity state is "unknown"
    // ────────────────────────────────────────────────────────────────
    describe('Entity state is "unknown"', () => {
        let card;
        beforeEach(() => {
            card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: 'unknown',
                            attributes: { unit_of_measurement: 'mg/dL' },
                            last_changed: new Date().toISOString(),
                        },
                    },
                },
            );
        });

        it('_isValidValue returns false for "unknown"', () => {
            expect(card._isValidValue('unknown')).toBe(false);
        });

        it('_formatValue returns N/A for "unknown"', () => {
            expect(card._formatValue('unknown')).toBe('N/A');
        });

        it('_getGlucoseZone returns empty string for "unknown"', () => {
            card._data.unit = 'mg/dL';
            expect(card._getGlucoseZone('unknown')).toBe('');
        });

        it('_calculateDelta returns null when current value is "unknown"', () => {
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: 'unknown',
                previous_value: '110',
                last_changed: new Date().toISOString(),
                previous_last_changed: fiveMinAgo,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });

        it('_calculateDelta returns null when previous value is "unknown"', () => {
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: '120',
                previous_value: 'unknown',
                last_changed: new Date().toISOString(),
                previous_last_changed: fiveMinAgo,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 3. Entity state is "unavailable"
    // ────────────────────────────────────────────────────────────────
    describe('Entity state is "unavailable"', () => {
        let card;
        beforeEach(() => {
            card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: 'unavailable',
                            attributes: { unit_of_measurement: 'mg/dL' },
                            last_changed: new Date().toISOString(),
                        },
                    },
                },
            );
        });

        it('_isValidValue returns false for "unavailable"', () => {
            expect(card._isValidValue('unavailable')).toBe(false);
        });

        it('_formatValue returns N/A for "unavailable"', () => {
            expect(card._formatValue('unavailable')).toBe('N/A');
        });

        it('_getGlucoseZone returns empty string for "unavailable"', () => {
            card._data.unit = 'mg/dL';
            expect(card._getGlucoseZone('unavailable')).toBe('');
        });

        it('_calculateDelta returns null when current is "unavailable"', () => {
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: 'unavailable',
                previous_value: '110',
                last_changed: new Date().toISOString(),
                previous_last_changed: fiveMinAgo,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });

        it('_calculateDelta returns null when previous is "unavailable"', () => {
            const fiveMinAgo = new Date(
                Date.now() - 5 * 60 * 1000,
            ).toISOString();
            card._data = {
                ...card._data,
                value: '120',
                previous_value: 'unavailable',
                last_changed: new Date().toISOString(),
                previous_last_changed: fiveMinAgo,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 4. Entity state is null / undefined / empty string
    // ────────────────────────────────────────────────────────────────
    describe('Entity state is null / undefined / empty', () => {
        let card;
        beforeEach(() => {
            card = createCard();
            card._data.unit = 'mg/dL';
        });

        it.each([null, undefined, ''])(
            '_isValidValue returns falsy for %s',
            (val) => {
                expect(card._isValidValue(val)).toBeFalsy();
            },
        );

        it.each([null, undefined, ''])(
            '_formatValue returns N/A for %s',
            (val) => {
                expect(card._formatValue(val)).toBe('N/A');
            },
        );

        it.each([null, undefined, ''])(
            '_getGlucoseZone returns empty string for %s',
            (val) => {
                expect(card._getGlucoseZone(val)).toBe('');
            },
        );

        it('_calculateDelta returns null when current value is null', () => {
            card._data = {
                ...card._data,
                value: null,
                previous_value: '110',
                last_changed: new Date().toISOString(),
                previous_last_changed: new Date(
                    Date.now() - 5 * 60 * 1000,
                ).toISOString(),
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });

        it('_calculateDelta returns null when previous value is null', () => {
            card._data = {
                ...card._data,
                value: '120',
                previous_value: null,
                last_changed: new Date().toISOString(),
                previous_last_changed: new Date(
                    Date.now() - 5 * 60 * 1000,
                ).toISOString(),
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });

        it('_calculateDelta returns null when both values are null', () => {
            card._data = {
                ...card._data,
                value: null,
                previous_value: null,
                last_changed: new Date().toISOString(),
                previous_last_changed: new Date(
                    Date.now() - 5 * 60 * 1000,
                ).toISOString(),
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 5. Timestamp (last_changed) missing or invalid
    // ────────────────────────────────────────────────────────────────
    describe('Timestamp (last_changed) missing or invalid', () => {
        let card;
        beforeEach(() => {
            card = createCard();
        });

        it('_isStale returns true when timestamp is null', () => {
            expect(card._isStale(null)).toBe(true);
        });

        it('_isStale returns true when timestamp is undefined', () => {
            expect(card._isStale(undefined)).toBe(true);
        });

        it('_isStale returns true when timestamp is "unknown"', () => {
            expect(card._isStale('unknown')).toBe(true);
        });

        it('_isStale returns true when timestamp is "unavailable"', () => {
            expect(card._isStale('unavailable')).toBe(true);
        });

        it('_isStale returns true when timestamp is empty string', () => {
            expect(card._isStale('')).toBe(true);
        });

        it('_formatTime returns default time for null timestamp', () => {
            const result = card._formatTime(null);
            expect(result).toBeTruthy(); // Should return a localized default
        });

        it('_formatTime returns default time for "unknown" timestamp', () => {
            const result = card._formatTime('unknown');
            expect(result).toBeTruthy();
        });

        it('_formatTime returns default time for "unavailable" timestamp', () => {
            const result = card._formatTime('unavailable');
            expect(result).toBeTruthy();
        });

        it('_calculateDelta returns null when timestamps are identical', () => {
            const now = new Date().toISOString();
            card._data = {
                ...card._data,
                value: '120',
                previous_value: '110',
                last_changed: now,
                previous_last_changed: now,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });

        it('_calculateDelta returns null when last_changed is null', () => {
            card._data = {
                ...card._data,
                value: '120',
                previous_value: '110',
                last_changed: null,
                previous_last_changed: new Date(
                    Date.now() - 5 * 60 * 1000,
                ).toISOString(),
                unit: 'mg/dL',
            };
            // last_changed === null, same as previous_last_changed? No.
            // But _isValidValue checks are done first, nulls pass differently
            // The real check: null !== string, so it proceeds to time diff calculation
            // new Date(null) = epoch, which will make timeDiff very large => null
            expect(card._calculateDelta()).toBeNull();
        });

        it('_calculateDelta returns null when previous_last_changed is null', () => {
            card._data = {
                ...card._data,
                value: '120',
                previous_value: '110',
                last_changed: new Date().toISOString(),
                previous_last_changed: null,
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 6. Stale data (sensor hasn't updated in > 15 minutes)
    // ────────────────────────────────────────────────────────────────
    describe('Stale data (last_changed > 15 minutes ago)', () => {
        let card;
        beforeEach(() => {
            card = createCard();
        });

        it('_isStale returns true for 16-minute-old timestamp', () => {
            const old = new Date(Date.now() - 16 * 60 * 1000).toISOString();
            expect(card._isStale(old)).toBe(true);
        });

        it('_isStale returns true for 1-hour-old timestamp', () => {
            const old = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            expect(card._isStale(old)).toBe(true);
        });

        it('_isStale returns true for 24-hour-old timestamp', () => {
            const old = new Date(
                Date.now() - 24 * 60 * 60 * 1000,
            ).toISOString();
            expect(card._isStale(old)).toBe(true);
        });

        it('_isStale returns false at exactly 15 minutes (boundary)', () => {
            const boundary = new Date(
                Date.now() - 15 * 60 * 1000,
            ).toISOString();
            expect(card._isStale(boundary)).toBe(false);
        });

        it('_isStale returns false for 14-minute-old timestamp', () => {
            const recent = new Date(Date.now() - 14 * 60 * 1000).toISOString();
            expect(card._isStale(recent)).toBe(false);
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 7. Trend data missing
    // ────────────────────────────────────────────────────────────────
    describe('Trend data missing', () => {
        it('returns "unknown" when no trend entity or attribute exists', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.some_glucose': {
                            state: '120',
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

        it('returns "unknown" when config.glucose_trend entity does not exist in hass', () => {
            const card = createCard(
                { glucose_trend: 'sensor.nonexistent_trend' },
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                    },
                },
            );
            const glucoseState =
                card.hass.states['sensor.dexcom_glucose_value'];
            // The YAML override entity doesn't exist, so it falls through
            expect(
                card._resolveTrend('sensor.dexcom_glucose_value', glucoseState),
            ).toBe('unknown');
        });

        it('returns "unknown" when trend entity state is "unknown"', () => {
            const card = createCard(
                { glucose_trend: 'sensor.my_trend' },
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                        'sensor.my_trend': { state: 'unknown' },
                    },
                },
            );
            const glucoseState =
                card.hass.states['sensor.dexcom_glucose_value'];
            // normalizeTrend('unknown') — 'unknown' is not in TREND_MAP,
            // but it's a non-empty string so it goes through lowercase → 'unknown'
            expect(
                card._resolveTrend('sensor.dexcom_glucose_value', glucoseState),
            ).toBe('unknown');
        });

        it('returns "unknown" when trend entity state is "unavailable"', () => {
            const card = createCard(
                { glucose_trend: 'sensor.my_trend' },
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                        'sensor.my_trend': { state: 'unavailable' },
                    },
                },
            );
            const glucoseState =
                card.hass.states['sensor.dexcom_glucose_value'];
            expect(
                card._resolveTrend('sensor.dexcom_glucose_value', glucoseState),
            ).toBe('unknown');
        });

        it('_normalizeTrend returns "unknown" for null', () => {
            const card = createCard();
            expect(card._normalizeTrend(null)).toBe('unknown');
        });

        it('_normalizeTrend returns "unknown" for undefined', () => {
            const card = createCard();
            expect(card._normalizeTrend(undefined)).toBe('unknown');
        });

        it('_normalizeTrend returns "unknown" for empty string', () => {
            const card = createCard();
            expect(card._normalizeTrend('')).toBe('unknown');
        });

        it('Dexcom sibling trend entity missing from hass.states', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_user_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                        // sensor.dexcom_user_glucose_trend does NOT exist
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
            ).toBe('unknown');
        });

        it('Carelink sibling trend entity missing from hass.states', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.carelink_john_last_sg_mgdl': {
                            state: '150',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                        // sensor.carelink_john_last_sg_trend does NOT exist
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
            ).toBe('unknown');
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 8. No history data / history API failure
    // ────────────────────────────────────────────────────────────────
    describe('No history data available', () => {
        it('_fetchPreviousFromHistory does not update data when history returns empty', async () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                            last_changed: new Date().toISOString(),
                        },
                    },
                    callWS: vi.fn().mockResolvedValue({
                        'sensor.dexcom_glucose_value': [],
                    }),
                },
            );
            card._data.last_changed = new Date().toISOString();
            await card._fetchPreviousFromHistory();
            expect(card._data.previous_value).toBeNull();
        });

        it('_fetchPreviousFromHistory does not update data when history returns null array', async () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                            last_changed: new Date().toISOString(),
                        },
                    },
                    callWS: vi.fn().mockResolvedValue({
                        'sensor.dexcom_glucose_value': null,
                    }),
                },
            );
            card._data.last_changed = new Date().toISOString();
            await card._fetchPreviousFromHistory();
            expect(card._data.previous_value).toBeNull();
        });

        it('_fetchPreviousFromHistory does not update data when history has only 1 entry', async () => {
            const now = Date.now();
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                            last_changed: new Date(now).toISOString(),
                        },
                    },
                    callWS: vi.fn().mockResolvedValue({
                        'sensor.dexcom_glucose_value': [
                            { s: '120', lu: now / 1000 },
                        ],
                    }),
                },
            );
            card._data.last_changed = new Date(now).toISOString();
            await card._fetchPreviousFromHistory();
            expect(card._data.previous_value).toBeNull();
        });

        it('_fetchPreviousFromHistory gracefully handles callWS error', async () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                            last_changed: new Date().toISOString(),
                        },
                    },
                    callWS: vi
                        .fn()
                        .mockRejectedValue(new Error('Recorder not available')),
                },
            );
            card._data.last_changed = new Date().toISOString();
            // Should not throw
            await expect(
                card._fetchPreviousFromHistory(),
            ).resolves.not.toThrow();
            expect(card._data.previous_value).toBeNull();
        });

        it('_fetchPreviousFromHistory skips history entries with invalid values', async () => {
            const now = Date.now();
            const currentTime = now / 1000;
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                            last_changed: new Date(now).toISOString(),
                        },
                    },
                    callWS: vi.fn().mockResolvedValue({
                        'sensor.dexcom_glucose_value': [
                            {
                                s: 'unknown',
                                lu: currentTime - 5 * 60,
                            },
                            {
                                s: 'unavailable',
                                lu: currentTime - 4 * 60,
                            },
                            { s: '120', lu: currentTime },
                        ],
                    }),
                },
            );
            card._data.last_changed = new Date(now).toISOString();
            await card._fetchPreviousFromHistory();
            // 'unknown' and 'unavailable' are skipped, only the current reading
            // is left — but we skip it because it matches current time,
            // so no previous value is set
            expect(card._data.previous_value).toBeNull();
        });

        it('_fetchPreviousFromHistory skips history entries without timestamps', async () => {
            const now = Date.now();
            const currentTime = now / 1000;
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '130',
                            attributes: { unit_of_measurement: 'mg/dL' },
                            last_changed: new Date(now).toISOString(),
                        },
                    },
                    callWS: vi.fn().mockResolvedValue({
                        'sensor.dexcom_glucose_value': [
                            // Entry with no timestamp fields at all
                            { s: '110' },
                            { s: '130', lu: currentTime },
                        ],
                    }),
                },
            );
            card._data.last_changed = new Date(now).toISOString();
            await card._fetchPreviousFromHistory();
            // The entry without timestamp is skipped, only current remains
            expect(card._data.previous_value).toBeNull();
        });

        it('_fetchPreviousFromHistory finds valid previous from mixed history', async () => {
            const now = Date.now();
            const currentTime = now / 1000;
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '130',
                            attributes: { unit_of_measurement: 'mg/dL' },
                            last_changed: new Date(now).toISOString(),
                        },
                    },
                    callWS: vi.fn().mockResolvedValue({
                        'sensor.dexcom_glucose_value': [
                            {
                                s: 'unavailable',
                                lu: currentTime - 10 * 60,
                            },
                            {
                                s: '115',
                                lu: currentTime - 5 * 60,
                            },
                            { s: '130', lu: currentTime },
                        ],
                    }),
                },
            );
            card._data.last_changed = new Date(now).toISOString();
            await card._fetchPreviousFromHistory();
            // Should pick up the valid '115' entry, skipping 'unavailable'
            expect(card._data.previous_value).toBe('115');
        });

        it('_fetchPreviousFromHistory entity missing from history response', async () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                            last_changed: new Date().toISOString(),
                        },
                    },
                    callWS: vi.fn().mockResolvedValue({}),
                },
            );
            card._data.last_changed = new Date().toISOString();
            await card._fetchPreviousFromHistory();
            expect(card._data.previous_value).toBeNull();
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 9. History throttling — no double-fetch
    // ────────────────────────────────────────────────────────────────
    describe('History fetch throttling', () => {
        it('does not fetch history again within 30 seconds', async () => {
            const callWS = vi.fn().mockResolvedValue({
                'sensor.dexcom_glucose_value': [],
            });
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                            last_changed: new Date().toISOString(),
                        },
                    },
                    callWS,
                },
            );
            card._data.last_changed = new Date().toISOString();

            await card._fetchPreviousFromHistory();
            expect(callWS).toHaveBeenCalledTimes(1);

            // Second call should be throttled
            await card._fetchPreviousFromHistory();
            expect(callWS).toHaveBeenCalledTimes(1);
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 10. hass or config not yet set
    // ────────────────────────────────────────────────────────────────
    describe('hass or config not yet available', () => {
        it('_updateData returns early when hass is null', () => {
            const card = createCard();
            card.hass = null;
            // Should not throw
            expect(() => card._updateData()).not.toThrow();
        });

        it('_updateData returns early when config is null', () => {
            const card = createCard();
            card.config = null;
            expect(() => card._updateData()).not.toThrow();
        });

        it('_updateData returns early when both are null', () => {
            const card = createCard();
            card.hass = null;
            card.config = null;
            expect(() => card._updateData()).not.toThrow();
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 11. unit_of_measurement attribute missing
    // ────────────────────────────────────────────────────────────────
    describe('unit_of_measurement attribute missing', () => {
        it('_getCurrentState reads unit from attributes even if missing', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.dexcom_glucose_value': {
                            state: '120',
                            attributes: {},
                            last_changed: new Date().toISOString(),
                        },
                    },
                },
            );
            const currentState = card._getCurrentState(
                'sensor.dexcom_glucose_value',
            );
            // unit will be undefined — the card should still function
            expect(currentState.value).toBe('120');
            expect(currentState.unit).toBeUndefined();
        });

        it('_getGlucoseZone still works with default thresholds when unit is missing', () => {
            const card = createCard();
            card._data.unit = undefined;
            // Falls back to mg/dL thresholds
            expect(card._getGlucoseZone('120')).toBe('');
            expect(card._getGlucoseZone('40')).toBe('zone-urgent-low');
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 12. Delta with time-gap edge cases
    // ────────────────────────────────────────────────────────────────
    describe('Delta calculation with problematic time gaps', () => {
        let card;
        beforeEach(() => {
            card = createCard();
        });

        it('returns null when time gap exceeds 9 minutes', () => {
            card._data = {
                ...card._data,
                value: '130',
                previous_value: '120',
                last_changed: new Date().toISOString(),
                previous_last_changed: new Date(
                    Date.now() - 10 * 60 * 1000,
                ).toISOString(),
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });

        it('returns delta when time gap is exactly 9 minutes (boundary)', () => {
            const now = Date.now();
            card._data = {
                ...card._data,
                value: '130',
                previous_value: '120',
                last_changed: new Date(now).toISOString(),
                previous_last_changed: new Date(
                    now - 9 * 60 * 1000 + 1, // just under 9 minutes
                ).toISOString(),
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBe('＋10');
        });

        it('returns null when time gap is exactly 9 minutes (540000ms)', () => {
            const now = Date.now();
            card._data = {
                ...card._data,
                value: '130',
                previous_value: '120',
                last_changed: new Date(now).toISOString(),
                previous_last_changed: new Date(now - 540000).toISOString(),
                unit: 'mg/dL',
            };
            // >= 540000 means null
            expect(card._calculateDelta()).toBeNull();
        });

        it('returns delta for standard 5-minute interval', () => {
            const now = Date.now();
            card._data = {
                ...card._data,
                value: '130',
                previous_value: '120',
                last_changed: new Date(now).toISOString(),
                previous_last_changed: new Date(
                    now - 5 * 60 * 1000,
                ).toISOString(),
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBe('＋10');
        });

        it('returns null for zero delta when timestamps are the same', () => {
            const now = new Date().toISOString();
            card._data = {
                ...card._data,
                value: '120',
                previous_value: '120',
                last_changed: now,
                previous_last_changed: now,
                unit: 'mg/dL',
            };
            // same timestamps → null regardless of values
            expect(card._calculateDelta()).toBeNull();
        });

        it('handles NaN values in delta calculation', () => {
            const now = Date.now();
            card._data = {
                ...card._data,
                value: 'not_a_number',
                previous_value: '120',
                last_changed: new Date(now).toISOString(),
                previous_last_changed: new Date(
                    now - 5 * 60 * 1000,
                ).toISOString(),
                unit: 'mg/dL',
            };
            // _isValidValue('not_a_number') is true (it's not 'unknown'/'unavailable'/null)
            // but parseFloat('not_a_number') is NaN, so returns null
            expect(card._calculateDelta()).toBeNull();
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 13. Initial data state
    // ────────────────────────────────────────────────────────────────
    describe('Initial data state (before any sensor data)', () => {
        it('_getInitialDataState has all null values except unit', () => {
            const card = createCard();
            const initial = card._getInitialDataState();
            expect(initial.value).toBeNull();
            expect(initial.last_changed).toBeNull();
            expect(initial.trend).toBeNull();
            expect(initial.previous_value).toBeNull();
            expect(initial.previous_last_changed).toBeNull();
            expect(initial.previous_trend).toBeNull();
            expect(initial.unit).toBe('mg/dL');
        });

        it('_formatValue returns N/A for initial null value', () => {
            const card = createCard();
            expect(card._formatValue(card._data.value)).toBe('N/A');
        });

        it('_calculateDelta returns null for initial state', () => {
            const card = createCard();
            expect(card._calculateDelta()).toBeNull();
        });

        it('_isStale returns true for initial null timestamp', () => {
            const card = createCard();
            expect(card._isStale(card._data.last_changed)).toBe(true);
        });

        it('_getGlucoseZone returns empty for initial null value', () => {
            const card = createCard();
            expect(card._getGlucoseZone(card._data.value)).toBe('');
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 14. Sensor becomes unavailable after providing valid data
    // ────────────────────────────────────────────────────────────────
    describe('Sensor transitions from valid to missing data', () => {
        it('_updateCurrentData overwrites valid value with unavailable state', () => {
            const card = createCard();
            // Simulate having good data first
            card._data = {
                ...card._data,
                value: '120',
                last_changed: new Date().toISOString(),
                trend: 'steady',
                unit: 'mg/dL',
            };
            // Sensor goes unavailable
            card._updateCurrentData({
                value: 'unavailable',
                last_changed: new Date().toISOString(),
                trend: 'unknown',
                unit: 'mg/dL',
            });
            expect(card._data.value).toBe('unavailable');
            expect(card._data.trend).toBe('unknown');
        });

        it('previous_value survives when current becomes unavailable', () => {
            const card = createCard();
            card._data = {
                ...card._data,
                value: 'unavailable',
                previous_value: '120',
                previous_last_changed: new Date(
                    Date.now() - 5 * 60 * 1000,
                ).toISOString(),
                last_changed: new Date().toISOString(),
                trend: 'unknown',
                unit: 'mg/dL',
            };
            // previous_value should still be preserved
            expect(card._data.previous_value).toBe('120');
            // but delta should return null because current is invalid
            expect(card._calculateDelta()).toBeNull();
        });

        it('_formatValue handles transition from number to unavailable', () => {
            const card = createCard();
            card._data.unit = 'mg/dL';
            expect(card._formatValue('120')).toBe('120');
            expect(card._formatValue('unavailable')).toBe('N/A');
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 15. Sensor returns non-numeric garbage
    // ────────────────────────────────────────────────────────────────
    describe('Sensor returns non-numeric garbage values', () => {
        let card;
        beforeEach(() => {
            card = createCard();
            card._data.unit = 'mg/dL';
        });

        it('_formatValue returns N/A for string garbage', () => {
            expect(card._formatValue('abc')).toBe('N/A');
        });

        it('_formatValue returns N/A for emoji', () => {
            expect(card._formatValue('😊')).toBe('N/A');
        });

        it('_getGlucoseZone returns empty for non-numeric strings', () => {
            expect(card._getGlucoseZone('abc')).toBe('');
        });

        it('_isValidValue returns true for garbage (not unknown/unavailable)', () => {
            // Note: _isValidValue only checks for null, 'unknown', 'unavailable'
            // It does NOT validate that the value is numeric
            expect(card._isValidValue('abc')).toBe(true);
        });

        it('_calculateDelta returns null when values parse to NaN', () => {
            const now = Date.now();
            card._data = {
                ...card._data,
                value: 'abc',
                previous_value: 'def',
                last_changed: new Date(now).toISOString(),
                previous_last_changed: new Date(
                    now - 5 * 60 * 1000,
                ).toISOString(),
                unit: 'mg/dL',
            };
            expect(card._calculateDelta()).toBeNull();
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 16. Attributes object completely missing
    // ────────────────────────────────────────────────────────────────
    describe('Attributes object edge cases', () => {
        it('_resolveTrend handles missing direction and trend attributes gracefully', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.glucose': {
                            state: '120',
                            attributes: { unit_of_measurement: 'mg/dL' },
                        },
                    },
                },
            );
            card.config.glucose_value = 'sensor.glucose';
            const glucoseState = card.hass.states['sensor.glucose'];
            expect(card._resolveTrend('sensor.glucose', glucoseState)).toBe(
                'unknown',
            );
        });

        it('_resolveTrend with direction attribute set to empty string', () => {
            const card = createCard(
                {},
                {
                    states: {
                        'sensor.glucose': {
                            state: '120',
                            attributes: {
                                unit_of_measurement: 'mg/dL',
                                direction: '',
                            },
                        },
                    },
                },
            );
            card.config.glucose_value = 'sensor.glucose';
            const glucoseState = card.hass.states['sensor.glucose'];
            // Empty direction is falsy, falls through to next check
            expect(card._resolveTrend('sensor.glucose', glucoseState)).toBe(
                'unknown',
            );
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 17. render() integration with missing data
    // ────────────────────────────────────────────────────────────────
    describe('render() with missing data', () => {
        it('renders without throwing when all data is initial/null', () => {
            const card = createCard();
            expect(() => card.render()).not.toThrow();
        });

        it('renders without throwing when value is "unknown"', () => {
            const card = createCard();
            card._data = {
                ...card._data,
                value: 'unknown',
                last_changed: new Date().toISOString(),
                trend: 'unknown',
                unit: 'mg/dL',
            };
            expect(() => card.render()).not.toThrow();
        });

        it('renders without throwing when value is "unavailable"', () => {
            const card = createCard();
            card._data = {
                ...card._data,
                value: 'unavailable',
                last_changed: null,
                trend: null,
                unit: 'mg/dL',
            };
            expect(() => card.render()).not.toThrow();
        });

        it('renders without throwing when everything is missing', () => {
            const card = createCard();
            card._data = {
                value: null,
                last_changed: null,
                trend: null,
                unit: null,
                previous_value: null,
                previous_last_changed: null,
                previous_trend: null,
            };
            expect(() => card.render()).not.toThrow();
        });

        it('does not apply zone class when value is invalid', () => {
            const card = createCard();
            card._data = {
                ...card._data,
                value: 'unknown',
                trend: 'unknown',
                unit: 'mg/dL',
            };
            card.render();
            // className should not contain zone-* classes
            expect(card.className).not.toContain('zone-');
        });

        it('applies stale class when timestamp is null', () => {
            const card = createCard();
            card._data = {
                ...card._data,
                value: '120',
                last_changed: null,
                trend: 'steady',
                unit: 'mg/dL',
            };
            card.render();
            expect(card.className).toContain('stale');
        });

        it('applies stale class when timestamp is old', () => {
            const card = createCard();
            card._data = {
                ...card._data,
                value: '120',
                last_changed: new Date(
                    Date.now() - 20 * 60 * 1000,
                ).toISOString(),
                trend: 'steady',
                unit: 'mg/dL',
            };
            card.render();
            expect(card.className).toContain('stale');
        });
    });

    // ────────────────────────────────────────────────────────────────
    // 18. setConfig with sensor that doesn't exist yet
    // ────────────────────────────────────────────────────────────────
    describe('setConfig before hass is set', () => {
        it('sets default mg/dL thresholds when hass is not yet available', () => {
            const card = new SugarTvCard();
            // hass not set yet
            card.setConfig({ glucose_value: 'sensor.test' });
            expect(card.config.thresholds).toEqual({
                urgent_low: 54,
                low: 70,
                high: 180,
                urgent_high: 250,
            });
        });

        it('does not throw when hass.states is undefined', () => {
            const card = new SugarTvCard();
            card.hass = {};
            expect(() =>
                card.setConfig({ glucose_value: 'sensor.test' }),
            ).not.toThrow();
        });

        it('does not throw when hass.states[entity] is undefined', () => {
            const card = new SugarTvCard();
            card.hass = { states: {} };
            expect(() =>
                card.setConfig({ glucose_value: 'sensor.nonexistent' }),
            ).not.toThrow();
        });
    });
});
