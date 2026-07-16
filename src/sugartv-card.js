import { LitElement, html, css } from 'lit';

import { cardStyles } from './sugartv-card-styles.js';
import { getLocalizer } from './localize.js';
import {
    TREND_MAP as TREND_MAP_DATA,
    VALUE_SUFFIXES,
    normalizeTrend,
    resolveTrend,
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
        [VALUE_SUFFIXES.carelinkMgdl, '_last_glucose_update'],
        [VALUE_SUFFIXES.carelinkMmol, '_last_glucose_update'],
    ];

    // Siblings reporting an age in minutes rather than a timestamp.
    static AGE_SIBLINGS = [
        // LibreLink (gillesvs)
        [VALUE_SUFFIXES.librelink, '_minutes_since_update'],
    ];

    // An age sibling is derived from the integration's own clock, so a
    // misconfigured timezone can yield a wildly wrong number. Discarding one
    // is safe here: the only age sibling belongs to LibreLink, whose glucose
    // sensor carries no attributes, so the last_updated it falls back to can
    // only read stale, never falsely fresh.
    static MAX_SIBLING_AGE_MINUTES = 180;

    // Epoch values arrive in seconds from some integrations and milliseconds
    // from others. Anything below this bound is too small to be a modern
    // millisecond value, so treat it as seconds.
    static EPOCH_SECONDS_BOUND = 1e11;

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
        return {
            type: 'custom:sugartv-card',
            glucose_value: 'sensor.dexcom_glucose_value',
            show_prediction: true,
            color_thresholds: true,
            thresholds: {
                urgent_low: 54,
                low: 70,
                high: 180,
                urgent_high: 250,
            },
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
            last_changed: null,
            trend: null,
            unit: SugarTvCard.UNITS.MGDL,
            previous_value: null,
            previous_last_changed: null,
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

        if (!config.thresholds) {
            const unit = SugarTvCard.normalizeUnit(
                this.hass?.states?.[config.glucose_value]?.attributes
                    ?.unit_of_measurement,
            );
            config = {
                ...config,
                thresholds: { ...SugarTvCard.DEFAULT_THRESHOLDS[unit] },
            };
        }

        this.config = config;
        this._data = this._data || this._getInitialDataState();
        this._lastHistoryFetch = this._lastHistoryFetch || 0;
    }

    willUpdate(changedProperties) {
        if (changedProperties.has('hass') || changedProperties.has('config')) {
            this._updateData();
        }
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
                last_changed: null,
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
            last_changed: this._resolveTimestamp(glucose_value, glucoseState),
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
    _nightscoutDate(attributes) {
        const looksLikeNightscout =
            attributes.direction !== undefined ||
            attributes.delta !== undefined;
        return looksLikeNightscout
            ? SugarTvCard.parseTimestamp(attributes.date)
            : null;
    }

    _timestampFromSibling(glucose_value) {
        const states = this.hass?.states;
        if (!states) return null;

        for (const [
            valueSuffix,
            timeSuffix,
        ] of SugarTvCard.TIMESTAMP_SIBLINGS) {
            if (!glucose_value.endsWith(valueSuffix)) continue;
            const sibling =
                states[glucose_value.replace(valueSuffix, timeSuffix)];
            const parsed = SugarTvCard.parseTimestamp(sibling?.state);
            if (parsed) return parsed;
        }

        for (const [valueSuffix, ageSuffix] of SugarTvCard.AGE_SIBLINGS) {
            if (!glucose_value.endsWith(valueSuffix)) continue;
            const sibling =
                states[glucose_value.replace(valueSuffix, ageSuffix)];
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

            // Find the state closest to ~5 minutes before the current reading
            const currentTime =
                new Date(this._data.last_changed).getTime() / 1000; // epoch seconds
            const targetTime = currentTime - 5 * 60; // 5 min before current reading
            let previousState = null;
            let bestDiff = Infinity;

            for (const state of states) {
                if (!this._isValidValue(state.s)) continue;

                const stateTime = state.lu || state.lc || state.t; // Support HA versions
                if (!stateTime) continue;

                // Skip the current state — we need a different reading
                if (Math.abs(stateTime - currentTime) < 1) continue;

                const diff = Math.abs(stateTime - targetTime);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    previousState = state;
                }
            }

            if (previousState) {
                this._data.previous_value = previousState.s;
                // History carries HA's ingest time, not the measurement time:
                // the query asks for no_attributes, so a sensor-supplied
                // timestamp is not available for previous readings.
                this._data.previous_last_changed = SugarTvCard.parseTimestamp(
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
        const { value, previous_value, last_changed, previous_last_changed } =
            this._data;

        if (
            !this._isValidValue(value) ||
            !this._isValidValue(previous_value) ||
            last_changed === previous_last_changed
        ) {
            return null;
        }

        const timeDiff = Math.abs(
            new Date(last_changed) - new Date(previous_last_changed),
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

    _isStale(timestamp) {
        if (
            !timestamp ||
            timestamp === 'unknown' ||
            timestamp === 'unavailable'
        ) {
            return true;
        }
        return Date.now() - new Date(timestamp).getTime() > 900000; // 15 minutes
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
        const t = { ...defaults, ...(this.config.thresholds || {}) };

        if (numValue < t.urgent_low) return 'zone-urgent-low';
        if (numValue < t.low) return 'zone-low';
        if (numValue > t.urgent_high) return 'zone-urgent-high';
        if (numValue > t.high) return 'zone-high';
        return '';
    }

    render() {
        const { value, last_changed, trend, unit } = this._data;
        const showPrediction = this.config.show_prediction !== false;
        const trendSymbols = this._getTrendDescriptions(unit);
        const trendInfo =
            (trend && trendSymbols[trend.toLowerCase()]) ||
            trendSymbols.unknown;
        const trendIcon = trendInfo.icon;
        const prediction = trendInfo.prediction || '';

        const isStale = this._isStale(last_changed);
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
                    <div class="main-row">
                        <div class="time">
                            ${this._formatTime(last_changed)}
                        </div>
                        <div class="value">${this._formatValue(value)}</div>
                        <div class="trend">
                            <ha-icon icon="${trendIcon}"></ha-icon>
                        </div>
                        <div class="delta">
                            ${this._calculateDelta() ||
                            html`<ha-icon icon="mdi:progress-clock"></ha-icon>`}
                        </div>
                    </div>
                    ${showPrediction && prediction
                        ? html` <div class="prediction">${prediction}</div> `
                        : ''}
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
