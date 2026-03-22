import { LitElement, html, css } from 'lit';

import { cardStyles } from './sugartv-card-styles.js';
import { getLocalizer } from './localize.js';

const VERSION = process.env.VERSION;

class SugarTvCard extends LitElement {
    static UNITS = {
        MGDL: 'mg/dL',
        MMOLL: 'mmol/L',
    };

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

    // Normalize trend values from different integrations to internal format
    static TREND_MAP = {
        // Dexcom (already normalized)
        rising_quickly: 'rising_quickly',
        rising: 'rising',
        rising_slightly: 'rising_slightly',
        steady: 'steady',
        falling_slightly: 'falling_slightly',
        falling: 'falling',
        falling_quickly: 'falling_quickly',
        // Nightscout direction values
        doubleup: 'rising_quickly',
        singleup: 'rising',
        fortyfiveup: 'rising_slightly',
        flat: 'steady',
        fortyfivedown: 'falling_slightly',
        singledown: 'falling',
        doubledown: 'falling_quickly',
        // LibreView numeric trends
        2: 'rising_quickly',
        3: 'rising',
        4: 'rising_slightly',
        5: 'steady',
        6: 'falling_slightly',
        7: 'falling',
        8: 'falling_quickly',
        // LibreView/PTST (attribute 'trend' — snake_case)
        'rising quickly': 'rising_quickly',
        'rising slightly': 'rising_slightly',
        stable: 'steady',
        'falling slightly': 'falling_slightly',
        'falling quickly': 'falling_quickly',
        decreasing_fast: 'falling_quickly',
        decreasing: 'falling',
        increasing: 'rising',
        increasing_fast: 'rising_quickly',
        // LibreLink/gillesvs (separate trend entity — human-readable text)
        'decreasing fast': 'falling_quickly',
        'increasing fast': 'rising_quickly',
        // Carelink/Medtronic trend values (raw API: UP, DOWN, FLAT)
        up: 'rising',
        up_up: 'rising_quickly',
        up_double: 'rising_quickly',
        down: 'falling',
        down_down: 'falling_quickly',
        down_double: 'falling_quickly',
        none: 'steady',
    };

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
                    show_prediction: localize('editor.show_prediction'),
                    color_thresholds: localize('editor.color_thresholds'),
                    urgent_low: localize('editor.urgent_low'),
                    low: localize('editor.low'),
                    high: localize('editor.high'),
                    urgent_high: localize('editor.urgent_high'),
                };
                return labels[schema.name] || undefined;
            },
            assertConfig: (config) => {
                if (config.thresholds) {
                    const t = config.thresholds;
                    if (
                        t.urgent_low != null &&
                        t.low != null &&
                        t.urgent_low >= t.low
                    ) {
                        throw new Error('urgent_low must be less than low');
                    }
                    if (t.low != null && t.high != null && t.low >= t.high) {
                        throw new Error('low must be less than high');
                    }
                    if (
                        t.high != null &&
                        t.urgent_high != null &&
                        t.high >= t.urgent_high
                    ) {
                        throw new Error('high must be less than urgent_high');
                    }
                }
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
            const unit =
                this.hass?.states?.[config.glucose_value]?.attributes
                    ?.unit_of_measurement || 'mg/dL';
            config = {
                ...config,
                thresholds: {
                    ...(SugarTvCard.DEFAULT_THRESHOLDS[unit] ||
                        SugarTvCard.DEFAULT_THRESHOLDS['mg/dL']),
                },
            };
        }

        this.config = config;
        this._data = this._data || this._getInitialDataState();
        this._lastHistoryFetch = this._lastHistoryFetch || 0;
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
                value: 0,
                last_changed: 0,
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
            unit: glucoseState.attributes.unit_of_measurement,
            last_changed: glucoseState.last_changed,
            trend,
        };
    }

    /**
     * Auto-detect trend from multiple sources:
     * 1. YAML override: config.glucose_trend entity
     * 2. Sibling entity patterns:
     *    - Dexcom: *_glucose_value → *_glucose_trend
     *    - Carelink: *_last_sg_mgdl / *_last_sg_mmol → *_last_sg_trend
     *    - LibreLink (gillesvs): *_glucose_measurement → find *_trend entity
     * 3. Nightscout: attribute 'direction' on value entity
     * 4. LibreView (PTST): attribute 'trend' on value entity
     * 5. Fallback: 'unknown'
     */
    _resolveTrend(glucose_value, glucoseState) {
        // 1. YAML override
        if (this.config.glucose_trend) {
            const trendState = this.hass.states[this.config.glucose_trend];
            if (trendState) {
                return this._normalizeTrend(trendState.state);
            }
        }

        // 2. Sibling entity patterns
        const siblingPatterns = [
            // Dexcom: sensor.dexcom_*_glucose_value → sensor.dexcom_*_glucose_trend
            ['_glucose_value', '_glucose_trend'],
            // Carelink: sensor.carelink_*_last_sg_mgdl → sensor.carelink_*_last_sg_trend
            ['_last_sg_mgdl', '_last_sg_trend'],
            ['_last_sg_mmol', '_last_sg_trend'],
        ];

        for (const [valueSuffix, trendSuffix] of siblingPatterns) {
            if (glucose_value.endsWith(valueSuffix)) {
                const trendEntityId = glucose_value.replace(
                    valueSuffix,
                    trendSuffix,
                );
                const trendState = this.hass.states[trendEntityId];
                if (trendState) {
                    return this._normalizeTrend(trendState.state);
                }
            }
        }

        // LibreLink (gillesvs): entities share a prefix, trend entity has key "_trend"
        // e.g. sensor.*_glucose_measurement + sensor.*_trend
        const prefix = glucose_value.substring(
            0,
            glucose_value.lastIndexOf('_'),
        );
        if (prefix) {
            const trendState = this.hass.states[`${prefix}_trend`];
            if (trendState) {
                return this._normalizeTrend(trendState.state);
            }
        }

        // 3. Nightscout: 'direction' attribute
        if (glucoseState.attributes.direction) {
            return this._normalizeTrend(glucoseState.attributes.direction);
        }

        // 4. LibreView (PTST): 'trend' attribute
        if (glucoseState.attributes.trend) {
            return this._normalizeTrend(String(glucoseState.attributes.trend));
        }

        return 'unknown';
    }

    _normalizeTrend(rawTrend) {
        if (!rawTrend) return 'unknown';
        const key = String(rawTrend).toLowerCase().trim();
        return SugarTvCard.TREND_MAP[key] || key;
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
            const startTime = new Date(now - 15 * 60 * 1000).toISOString(); // 15 minutes
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

            // Find the state closest to ~5 minutes ago (standard CGM reading interval)
            // This ensures consistent delta regardless of integration update frequency
            const targetTime = (now - 5 * 60 * 1000) / 1000; // epoch seconds
            let bestState = null;
            let bestDiff = Infinity;

            for (const state of states) {
                if (!this._isValidValue(state.s) || !state.lu) continue;
                const diff = Math.abs(state.lu - targetTime);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    bestState = state;
                }
            }

            // Only use if found and within 3 minutes of our 5-min target
            if (bestState && bestDiff < 180) {
                this._data.previous_value = bestState.s;
                this._data.previous_last_changed = new Date(
                    bestState.lu * 1000,
                ).toISOString();
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
        if (timeDiff >= 600000) {
            // 10 minutes (Dexcom updates every 5 min but may delay)
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
        const sign = delta >= 0 ? '＋' : '－';
        const absDelta = Math.abs(delta);

        const locale = this.config.locale || [];
        const isMmol = this._data.unit === SugarTvCard.UNITS.MMOLL;

        if (isMmol) {
            return `${sign}${absDelta.toLocaleString(locale, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
            })}`;
        }

        return `${sign}${Math.round(absDelta).toLocaleString(locale)}`;
    }

    _isValidValue(value) {
        return value && value !== 'unknown' && value !== 'unavailable';
    }

    _isStale(timestamp) {
        if (
            !timestamp ||
            timestamp === 'unknown' ||
            timestamp === 'unavailable'
        ) {
            return false;
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
            SugarTvCard.DEFAULT_THRESHOLDS['mg/dL'];
        const t = { ...defaults, ...(this.config.thresholds || {}) };

        if (numValue < t.urgent_low) return 'zone-urgent-low';
        if (numValue < t.low) return 'zone-low';
        if (numValue > t.urgent_high) return 'zone-urgent-high';
        if (numValue > t.high) return 'zone-high';
        return '';
    }

    render() {
        this._updateData();

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

        return html`
            <div class="wrapper" @click="${this._handleTap}">
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
