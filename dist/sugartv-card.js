import {
    LitElement,
    html,
} from "https://unpkg.com/lit-element@2.5.1/lit-element.js?module";

import { cardStyles } from "./sugartv-card-styles.js";
import { translations } from "./sugartv-card-translations.js";
import "./sugartv-card-editor.js";

// Version
const VERSION = "0.6.0";

// Constants
const FONTS = [
    'https://fonts.googleapis.com/css?family=Roboto:400,700&amp;subset=cyrillic,cyrillic-ext,latin-ext',
    'https://overpass-30e2.kxcdn.com/overpass.css',
    'https://overpass-30e2.kxcdn.com/overpass-mono.css'
];

function getDefaultValues(language = 'en') {
    const trans = translations[language]?.defaults || translations.en.defaults;
    return {
        value: trans.value,
        delta: trans.delta,
        time: trans.time
    };
}

function getUnits(language = 'en') {
    const trans = translations[language]?.units || translations.en.units;
    return {
        mgdl: trans.mgdl,
        mmol: trans.mmol
    };
}

const DEFAULT_VALUES = getDefaultValues();
const UNITS = getUnits();

// Function to get trend descriptions based on units and language
function getTrendDescriptions(unit = 'mgdl', language = 'en') {
    const languageExists = translations[language];
    const trans = (languageExists ? translations[language] : translations.en).trends;
    const unitType = unit === 'mgdl' ? 'mgdl' : 'mmol';

    return {
        rising_quickly: {
            symbol: trans.rising_quickly.symbol,
            description: trans.rising_quickly[unitType].description,
            prediction: trans.rising_quickly[unitType].prediction
        },
        rising: {
            symbol: trans.rising.symbol,
            description: trans.rising[unitType].description,
            prediction: trans.rising[unitType].prediction
        },
        rising_slightly: {
            symbol: trans.rising_slightly.symbol,
            description: trans.rising_slightly[unitType].description,
            prediction: trans.rising_slightly[unitType].prediction
        },
        steady: {
            symbol: trans.steady.symbol,
            description: trans.steady[unitType].description,
            prediction: trans.steady[unitType].prediction
        },
        falling_slightly: {
            symbol: trans.falling_slightly.symbol,
            description: trans.falling_slightly[unitType].description,
            prediction: trans.falling_slightly[unitType].prediction
        },
        falling: {
            symbol: trans.falling.symbol,
            description: trans.falling[unitType].description,
            prediction: trans.falling[unitType].prediction
        },
        falling_quickly: {
            symbol: trans.falling_quickly.symbol,
            description: trans.falling_quickly[unitType].description,
            prediction: trans.falling_quickly[unitType].prediction
        },
        unknown: {
            symbol: trans.unknown.symbol,
            description: trans.unknown.description,
            prediction: trans.unknown.prediction
        }
    };
}

// Helper Functions
function loadCSS(url) {
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
}

// Load required fonts
FONTS.forEach(loadCSS);

// Initialize TREND_SYMBOLS with default mg/dL values and English language
let TREND_SYMBOLS = getTrendDescriptions(UNITS.mgdl, 'en');

class SugarTvCard extends LitElement {
    static get properties() {
        return {
            _hass: { type: Object },
            _config: { type: Object },
            _data: { type: Object },
            _language: { type: String }
        };
    }

    static getStubConfig() {
        return {
            type: "custom:sugartv-card",
            glucose_value: "sensor.dexcom_glucose_value",
            glucose_trend: "sensor.dexcom_glucose_trend",
            show_prediction: true
        };
    }

    static async getConfigElement() {
        return document.createElement("sugartv-card-editor");
    }

    constructor() {
        super();
        this._data = this._getInitialDataState();
        this._language = 'en';
    }

    _getInitialDataState() {
        return {
            value: 0,
            previous_value: 0,
            last_changed: 0,
            previous_last_changed: 0,
            trend: "unknown",
            previous_trend: "unknown",
            unit: UNITS.mgdl
        };
    }

    set hass(hass) {
        const previous_hass = this._hass;
        this._hass = hass;

        // Update language if changed
        const newLanguage = hass.language || 'en';
        if (this._language !== newLanguage) {
            this._language = newLanguage;
            TREND_SYMBOLS = getTrendDescriptions(this._data.unit, this._language);
            DEFAULT_VALUES = getDefaultValues(this._language);
            UNITS = getUnits(this._language);
        }

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
            console.error("SugarTV Card: One or both entities not found:", glucose_value, glucose_trend);
            this._data = {
                ...this._getInitialDataState(),
                value: 0,
                last_changed: 0,
                trend: "unknown",
                unit: UNITS.mgdl
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
            TREND_SYMBOLS = getTrendDescriptions(currentState.unit || UNITS.mgdl);
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
        if (!timestamp || timestamp === "unknown" || timestamp === "unavailable") {
            return DEFAULT_VALUES.time;
        }

        return new Date(timestamp).toLocaleTimeString(this._hass.language, {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    _formatNumber(value, options = {}) {
        if (!this._hass) return value;
        return new Intl.NumberFormat(this._hass.language, options).format(value);
    }

    _formatValue(value) {
        if (!this._isValidValue(value)) {
            return DEFAULT_VALUES.value;
        }
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return DEFAULT_VALUES.value;
        }

        return this._formatNumber(numValue, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        });
    }

    _calculateDelta() {
        const { value, previous_value, last_changed, previous_last_changed } = this._data;

        if (!this._isValidValue(value) || !this._isValidValue(previous_value)) {
            return DEFAULT_VALUES.delta;
        }

        const timeDiff = Math.abs(new Date(last_changed) - new Date(previous_last_changed));
        if (timeDiff >= 450000) { // 7.5 minutes
            return DEFAULT_VALUES.delta;
        }

        const delta = value - previous_value;
        const roundedDelta = Math.round(Math.abs(delta) * 10) / 10;
        const formattedDelta = this._formatNumber(roundedDelta, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        });
        return delta >= 0 ? `＋${formattedDelta}` : `－${formattedDelta}`;
    }

    _isValidValue(value) {
        return value && value !== "unknown" && value !== "unavailable";
    }

    render() {
        if (!this._hass || !this._config) {
            return html``;
        }

        const { value, last_changed, trend } = this._data;
        const showPrediction = this._config.show_prediction !== false;

        return html`
            <div class="wrapper">
                <div class="container">
                    <div class="main-row">
                        <div class="time">${this._formatTime(last_changed)}</div>
                        <div class="value">${this._formatValue(value)}</div>
                        <div class="trend">${TREND_SYMBOLS[trend]?.symbol || TREND_SYMBOLS.unknown.symbol}</div>
                        <div class="delta">${this._calculateDelta()}</div>
                    </div>
                    ${showPrediction ? html`
                        <div class="prediction">${TREND_SYMBOLS[trend]?.prediction || TREND_SYMBOLS.unknown.prediction}</div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    setConfig(config) {
        console.info('%c SUGARTV-CARD %c v' + VERSION, 
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
    type: "sugartv-card",
    name: "SugarTV Card",
    description: "A custom lovelace card for Home Assistant that provides a better way to display Dexcom data."
});