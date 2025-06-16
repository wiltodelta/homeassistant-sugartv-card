import {
    LitElement,
    html,
    css
} from 'lit';

import { cardStyles } from "./sugartv-card-styles.js";
import "./sugartv-card-editor.js";

const VERSION = process.env.VERSION;

// Constants
const FONTS = [
    'https://fonts.googleapis.com/css?family=Roboto:400,700&amp;subset=cyrillic,cyrillic-ext,latin-ext',
    'https://overpass-30e2.kxcdn.com/overpass.css',
    'https://overpass-30e2.kxcdn.com/overpass-mono.css'
];

const DEFAULT_VALUES = {
    VALUE: 'N/A',
    DELTA: '⧖',
    TIME: '00:00'
};

// Glucose measurement units (for fallback)
const UNITS = {
    MGDL: 'mg/dL',
    MMOLL: 'mmol/L'
};

// Function to get trend descriptions based on units
function getTrendDescriptions(unit) {
    const isMgdl = unit === UNITS.MGDL;
    return {
        rising_quickly: {
            symbol: '↑↑',
            prediction: `Expected to rise over ${isMgdl ? '45 mg/dL' : '2.5 mmol/L'} in 15 minutes`
        },
        rising: {
            symbol: '↑',
            prediction: `Expected to rise ${isMgdl ? '30-45 mg/dL' : '1.7-2.5 mmol/L'} in 15 minutes`
        },
        rising_slightly: {
            symbol: '↗',
            prediction: `Expected to rise ${isMgdl ? '15-30 mg/dL' : '0.8-1.7 mmol/L'} in 15 minutes`
        },
        steady: {
            symbol: '→'
        },
        falling_slightly: {
            symbol: '↘',
            prediction: `Expected to fall ${isMgdl ? '15-30 mg/dL' : '0.8-1.7 mmol/L'} in 15 minutes`
        },
        falling: {
            symbol: '↓',
            prediction: `Expected to fall ${isMgdl ? '30-45 mg/dL' : '1.7-2.5 mmol/L'} in 15 minutes`
        },
        falling_quickly: {
            symbol: '↓↓',
            prediction: `Expected to fall over ${isMgdl ? '45 mg/dL' : '2.5 mmol/L'} in 15 minutes`
        },
        unknown: {
            symbol: '↻'
        }
    };
}

// Initialize TREND_SYMBOLS with default mg/dL values
let TREND_SYMBOLS = getTrendDescriptions(UNITS.MGDL);

// Helper Functions
function loadCSS(url) {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

// Load required fonts
FONTS.forEach(loadCSS);

class SugarTvCard extends LitElement {
    static get properties() {
        return {
            _hass: {},
            _config: {},
            _data: {}
        };
    }

    static getStubConfig() {
        return {
            type: 'custom:sugartv-card',
            glucose_value: 'sensor.dexcom_glucose_value',
            glucose_trend: 'sensor.dexcom_glucose_trend',
            show_prediction: true
        };
    }

    static async getConfigElement() {
        return document.createElement("sugartv-card-editor");
    }

    constructor() {
        super();
        this._data = this._getInitialDataState();
    }

    _getInitialDataState() {
        return {
            value: null,
            last_changed: null,
            trend: null,
            unit: UNITS.MGDL,
            previous_value: null,
            previous_last_changed: null,
            previous_trend: null
        };
    }

    set hass(hass) {
        const previous_hass = this._hass;
        this._hass = hass;

        if (this._hass) {
            this._updateData(previous_hass);
        }
    }

    _updateData(previous_hass) {
        const { glucose_value, glucose_trend } = this._config;

        if (!this._validateEntities(glucose_value, glucose_trend)) {
            return;
        }

        const currentState = this._getCurrentState(glucose_value, glucose_trend);
        this._updateCurrentData(currentState);

        if (previous_hass) {
            this._updatePreviousData(previous_hass, glucose_value, glucose_trend, currentState);
        }
    }

    _validateEntities(glucose_value, glucose_trend) {
        if (!this._hass.states[glucose_value] || !this._hass.states[glucose_trend]) {
            console.error('SugarTV Card: One or both entities not found:', glucose_value, glucose_trend);
            this._data = {
                ...this._getInitialDataState(),
                value: 0,
                last_changed: 0,
                trend: 'unknown',
                unit: UNITS.MGDL
            };
            return false;
        }
        return true;
    }

    _getCurrentState(glucose_value, glucose_trend) {
        const glucoseState = this._hass.states[glucose_value];
        const trendState = this._hass.states[glucose_trend];

        return {
            value: glucoseState.state,
            unit: glucoseState.attributes.unit_of_measurement,
            last_changed: glucoseState.last_changed,
            trend: trendState.state
        };
    }

    _updateCurrentData(currentState) {
        if (this._data.unit !== currentState.unit) {
            TREND_SYMBOLS = getTrendDescriptions(currentState.unit || UNITS.MGDL);
            this._data.unit = currentState.unit;
        }
        Object.assign(this._data, currentState);
    }

    _updatePreviousData(previous_hass, glucose_value, glucose_trend, currentState) {
        const previousState = {
            previous_value: previous_hass.states[glucose_value].state,
            previous_last_changed: previous_hass.states[glucose_value].last_changed,
            previous_trend: previous_hass.states[glucose_trend].state
        };

        if (currentState.last_changed !== previousState.previous_last_changed) {
            Object.assign(this._data, previousState);
        }
    }

    _formatTime(timestamp) {
        if (!timestamp || timestamp === 'unknown' || timestamp === 'unavailable') {
            return DEFAULT_VALUES.TIME;
        }

        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    _calculateDelta() {
        const { value, previous_value, last_changed, previous_last_changed } = this._data;

        if (!this._isValidValue(value) || !this._isValidValue(previous_value)) {
            return DEFAULT_VALUES.DELTA;
        }

        const timeDiff = Math.abs(new Date(last_changed) - new Date(previous_last_changed));
        if (timeDiff >= 450000) { // 7.5 minutes
            return DEFAULT_VALUES.DELTA;
        }

        const currentValue = parseFloat(String(value).replace(',', '.'));
        const previousValue = parseFloat(String(previous_value).replace(',', '.'));

        if (isNaN(currentValue) || isNaN(previousValue)) {
            return DEFAULT_VALUES.DELTA;
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
            return DEFAULT_VALUES.VALUE;
        }

        const sanitizedValue = String(value).replace(',', '.');
        const numValue = parseFloat(sanitizedValue);

        if (isNaN(numValue)) {
            return DEFAULT_VALUES.VALUE;
        }

        if (this._data.unit === UNITS.MMOLL) {
            return numValue.toFixed(1);
        }
        
        return Math.round(numValue);
    }

    render() {
        if (!this._hass || !this._config) {
            return html``;
        }

        const { value, last_changed, trend } = this._data;
        const showPrediction = this._config.show_prediction !== false;
        const prediction = TREND_SYMBOLS[trend]?.prediction || TREND_SYMBOLS.unknown.prediction;

        return html`
            <div class="wrapper">
                <div class="container">
                    <div class="main-row">
                        <div class="time">${this._formatTime(last_changed)}</div>
                        <div class="value">${this._formatValue(value)}</div>
                        <div class="trend">${TREND_SYMBOLS[trend]?.symbol || TREND_SYMBOLS.unknown.symbol}</div>
                        <div class="delta">${this._calculateDelta()}</div>
                    </div>
                    ${showPrediction && prediction ? html`
                        <div class="prediction">${prediction}</div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    setConfig(config) {
        console.info('%c SUGARTV-CARD %c ' + VERSION,
            'color: white; background: red; font-weight: 700;',
            'color: red; background: white; font-weight: 700;');

        if (!config.glucose_value) {
            throw new Error('You need to define glucose_value in your configuration.');
        }

        if (!config.glucose_trend) {
            throw new Error('You need to define glucose_trend in your configuration.');
        }

        this._config = config;
        this._data = this._data || this._getInitialDataState();
    }

    getCardSize() {
        return 1;
    }

    static get styles() {
        return cardStyles;
    }
}

customElements.define("sugartv-card", SugarTvCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'sugartv-card',
    name: 'SugarTV Card',
    description: 'A custom lovelace card for Home Assistant that provides a better way to display Dexcom data.'
});