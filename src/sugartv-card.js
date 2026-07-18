import { LitElement, html, css } from 'lit';

import { cardStyles } from './sugartv-card-styles.js';
import { getLocalizer } from './localize.js';
import {
    TREND_MAP as TREND_MAP_DATA,
    VALUE_SUFFIXES,
    normalizeTrend,
    resolveTrend,
    siblingEntityId,
} from './trend.js';

const VERSION = process.env.VERSION;

class SugarTvCard extends LitElement {
    static UNITS = {
        MGDL: 'mg/dL',
        MMOLL: 'mmol/L',
    };

    static UNIT_ALIASES = {
        'mg/dl': 'mg/dL',
        'mmol/l': 'mmol/L',
    };

    // HA integrations vary on casing; fall back to mg/dL for missing/unknown.
    static normalizeUnit(unit) {
        if (!unit) return SugarTvCard.UNITS.MGDL;
        return (
            SugarTvCard.UNIT_ALIASES[String(unit).toLowerCase()] ||
            SugarTvCard.UNITS.MGDL
        );
    }

    /*
     * Thresholds that are exactly another unit's defaults are not a choice
     * anyone made: they were filled in before the unit was known, either by an
     * older setConfig or by getStubConfig when the card was added through the
     * UI. Honouring them would compare a mmol reading against mg/dL numbers, so
     * a normal 8.1 shows as urgent low and a dangerous 14.0 shows as urgent low
     * too. Drop them and let this unit's defaults apply.
     */
    static thresholdsForUnit(thresholds, unit) {
        if (!thresholds) return {};
        const isDefaultsOf = (candidate) =>
            Object.entries(SugarTvCard.DEFAULT_THRESHOLDS[candidate]).every(
                ([key, value]) => Number(thresholds[key]) === value,
            );
        const foreign = Object.keys(SugarTvCard.DEFAULT_THRESHOLDS).some(
            (candidate) => candidate !== unit && isDefaultsOf(candidate),
        );
        return foreign ? {} : thresholds;
    }

    // Must match the stylesheet: .value is sized at 20u and .container is
    // padded by 5u a side. _measureValueWidth uses both to turn a measured
    // pixel width back into units.
    static VALUE_UNITS = 20;
    static PADDING_UNITS = 5;

    // The longest reading each unit can render: "400" and "22.2". The width
    // budget is sized for these so the number keeps one size across readings.
    static WIDEST_MGDL_CHARS = 3;
    static WIDEST_MMOL_CHARS = 4;

    // Set by both core glucose integrations, and by nothing else in core.
    static GLUCOSE_DEVICE_CLASS = 'blood_glucose_concentration';

    // Attributes carrying the true measurement time. Only the PTST libreview
    // integration is known to publish one; Dexcom exposes no attributes on the
    // glucose sensor at all, which is why timestamp_attribute exists as an
    // escape hatch.
    static TIMESTAMP_ATTRIBUTES = ['measurement_timestamp'];

    // Integrations that keep the reading time in a sibling entity instead of an
    // attribute. Entity ids are slugified from the integration's entity NAMES,
    // not its internal keys: Carelink's `last_sg_timestamp` key is published as
    // "Last glucose update".
    static TIMESTAMP_SIBLINGS = [
        // Carelink (Medtronic)
        [VALUE_SUFFIXES.carelinkMgdl, 'last_glucose_update'],
        [VALUE_SUFFIXES.carelinkMmol, 'last_glucose_update'],
    ];

    // Siblings reporting an age in minutes rather than a timestamp.
    static AGE_SIBLINGS = [
        // LibreLink (gillesvs)
        [VALUE_SUFFIXES.librelink, 'minutes_since_update'],
    ];

    // LibreLink derives its age by subtracting a device-local reading time from
    // the HA server's local clock, so it is wrong by the offset between the two
    // timezones (gillesvs/librelink#27 reports -118 minutes from Poland). The
    // error cannot be told apart from a genuinely old reading, so only trust an
    // age below the staleness threshold, where a timezone gap of even 15 minutes
    // cannot hide. Above it, both this and last_updated say "stale" anyway.
    static MAX_SIBLING_AGE_MINUTES = 15;

    // Epoch values arrive in seconds from some integrations and milliseconds
    // from others. Anything below this bound is too small to be a modern
    // millisecond value, so treat it as seconds.
    static EPOCH_SECONDS_BOUND = 1e11;

    // A reading is stale once this many polling intervals have been missed.
    // Three is the ratio the hard-coded 15 minutes already encoded for a 5
    // minute sensor; deriving the interval is what makes it mean the same
    // thing on a 1 minute one (#94, point 3).
    static STALE_INTERVALS = 3;

    // The fallback, used when history cannot be read (recorder disabled) and as
    // the ceiling on a derived threshold. It is also the widest the card will
    // ever wait, so a derived cadence can only tighten staleness, never loosen
    // it: a wrong cadence must not let a dead sensor keep looking live.
    static STALE_FALLBACK_MS = 15 * 60 * 1000;

    // No CGM reports faster than once a minute, so a shorter gap is two writes
    // of one reading rather than a cadence. Without this floor a single
    // duplicate would collapse the threshold and flag every reading stale.
    static MIN_CADENCE_MS = 60 * 1000;

    static parseTimestamp(raw) {
        if (raw === null || raw === undefined) return null;

        // Numbers round-trip through String() losslessly, so they land on the
        // epoch branch below and need no case of their own.
        const trimmed = String(raw).trim();
        if (!SugarTvCard.isValidValue(trimmed)) return null;

        const asNumber = Number(trimmed);
        const date = Number.isFinite(asNumber)
            ? new Date(
                  Math.abs(asNumber) < SugarTvCard.EPOCH_SECONDS_BOUND
                      ? asNumber * 1000
                      : asNumber,
              )
            : new Date(trimmed);

        return isNaN(date.getTime()) ? null : date.toISOString();
    }

    static DEFAULT_THRESHOLDS = {
        'mg/dL': {
            urgent_low: 54,
            low: 70,
            high: 180,
            urgent_high: 250,
        },
        'mmol/L': {
            urgent_low: 3.0,
            low: 3.9,
            high: 10.0,
            urgent_high: 13.9,
        },
    };

    // Re-exported from trend.js for backward compatibility
    static TREND_MAP = TREND_MAP_DATA;

    static get properties() {
        return {
            hass: { type: Object },
            config: { type: Object },
        };
    }

    static getStubConfig() {
        // No thresholds here on purpose. A stub is created before the user has
        // picked their sensor, so its unit is unknowable; writing mg/dL numbers
        // would save them into every new card, including mmol ones. setConfig
        // fills the right defaults in once the entity is readable.
        return {
            type: 'custom:sugartv-card',
            glucose_value: 'sensor.jane_glucose_value',
            show_prediction: true,
            color_thresholds: true,
        };
    }

    static getConfigForm() {
        const localize = getLocalizer({}, {});
        return {
            schema: [
                {
                    name: 'glucose_value',
                    required: true,
                    selector: { entity: { domain: 'sensor' } },
                },
                {
                    name: 'timestamp_attribute',
                    selector: { text: {} },
                },
                {
                    name: 'show_prediction',
                    selector: { boolean: {} },
                },
                {
                    name: 'color_thresholds',
                    selector: { boolean: {} },
                },
                {
                    type: 'expandable',
                    name: 'thresholds',
                    title: localize('editor.thresholds_title'),
                    schema: [
                        {
                            type: 'grid',
                            name: '',
                            flatten: true,
                            schema: [
                                {
                                    name: 'urgent_low',
                                    default: 54,
                                    selector: {
                                        number: {
                                            min: 0,
                                            max: 500,
                                            mode: 'box',
                                            step: 'any',
                                        },
                                    },
                                },
                                {
                                    name: 'low',
                                    default: 70,
                                    selector: {
                                        number: {
                                            min: 0,
                                            max: 500,
                                            mode: 'box',
                                            step: 'any',
                                        },
                                    },
                                },
                                {
                                    name: 'high',
                                    default: 180,
                                    selector: {
                                        number: {
                                            min: 0,
                                            max: 500,
                                            mode: 'box',
                                            step: 'any',
                                        },
                                    },
                                },
                                {
                                    name: 'urgent_high',
                                    default: 250,
                                    selector: {
                                        number: {
                                            min: 0,
                                            max: 500,
                                            mode: 'box',
                                            step: 'any',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
            computeLabel: (schema) => {
                const labels = {
                    glucose_value: localize('editor.glucose_value'),
                    glucose_trend: localize('editor.glucose_trend'),
                    timestamp_attribute: localize('editor.timestamp_attribute'),
                    show_prediction: localize('editor.show_prediction'),
                    color_thresholds: localize('editor.color_thresholds'),
                    urgent_low: localize('editor.urgent_low'),
                    low: localize('editor.low'),
                    high: localize('editor.high'),
                    urgent_high: localize('editor.urgent_high'),
                };
                return labels[schema.name] || undefined;
            },
        };
    }

    constructor() {
        super();
        this._data = this._getInitialDataState();
    }

    connectedCallback() {
        super.connectedCallback();
        const fontId = 'sugartv-card-font';
        if (!document.getElementById(fontId)) {
            const link = document.createElement('link');
            link.id = fontId;
            link.rel = 'stylesheet';
            link.href =
                'https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap';
            document.head.appendChild(link);
        }
    }

    _getInitialDataState() {
        return {
            value: null,
            // Resolved reading time (attribute, sibling, or HA fallback), not
            // HA's own last_changed. previous_ingest_time is a different clock:
            // it comes from history, which carries HA's ingest time only.
            reading_time: null,
            trend: null,
            unit: SugarTvCard.UNITS.MGDL,
            previous_value: null,
            previous_ingest_time: null,
            previous_trend: null,
        };
    }

    _getTrendDescriptions(unit) {
        const isMgdl = unit === SugarTvCard.UNITS.MGDL;
        const localize = getLocalizer(this.config, this.hass);
        const u = isMgdl ? localize('units.mgdl') : localize('units.mmoll');
        const locale =
            (this.config && this.config.locale) ||
            (this.hass && this.hass.language) ||
            'en';

        const nf = (val) =>
            val.toLocaleString(locale, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
            });

        const formatMmol = (val1, val2) =>
            val2 ? `${nf(val1)}-${nf(val2)}` : nf(val1);

        return {
            rising_quickly: {
                icon: 'mdi:chevron-double-up',
                prediction: localize(
                    'predictions.rise_over',
                    isMgdl ? '45' : formatMmol(2.5),
                    u,
                ),
            },
            rising: {
                icon: 'mdi:arrow-up',
                prediction: localize(
                    'predictions.rise_in',
                    isMgdl ? '30-45' : formatMmol(1.7, 2.5),
                    u,
                ),
            },
            rising_slightly: {
                icon: 'mdi:arrow-top-right',
                prediction: localize(
                    'predictions.rise_in',
                    isMgdl ? '15-30' : formatMmol(0.8, 1.7),
                    u,
                ),
            },
            steady: {
                icon: 'mdi:arrow-right',
            },
            falling_slightly: {
                icon: 'mdi:arrow-bottom-right',
                prediction: localize(
                    'predictions.fall_in',
                    isMgdl ? '15-30' : formatMmol(0.8, 1.7),
                    u,
                ),
            },
            falling: {
                icon: 'mdi:arrow-down',
                prediction: localize(
                    'predictions.fall_in',
                    isMgdl ? '30-45' : formatMmol(1.7, 2.5),
                    u,
                ),
            },
            falling_quickly: {
                icon: 'mdi:chevron-double-down',
                prediction: localize(
                    'predictions.fall_over',
                    isMgdl ? '45' : formatMmol(2.5),
                    u,
                ),
            },
            unknown: {
                icon: 'mdi:help-circle-outline',
            },
        };
    }

    setConfig(config) {
        if (!SugarTvCard._versionLogged) {
            console.info(
                '%c SUGARTV-CARD %c ' + VERSION,
                'color: white; background: red; font-weight: 700;',
                'color: red; background: white; font-weight: 700;',
            );
            SugarTvCard._versionLogged = true;
        }

        if (!config.glucose_value) {
            throw new Error(
                'You need to define glucose_value in your configuration.',
            );
        }

        // Normalize defaults so the form editor shows correct values
        if (config.color_thresholds === undefined) {
            config = { ...config, color_thresholds: true };
        }

        // Only fill the defaults in once the entity can actually be read.
        // Lovelace calls setConfig before it assigns hass, and guessing mg/dL
        // there bakes those numbers into a mmol card permanently, which makes
        // every in-range reading compare as urgent low.
        const glucoseState = this.hass?.states?.[config.glucose_value];
        if (!config.thresholds && glucoseState) {
            const unit = SugarTvCard.normalizeUnit(
                glucoseState.attributes?.unit_of_measurement,
            );
            config = {
                ...config,
                thresholds: { ...SugarTvCard.DEFAULT_THRESHOLDS[unit] },
            };
        }

        this.config = config;
        this._data = this._data || this._getInitialDataState();
        this._lastHistoryFetch = this._lastHistoryFetch || 0;
        // Null until history has been read; _staleThresholdMs falls back.
        this._cadenceMs = this._cadenceMs || null;
    }

    willUpdate(changedProperties) {
        if (changedProperties.has('hass') || changedProperties.has('config')) {
            this._updateData();
        }
    }

    updated() {
        this._measureValueWidth();
    }

    /*
     * The column sizes --u from a width budget, and a budget wide enough for the
     * widest reading anyone might see wastes about a fifth of the width on an
     * ordinary mg/dL number. Measuring is the only way to know the real figure:
     * it depends on the font and the theme, neither of which CSS can be asked
     * about, and hard-coding a per-character constant is exactly the kind of
     * magic number that keeps going stale.
     *
     * Text width scales linearly with font-size, so width-per-unit is a property
     * of the string alone. One measurement gives it and the budget follows: a
     * new --u changes the measured width and the font-size by the same factor,
     * so the ratio comes out identical and nothing oscillates.
     *
     * The budget is sized for the widest reading the CURRENT UNIT can produce,
     * not for the reading on screen. Sizing it per reading would fill the card
     * slightly better, but the number would jump a quarter of its size the
     * moment a reading crossed 99 to 100, which is the same restlessness
     * tabular figures were added to remove.
     */
    _measureValueWidth() {
        const wrapper = this.renderRoot?.querySelector?.('.wrapper');
        const value = this.renderRoot?.querySelector?.('.value');
        if (!wrapper || !value) return;

        const text = value.textContent?.trim();
        if (!text) return;

        // .value is defined as 20u, which is how --u is recovered: the custom
        // property itself reads back as the unresolved min() expression.
        const fontSize = parseFloat(getComputedStyle(value).fontSize);
        const width = value.getBoundingClientRect().width;
        if (!fontSize || !width) return;

        // Tabular figures give every glyph the same advance, so a per-character
        // width taken from whatever is on screen holds for any other reading.
        const perChar =
            width / text.length / (fontSize / SugarTvCard.VALUE_UNITS);
        const widest =
            this._data.unit === SugarTvCard.UNITS.MMOLL
                ? SugarTvCard.WIDEST_MMOL_CHARS
                : SugarTvCard.WIDEST_MGDL_CHARS;
        const widthInUnits = perChar * widest;
        if (!Number.isFinite(widthInUnits) || widthInUnits <= 0) return;

        // Container padding is 5u a side, plus a unit of slack so a subpixel
        // measurement can never push the glyphs into the padding.
        const budget =
            Math.ceil((widthInUnits + 2 * SugarTvCard.PADDING_UNITS + 1) * 10) /
            10;
        if (budget === this._valueWidthBudget) return;

        this._valueWidthBudget = budget;
        wrapper.style.setProperty('--tall-w', String(budget));
    }

    _updateData() {
        if (!this.hass || !this.config) {
            return;
        }

        const { glucose_value } = this.config;

        if (!this._validateEntities(glucose_value)) {
            return;
        }

        const currentState = this._getCurrentState(glucose_value);

        this._updateCurrentData(currentState);
        this._fetchPreviousFromHistory();
    }

    _validateEntities(glucose_value) {
        if (!this.hass.states[glucose_value]) {
            this._data = {
                ...this._getInitialDataState(),
                value: null,
                reading_time: null,
                trend: 'unknown',
                unit: SugarTvCard.UNITS.MGDL,
            };
            return false;
        }
        return true;
    }

    _getCurrentState(glucose_value) {
        const glucoseState = this.hass.states[glucose_value];
        const trend = this._resolveTrend(glucose_value, glucoseState);

        return {
            value: glucoseState.state,
            unit: SugarTvCard.normalizeUnit(
                glucoseState.attributes?.unit_of_measurement,
            ),
            reading_time: this._resolveTimestamp(glucose_value, glucoseState),
            trend,
        };
    }

    // When the reading was last confirmed — not when the value last moved.
    // A steady glucose level keeps last_changed frozen, which made a live
    // sensor read as stale and suppressed the delta.
    //
    // last_updated is only a partial fallback: HA advances it when the state
    // OR any attribute changes, so it helps for integrations that publish a
    // varying attribute (Nightscout ships delta/direction), but stays frozen
    // alongside last_changed when a poll rewrites a byte-identical state. HA
    // tracks those in last_reported, which the websocket never sends to the
    // frontend, so an integration-supplied time is the only reliable source.
    //
    // Each candidate is validated differently on purpose. A rejected one falls
    // through to last_updated, which can read fresher than reality, so only
    // reject a value that is more likely wrong than merely stale.
    _resolveTimestamp(glucose_value, glucoseState) {
        const attributes = glucoseState.attributes || {};
        const configured = this.config?.timestamp_attribute;

        if (configured) {
            const parsed = SugarTvCard.parseTimestamp(attributes[configured]);
            if (parsed) return parsed;
        } else {
            for (const name of SugarTvCard.TIMESTAMP_ATTRIBUTES) {
                const parsed = SugarTvCard.parseTimestamp(attributes[name]);
                if (parsed) return parsed;
            }

            const nightscoutDate = this._nightscoutDate(attributes);
            if (nightscoutDate) return nightscoutDate;

            const sibling = this._timestampFromSibling(glucose_value);
            if (sibling) return sibling;
        }

        return glucoseState.last_updated || glucoseState.last_changed || null;
    }

    // Nightscout publishes the reading time as `date`. That name is a generic
    // HA constant shared by unrelated domains, so only trust it on an entity
    // that also carries Nightscout's own companion attributes.
    //
    // Test key presence, not value: the integration writes all four keys on
    // every update whatever the server returned, so `delta` is null on a real
    // install (Nightscout computes it client-side and never sends it) and
    // `direction` is null when no trend is known. A truthiness check would
    // reject exactly the readings this exists to date.
    _nightscoutDate(attributes) {
        const looksLikeNightscout =
            attributes.device_class === SugarTvCard.GLUCOSE_DEVICE_CLASS &&
            'date' in attributes &&
            'direction' in attributes &&
            'delta' in attributes;
        return looksLikeNightscout
            ? SugarTvCard.parseTimestamp(attributes.date)
            : null;
    }

    _timestampFromSibling(glucose_value) {
        const states = this.hass?.states;
        if (!states) return null;

        for (const [valueTail, timeTail] of SugarTvCard.TIMESTAMP_SIBLINGS) {
            const id = siblingEntityId(glucose_value, valueTail, timeTail);
            if (!id) continue;
            const parsed = SugarTvCard.parseTimestamp(states[id]?.state);
            if (parsed) return parsed;
        }

        for (const [valueTail, ageTail] of SugarTvCard.AGE_SIBLINGS) {
            const id = siblingEntityId(glucose_value, valueTail, ageTail);
            if (!id) continue;
            const sibling = states[id];
            const minutes = Number(sibling?.state);
            if (!Number.isFinite(minutes)) continue;
            if (minutes < 0 || minutes > SugarTvCard.MAX_SIBLING_AGE_MINUTES) {
                continue;
            }

            // Count back from when the sibling reported that age, not from the
            // wall clock: an integration that stops polling freezes the age,
            // and counting from now would hold the reading permanently fresh.
            const reportedAt = SugarTvCard.parseTimestamp(
                sibling.last_updated || sibling.last_changed,
            );
            if (!reportedAt) continue;

            return new Date(
                new Date(reportedAt).getTime() - minutes * 60000,
            ).toISOString();
        }

        return null;
    }

    _resolveTrend(glucose_value, glucoseState) {
        return resolveTrend(
            glucose_value,
            glucoseState,
            this.config,
            this.hass,
        );
    }

    _normalizeTrend(rawTrend) {
        return normalizeTrend(rawTrend);
    }

    _updateCurrentData(currentState) {
        Object.assign(this._data, currentState);
    }

    async _fetchPreviousFromHistory() {
        const now = Date.now();
        // Throttle: fetch at most once per 30 seconds
        if (now - this._lastHistoryFetch < 30000) {
            return;
        }
        this._lastHistoryFetch = now;

        try {
            const entityId = this.config.glucose_value;
            // Fetch up to 25 mins of history to ensure we catch previous readings even from 15m sensors
            const startTime = new Date(now - 25 * 60 * 1000).toISOString();
            const endTime = new Date(now).toISOString();

            const history = await this.hass.callWS({
                type: 'history/history_during_period',
                start_time: startTime,
                end_time: endTime,
                entity_ids: [entityId],
                minimal_response: true,
                no_attributes: true,
            });

            const states = history[entityId];
            if (!states || states.length < 2) {
                return;
            }

            // Find the state closest to ~5 minutes before the current reading.
            // reading_time may be a sensor-supplied measurement time while the
            // history entries below are HA ingest times; the two can differ by
            // the ingest lag, which is why the previous field is named for its
            // source rather than matched to this one.
            const currentTime =
                new Date(this._data.reading_time).getTime() / 1000; // epoch seconds
            const targetTime = currentTime - 5 * 60; // 5 min before current reading
            let previousState = null;
            let bestDiff = Infinity;
            const seenTimes = [];

            for (const state of states) {
                if (!this._isValidValue(state.s)) continue;

                const stateTime = state.lu || state.lc || state.t; // Support HA versions
                if (!stateTime) continue;
                seenTimes.push(stateTime * 1000);

                // Skip the current state — we need a different reading
                if (Math.abs(stateTime - currentTime) < 1) continue;

                const diff = Math.abs(stateTime - targetTime);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    previousState = state;
                }
            }

            // Keep the last known cadence when this window was too sparse to
            // measure one: a flat stretch is exactly when the reading is most
            // likely to look stuck, and reverting to the 15 minute fallback
            // there would widen the window at the worst moment.
            const cadence = SugarTvCard.cadenceFromHistory(seenTimes);
            if (cadence) {
                this._cadenceMs = cadence;
                this.requestUpdate();
            }

            if (previousState) {
                this._data.previous_value = previousState.s;
                // History carries HA's ingest time, not the measurement time:
                // the query asks for no_attributes, so a sensor-supplied
                // timestamp is not available for previous readings.
                this._data.previous_ingest_time = SugarTvCard.parseTimestamp(
                    previousState.lu || previousState.lc || previousState.t,
                );
                this.requestUpdate();
            }
        } catch (e) {
            // History API may not be available (e.g. recorder disabled)
            // Delta will simply not show — graceful degradation
        }
    }

    _formatTime(timestamp) {
        const localize = getLocalizer(this.config, this.hass);
        if (
            !timestamp ||
            timestamp === 'unknown' ||
            timestamp === 'unavailable'
        ) {
            return localize('common.default_time');
        }

        const options = {
            hour: '2-digit',
            minute: '2-digit',
        };

        const locale =
            (this.config && this.config.locale) ||
            (this.hass && this.hass.language);

        return new Date(timestamp).toLocaleTimeString(locale || [], options);
    }

    _calculateDelta() {
        const { value, previous_value, reading_time, previous_ingest_time } =
            this._data;

        if (
            !this._isValidValue(value) ||
            !this._isValidValue(previous_value) ||
            reading_time === previous_ingest_time
        ) {
            return null;
        }

        // reading_time and previous_ingest_time are different clocks (see
        // _fetchPreviousFromHistory); the gap is the ingest lag, small enough
        // that the 9-minute gate below still holds.
        const timeDiff = Math.abs(
            new Date(reading_time) - new Date(previous_ingest_time),
        );
        if (timeDiff >= 540000) {
            // Strictly 9 minutes: delta makes sense only for standard ~5min CGM intervals
            return null;
        }

        const currentValue = parseFloat(String(value).replace(',', '.'));
        const previousValue = parseFloat(
            String(previous_value).replace(',', '.'),
        );

        if (isNaN(currentValue) || isNaN(previousValue)) {
            return null;
        }

        const delta = currentValue - previousValue;
        const locale = this.config.locale || [];
        const isMmol = this._data.unit === SugarTvCard.UNITS.MMOLL;

        const roundedAbs = isMmol
            ? Math.round(Math.abs(delta) * 10) / 10
            : Math.round(Math.abs(delta));
        const formatOpts = isMmol
            ? { minimumFractionDigits: 1, maximumFractionDigits: 1 }
            : {};
        const absFormatted = roundedAbs.toLocaleString(locale, formatOpts);

        // Exact equality: drop the sign so "no change" is visually distinct
        // from sub-unit drift (＋0 / －0 still preserve direction).
        if (delta === 0) {
            return absFormatted;
        }

        const sign = delta > 0 ? '＋' : '－';
        return `${sign}${absFormatted}`;
    }

    // HA reports a missing reading with one of two sentinel states.
    static isValidValue(value) {
        return value && value !== 'unknown' && value !== 'unavailable';
    }

    _isValidValue(value) {
        return SugarTvCard.isValidValue(value);
    }

    /**
     * Recover the sensor's polling interval from the gaps between its history
     * entries.
     *
     * Take the SMALLEST gap, not the average or the median. Home Assistant only
     * writes a history entry when the state actually changes, so a CGM that
     * reports the same number twice leaves no entry and the gap around it comes
     * out double. That error runs one way only: a missing entry can inflate a
     * gap, never shrink one. The smallest observed gap is therefore the closest
     * thing to the true cadence, and averaging would drag it upward on exactly
     * the flat stretches where a stuck sensor most needs catching.
     */
    static cadenceFromHistory(timestampsMs) {
        const sorted = [...new Set(timestampsMs)].sort((a, b) => a - b);
        if (sorted.length < 2) return null;

        let smallest = Infinity;
        for (let i = 1; i < sorted.length; i++) {
            const gap = sorted[i] - sorted[i - 1];
            if (gap >= SugarTvCard.MIN_CADENCE_MS && gap < smallest) {
                smallest = gap;
            }
        }
        return Number.isFinite(smallest) ? smallest : null;
    }

    // The window after which a reading stops being trustworthy. Derived from
    // the sensor's own cadence where history allows, so that "stale" means the
    // same number of missed polls on a 1 minute sensor as on a 5 minute one.
    _staleThresholdMs() {
        const cadence = this._cadenceMs;
        if (!cadence) return SugarTvCard.STALE_FALLBACK_MS;
        return Math.min(
            cadence * SugarTvCard.STALE_INTERVALS,
            SugarTvCard.STALE_FALLBACK_MS,
        );
    }

    _isStale(timestamp) {
        if (
            !timestamp ||
            timestamp === 'unknown' ||
            timestamp === 'unavailable'
        ) {
            return true;
        }
        const age = Date.now() - new Date(timestamp).getTime();
        return age > this._staleThresholdMs();
    }

    _handleTap() {
        const entityId = this.config.glucose_value;
        if (!entityId) return;

        const event = new CustomEvent('hass-more-info', {
            bubbles: true,
            composed: true,
            detail: { entityId },
        });
        this.dispatchEvent(event);
    }
    _formatValue(value) {
        const localize = getLocalizer(this.config, this.hass);
        if (!this._isValidValue(value)) {
            return localize('common.not_available');
        }

        const sanitizedValue = String(value).replace(',', '.');
        const numValue = parseFloat(sanitizedValue);

        if (isNaN(numValue)) {
            return localize('common.not_available');
        }

        const locale = this.config.locale || [];
        const isMmol = this._data.unit === SugarTvCard.UNITS.MMOLL;

        return numValue.toLocaleString(locale, {
            minimumFractionDigits: isMmol ? 1 : 0,
            maximumFractionDigits: isMmol ? 1 : 0,
        });
    }

    _getGlucoseZone(value) {
        if (!this._isValidValue(value)) {
            return '';
        }

        const numValue = parseFloat(String(value).replace(',', '.'));
        if (isNaN(numValue)) {
            return '';
        }

        const unit = this._data.unit || SugarTvCard.UNITS.MGDL;
        const defaults =
            SugarTvCard.DEFAULT_THRESHOLDS[unit] ||
            SugarTvCard.DEFAULT_THRESHOLDS[SugarTvCard.UNITS.MGDL];
        const t = {
            ...defaults,
            ...SugarTvCard.thresholdsForUnit(this.config.thresholds, unit),
        };

        if (numValue < t.urgent_low) return 'zone-urgent-low';
        if (numValue < t.low) return 'zone-low';
        if (numValue > t.urgent_high) return 'zone-urgent-high';
        if (numValue > t.high) return 'zone-high';
        return '';
    }

    render() {
        const { value, reading_time, trend, unit } = this._data;
        const showPrediction = this.config.show_prediction !== false;
        const trendSymbols = this._getTrendDescriptions(unit);
        const trendInfo =
            (trend && trendSymbols[trend.toLowerCase()]) ||
            trendSymbols.unknown;
        const trendIcon = trendInfo.icon;
        const prediction = trendInfo.prediction || '';

        const isStale = this._isStale(reading_time);
        const zoneClass =
            this.config.color_thresholds !== false
                ? this._getGlucoseZone(value)
                : '';

        this.className = [zoneClass, isStale ? 'stale' : '']
            .filter(Boolean)
            .join(' ');

        const ariaLabel = [
            this._formatValue(value),
            unit,
            trend && trend !== 'unknown' ? trend.replace(/_/g, ' ') : '',
            this._calculateDelta(),
        ]
            .filter(Boolean)
            .join(', ');

        return html`
            <div
                class="wrapper"
                @click="${this._handleTap}"
                role="status"
                aria-live="polite"
                aria-label="${ariaLabel}"
            >
                <div class="container">
                    <div class="line">
                        <div class="time">
                            ${this._formatTime(reading_time)}
                        </div>
                        <div class="value">${this._formatValue(value)}</div>
                        <div class="tail">
                            <div class="trend" data-icon="${trendIcon}">
                                <ha-icon icon="${trendIcon}"></ha-icon>
                            </div>
                            <div class="delta">
                                ${
                                    this._calculateDelta() ||
                                    html`<ha-icon
                                        icon="mdi:progress-clock"
                                    ></ha-icon>`
                                }
                            </div>
                        </div>
                    </div>
                    ${
                        showPrediction && prediction
                            ? html`
                                  <div class="prediction">${prediction}</div>
                              `
                            : ''
                    }
                </div>
            </div>
        `;
    }

    getCardSize() {
        return 1;
    }

    getGridOptions() {
        return {
            rows: 1,
            min_rows: 1,
            columns: 6,
            min_columns: 3,
        };
    }

    static get styles() {
        return cardStyles;
    }
}

const localize = getLocalizer();
customElements.define('sugartv-card', SugarTvCard);

console.info(
    `%c SugarTV Card %c v${VERSION} `,
    'color: white; background: #4fc3f7; font-weight: bold; padding: 2px 4px; border-radius: 4px 0 0 4px;',
    'color: white; background: #333; font-weight: bold; padding: 2px 4px; border-radius: 0 4px 4px 0;',
);

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'sugartv-card',
    name: localize('card.name'),
    description: localize('card.description'),
    preview: true,
    documentationURL:
        'https://github.com/wiltodelta/homeassistant-sugartv-card',
});
