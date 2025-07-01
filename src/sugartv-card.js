import { LitElement, html, css } from 'lit';

import { cardStyles } from './sugartv-card-styles.js';
import './sugartv-card-editor.js';

const VERSION = process.env.VERSION;

class SugarTvCard extends LitElement {
    static DEFAULT_VALUES = {
        VALUE: 'N/A',
        TIME: '00:00',
    };

    static UNITS = {
        MGDL: 'mg/dL',
        MMOLL: 'mmol/L',
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
            glucose_trend: 'sensor.dexcom_glucose_trend',
            show_prediction: true,
        };
    }

    static async getConfigElement() {
        return document.createElement('sugartv-card-editor');
    }

    constructor() {
        super();
        this._data = this._getInitialDataState();
        this.TREND_SYMBOLS = this._getTrendDescriptions(this._data.unit);
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
        return {
            rising_quickly: {
                icon: 'mdi:chevron-double-up',
                prediction: `Expected to rise over ${isMgdl ? '45 mg/dL' : '2.5 mmol/L'} in 15 minutes`,
            },
            rising: {
                icon: 'mdi:arrow-up',
                prediction: `Expected to rise ${isMgdl ? '30-45 mg/dL' : '1.7-2.5 mmol/L'} in 15 minutes`,
            },
            rising_slightly: {
                icon: 'mdi:arrow-top-right',
                prediction: `Expected to rise ${isMgdl ? '15-30 mg/dL' : '0.8-1.7 mmol/L'} in 15 minutes`,
            },
            steady: {
                icon: 'mdi:arrow-right',
            },
            falling_slightly: {
                icon: 'mdi:arrow-bottom-right',
                prediction: `Expected to fall ${isMgdl ? '15-30 mg/dL' : '0.8-1.7 mmol/L'} in 15 minutes`,
            },
            falling: {
                icon: 'mdi:arrow-down',
                prediction: `Expected to fall ${isMgdl ? '30-45 mg/dL' : '1.7-2.5 mmol/L'} in 15 minutes`,
            },
            falling_quickly: {
                icon: 'mdi:chevron-double-down',
                prediction: `Expected to fall over ${isMgdl ? '45 mg/dL' : '2.5 mmol/L'} in 15 minutes`,
            },
            unknown: {
                icon: 'mdi:help-circle-outline',
            },
        };
    }

    setConfig(config) {
        console.info(
            '%c SUGARTV-CARD %c ' + VERSION,
            'color: white; background: red; font-weight: 700;',
            'color: red; background: white; font-weight: 700;',
        );

        if (!config.glucose_value) {
            throw new Error(
                'You need to define glucose_value in your configuration.',
            );
        }

        if (!config.glucose_trend) {
            throw new Error(
                'You need to define glucose_trend in your configuration.',
            );
        }

        this.config = config;
        this._data = this._data || this._getInitialDataState();
    }

    _updateData() {
        if (!this.hass || !this.config) {
            return;
        }

        const { glucose_value, glucose_trend } = this.config;

        if (!this._validateEntities(glucose_value, glucose_trend)) {
            // Data will be reset in _validateEntities, no need to return error html from here
            return;
        }

        const currentState = this._getCurrentState(
            glucose_value,
            glucose_trend,
        );
        const previousState =
            this._data.value !== null
                ? {
                      previous_value: this._data.value,
                      previous_last_changed: this._data.last_changed,
                      previous_trend: this._data.trend,
                  }
                : null;

        this._updateCurrentData(currentState);

        if (
            previousState &&
            currentState.last_changed !== previousState.previous_last_changed
        ) {
            Object.assign(this._data, previousState);
        }
    }

    _validateEntities(glucose_value, glucose_trend) {
        if (
            !this.hass.states[glucose_value] ||
            !this.hass.states[glucose_trend]
        ) {
            // Don't log error here, it will spam the console during startup
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

    _getCurrentState(glucose_value, glucose_trend) {
        const glucoseState = this.hass.states[glucose_value];
        const trendState = this.hass.states[glucose_trend];

        return {
            value: glucoseState.state,
            unit: glucoseState.attributes.unit_of_measurement,
            last_changed: glucoseState.last_changed,
            trend: trendState.state,
        };
    }

    _updateCurrentData(currentState) {
        if (this._data.unit !== currentState.unit) {
            this.TREND_SYMBOLS = this._getTrendDescriptions(
                currentState.unit || SugarTvCard.UNITS.MGDL,
            );
            this._data.unit = currentState.unit;
        }
        Object.assign(this._data, currentState);
    }

    _formatTime(timestamp) {
        if (
            !timestamp ||
            timestamp === 'unknown' ||
            timestamp === 'unavailable'
        ) {
            return SugarTvCard.DEFAULT_VALUES.TIME;
        }

        const options = {
            hour: '2-digit',
            minute: '2-digit',
        };

        const locale = this.config.locale || [];

        return new Date(timestamp).toLocaleTimeString(locale, options);
    }

    _calculateDelta() {
        const { value, previous_value, last_changed, previous_last_changed } =
            this._data;

        if (!this._isValidValue(value) || !this._isValidValue(previous_value)) {
            return null;
        }

        const timeDiff = Math.abs(
            new Date(last_changed) - new Date(previous_last_changed),
        );
        if (timeDiff >= 450000) {
            // 7.5 minutes
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
        const roundedDelta = Math.round(Math.abs(delta) * 10) / 10;
        return delta >= 0 ? `＋${roundedDelta}` : `－${roundedDelta}`;
    }

    _isValidValue(value) {
        return value && value !== 'unknown' && value !== 'unavailable';
    }

    _formatValue(value) {
        if (!this._isValidValue(value)) {
            return SugarTvCard.DEFAULT_VALUES.VALUE;
        }

        const sanitizedValue = String(value).replace(',', '.');
        const numValue = parseFloat(sanitizedValue);

        if (isNaN(numValue)) {
            return SugarTvCard.DEFAULT_VALUES.VALUE;
        }

        if (this._data.unit === SugarTvCard.UNITS.MMOLL) {
            return numValue.toFixed(1);
        }

        return Math.round(numValue);
    }

    render() {
        this._updateData();

        const { value, last_changed, trend } = this._data;
        const showPrediction = this.config.show_prediction !== false;
        const trendInfo =
            (trend && this.TREND_SYMBOLS[trend.toLowerCase()]) ||
            this.TREND_SYMBOLS.unknown;
        const trendIcon = trendInfo.icon;
        const prediction = trendInfo.prediction || '';

        return html`
            <div class="wrapper">
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

    static get styles() {
        return cardStyles;
    }
}

customElements.define('sugartv-card', SugarTvCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'sugartv-card',
    name: 'SugarTV Card',
    description:
        'A custom lovelace card for Home Assistant that provides a better way to display Dexcom data.',
});
