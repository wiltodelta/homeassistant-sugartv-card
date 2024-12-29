import {
    LitElement,
    html,
} from "https://unpkg.com/lit-element@2.5.1/lit-element.js?module";

import { cardStyles } from "./sugartv-card-styles.js";
import "./sugartv-card-editor.js";

// Version
const VERSION = "0.5.0";

// Constants
const FONTS = [
    "https://fonts.googleapis.com/css?family=Roboto:400,700&amp;subset=cyrillic,cyrillic-ext,latin-ext",
    "https://overpass-30e2.kxcdn.com/overpass.css",
    "https://overpass-30e2.kxcdn.com/overpass-mono.css"
];

const TREND_SYMBOLS = {
    'rising quickly': '↑↑',
    'rising': '↑',
    'rising slightly': '↗',
    'steady': '→',
    'falling slightly': '↘',
    'falling': '↓',
    'falling quickly': '↓↓',
    'unknown': '↻'
};

const DEFAULT_VALUES = {
    VALUE: 'N/A',
    DELTA: '⧖',
    TIME: '00:00'
};

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
            type: "custom:sugartv-card",
            glucose_value: "sensor.dexcom_glucose_value",
            glucose_trend: "sensor.dexcom_glucose_trend"
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
            console.error("SugarTV Card: One or both entities not found:", glucose_value, glucose_trend);
            this._data = {
                ...this._getInitialDataState(),
                value: "error",
                trend: "error"
            };
            return false;
        }
        return true;
    }

    _getCurrentState(glucose_value, glucose_trend) {
        return {
            value: this._hass.states[glucose_value].state,
            last_changed: this._hass.states[glucose_value].last_changed,
            trend: this._hass.states[glucose_trend].state
        };
    }

    _updateCurrentData(currentState) {
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

        const delta = value - previous_value;
        const roundedDelta = Math.round(Math.abs(delta) * 10) / 10;
        return delta >= 0 ? `＋${roundedDelta}` : `－${roundedDelta}`;
    }

    _isValidValue(value) {
        return value && value !== "unknown" && value !== "unavailable";
    }

    _formatValue(value) {
        return this._isValidValue(value) ? value : DEFAULT_VALUES.VALUE;
    }

    render() {
        if (!this._hass || !this._config) {
            return html``;
        }

        const { value, last_changed, trend } = this._data;

        return html`
            <div class="wrapper">
                <div class="container">
                    <div class="time">${this._formatTime(last_changed)}</div>
                    <div class="value">${this._formatValue(value)}</div>
                    <div class="trend">${TREND_SYMBOLS[trend] || TREND_SYMBOLS.unknown}</div>
                    <div class="delta">${this._calculateDelta()}</div>
                </div>
            </div>
        `;
    }

    setConfig(config) {
        console.info("%c SUGARTV-CARD %c v" + VERSION, 
            "color: white; background: red; font-weight: 700;",
            "color: red; background: white; font-weight: 700;");

        if (!config.glucose_value) {
            throw new Error("You need to define 'glucose_value' in your configuration.");
        }

        if (!config.glucose_trend) {
            throw new Error("You need to define 'glucose_trend' in your configuration.");
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