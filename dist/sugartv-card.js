import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";
import { cardStyles } from "./sugartv-card-styles.js";
import "./sugartv-card-editor.js";

// External resources configuration
const EXTERNAL_RESOURCES = [
    "https://fonts.googleapis.com/css?family=Roboto:400,700&amp;subset=cyrillic,cyrillic-ext,latin-ext",
    "https://overpass-30e2.kxcdn.com/overpass.css",
    "https://overpass-30e2.kxcdn.com/overpass-mono.css"
];

/**
 * Loads a CSS file by injecting a link tag into the document head
 * @param {string} url - The URL of the CSS file to load
 */
function loadCSS(url) {
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
}

// Load all external resources
EXTERNAL_RESOURCES.forEach(loadCSS);

/**
 * SugarTvCard - Custom element for displaying sugar/glucose monitoring data
 * @customElement
 * @extends LitElement
 */
class SugarTvCard extends LitElement {
    static get properties() {
        return {
            _hass: { type: Object },
            _config: { type: Object },
            _data: { type: Object }
        };
    }

    constructor() {
        super();
        this._data = {};
    }

    /**
     * Updates the card's data when Home Assistant state changes
     * @param {Object} hass - Home Assistant state object
     */
    set hass(hass) {
        const previous_hass = this._hass;
        this._hass = hass;
        this._updateCardData(previous_hass);
    }

    /**
     * Updates the card's internal data based on Home Assistant state
     * @param {Object} previous_hass - Previous Home Assistant state
     * @private
     */
    _updateCardData(previous_hass) {
        if (!this._hass || !this._config) return;

        const value_entity = this._config.value_entity;
        const trend_entity = this._config.trend_entity;

        const value = this._hass.states[value_entity].state;
        const last_changed = this._hass.states[value_entity].last_changed;
        const trend = this._hass.states[trend_entity].state;

        this._data.value = value;
        this._data.last_changed = last_changed;
        this._data.trend = trend;

        if (previous_hass) {
            const previous_value = previous_hass.states[value_entity].state;
            const previous_last_changed = previous_hass.states[value_entity].last_changed;
            const previous_trend = previous_hass.states[trend_entity].state;

            if (last_changed != previous_last_changed) {
                this._data.previous_value = previous_value;
                this._data.previous_last_changed = previous_last_changed;
                this._data.previous_trend = previous_trend;
            }
        }
    }

    /**
     * Formats the timestamp into a readable time string
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Formatted time string
     * @private
     */
    _formatTime(timestamp) {
        if (!timestamp || timestamp === "unknown" || timestamp === "unavailable") {
            return "00:00";
        }
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Converts trend text to a symbol
     * @param {string} trend - Trend text
     * @returns {string} Trend symbol
     * @private
     */
    _getTrendSymbol(trend) {
        const trendMap = {
            "rising quickly": "↑↑",
            "rising": "↑",
            "rising slightly": "↗",
            "stable": "→",
            "falling slightly": "↘",
            "falling": "↓",
            "falling quickly": "↓↓",
            "none": "↻",
            "not computable": "↻",
            "out of range": "↻"
        };
        return trendMap[trend] || "↻";
    }

    render() {
        if (!this._hass || !this._config) {
            return html``;
        }

        const { value, last_changed, trend, previous_value } = this._data;
        const time_str = this._formatTime(last_changed);
        const trend_symbol = this._getTrendSymbol(trend);

        let delta_str = "⧖";

        if (value && previous_value
            && value != "unknown" && previous_value != "unknown"
            && value != "unavailable" && previous_value != "unavailable") {
            const last_changed_date = new Date(last_changed);
            const previous_last_changed = this._data.previous_last_changed;
            const previous_last_changed_date = new Date(previous_last_changed);

            if (Math.abs(last_changed_date - previous_last_changed_date) < 450000) {
                let delta = value - previous_value;

                if (delta >= 0) {
                    delta_str = `＋${(Math.round(delta * 10) / 10)}`;
                }
                else {
                    delta_str = `－${(Math.round(delta * -1 * 10) / 10)}`;
                }
            }
        }

        let value_str = "N/A"

        if (value && value != "unknown" && value != "unavailable") {
            value_str = value;
        }

        return html`
            <div class="wrapper">
                <div class="container">
                    <div class="time">${time_str}</div>
                    <div class="value">${value_str}</div>
                    <div class="trend">${trend_symbol}</div>
                    <div class="delta">${delta_str}</div>
                </div>
            </div>
        `;
    }

    /**
     * Validates and sets the card configuration
     * @param {Object} config - Card configuration object
     * @throws {Error} If configuration is invalid
     */
    setConfig(config) {
        if (!config.value_entity) {
            throw new Error('Please define value_entity');
        }
        if (!config.trend_entity) {
            throw new Error('Please define trend_entity');
        }

        // Validate entity existence
        if (this._hass) {
            if (!this._hass.states[config.value_entity]) {
                throw new Error(`Entity ${config.value_entity} not found`);
            }
            if (!this._hass.states[config.trend_entity]) {
                throw new Error(`Entity ${config.trend_entity} not found`);
            }
        }

        this._config = {
            ...config,
            update_interval: config.update_interval || 60,
            title: config.title || 'Sugar Level',
            icon: config.icon || 'mdi:diabetes',
            show_graph: config.show_graph !== undefined ? config.show_graph : true,
            show_trend: config.show_trend !== undefined ? config.show_trend : true
        };
    }

    /**
     * Returns the size of the card in units
     * @returns {number} Card size
     */
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