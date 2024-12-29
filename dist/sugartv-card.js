import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";

function loadCSS(url) {
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
}

loadCSS("https://fonts.googleapis.com/css?family=Roboto:400,700&amp;subset=cyrillic,cyrillic-ext,latin-ext");
loadCSS("https://overpass-30e2.kxcdn.com/overpass.css");
loadCSS("https://overpass-30e2.kxcdn.com/overpass-mono.css");

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

    // Whenever anything updates in Home Assistant, the hass object is updated
    // and passed out to every card. If you want to react to state changes, this is where
    // you do it. If not, you can just ommit this setter entirely.
    // Note that if you do NOT have a `set hass(hass)` in your class, you can access the hass
    // object through `this.hass`. But if you DO have it, you need to save the hass object
    // manually, thusly:

    set hass(hass) {
        const previous_hass = this._hass;
        this._hass = hass;

        const glucose_value = this._config.glucose_value;
        const glucose_trend = this._config.glucose_trend;

        if (this._hass) {
            if (!this._hass.states[glucose_value] || !this._hass.states[glucose_trend]) {
                console.error("SugarTV Card: One or both entities not found:", glucose_value, glucose_trend);
                this._data = {
                    value: "error",
                    last_changed: null,
                    trend: "error",
                    previous_value: null,
                    previous_last_changed: null,
                    previous_trend: null
                };
                return;
            }

            const value = this._hass.states[glucose_value].state;
            const last_changed = this._hass.states[glucose_value].last_changed;
            const trend = this._hass.states[glucose_trend].state;

            this._data.value = value;
            this._data.last_changed = last_changed;
            this._data.trend = trend;

            // Are there previous values?
            if (previous_hass) {
                const previous_value = previous_hass.states[glucose_value].state;
                const previous_last_changed = previous_hass.states[glucose_value].last_changed;
                const previous_trend = previous_hass.states[glucose_trend].state;

                // Save only if the value has changed
                if (last_changed != previous_last_changed) {
                    this._data.previous_value = previous_value;
                    this._data.previous_last_changed = previous_last_changed;
                    this._data.previous_trend = previous_trend;
                }
            }
        }
    }

    // The render() function of a LitElement returns the HTML of your card, and any time one or the
    // properties defined above are updated, the correct parts of the rendered html are magically
    // replaced with the new values. Check https://lit.dev for more info.
    render() {
        if (!this._hass || !this._config) {
            return html``;
        }

        console.debug(JSON.stringify(this._data));

        const value = this._data.value;
        const last_changed = this._data.last_changed;
        const trend = this._data.trend;

        const previous_value = this._data.previous_value;
        //const previous_last_changed = this._data.previous_last_changed;
        //const previous_trend = this._data.previous_trend;

        let time_str = "00:00";

        if (last_changed && last_changed != "unknown" && last_changed != "unavailable") {
            const date = new Date(last_changed);
            time_str = date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        let trend_symbol = "↻";

        switch (trend) {
            case "rising quickly":
                trend_symbol = "↑↑"
                break;
            case "rising":
                trend_symbol = "↑"
                break;
            case "rising slightly":
                trend_symbol = "↗"
                break;
            case "steady":
                trend_symbol = "→"
                break;
            case "falling slightly":
                trend_symbol = "↘"
                break;
            case "falling":
                trend_symbol = "↓"
                break;
            case "falling quickly":
                trend_symbol = "↓↓"
                break;
        }

        let delta_str = "⧖";

        if (value && previous_value
            && value != "unknown" && previous_value != "unknown"
            && value != "unavailable" && previous_value != "unavailable") {
            const last_changed_date = new Date(last_changed);
            const previous_last_changed = this._data.previous_last_changed;
            const previous_last_changed_date = new Date(previous_last_changed);

            // Let's make sure the change is in the last 5 minutes
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

    // The config object contains the configuration specified by the user in ui-lovelace.yaml
    // for your card.
    // It will minimally contain:
    // config.type = "custom:my-custom-card"
    // `setConfig` MUST be defined - and is in fact the only function that must be.
    // It doesn't need to actually DO anything, though.

    // Note that setConfig will ALWAYS be called at the start of the lifetime of the card
    // BEFORE the `hass` object is first provided.
    // It MAY be called several times during the lifetime of the card, e.g. if the configuration
    // of the card is changed.
    setConfig(config) {
        console.info("%c SUGARTV-CARD ", "color: white; background: red; font-weight: 700;");

        if (!config.glucose_value) {
            throw new Error("You need to define 'glucose_value' in your configuration.")
        }

        if (!config.glucose_trend) {
            throw new Error("You need to define 'glucose_trend' in your configuration.")
        }

        if (!this._data) {
            this._data = {
                value: null,
                last_changed: null,
                trend: null,
                previous_value: null,
                previous_last_changed: null,
                previous_trend: null
            };
        }

        this._config = config;
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    // This is actually optional. If not present, the cardHeight is assumed to be 1.
    getCardSize() {
        return 1;
    }

    static get styles() {
        return css`            
            :host, .card {
                display: flex;
                height: 100%;
                width: 100%;
                font-family: 'Roboto', sans-serif;
                container-type: inline-size;
            }
            
            .wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                align-items: center;
                justify-content: center;
            }
            
            .container {
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
                padding: 5cqi;
                box-sizing: border-box;
            }
            
            .time {
                font-size: 6cqi;
            }
            
            .value {
                font-size: 20cqi;
                margin: 0 2.5cqi;
            }
            
            .trend {
                font-size: 10cqi;
                font-family: 'overpass';
                margin: 0 2.5cqi 0 0;
            }
            
            .delta {
                font-size: 6cqi;
            }
        `;
    }
}

customElements.define("sugartv-card", SugarTvCard);

// Next we add our card to the list of custom cards
window.customCards = window.customCards || [];
window.customCards.push({
    type: "sugartv-card",
    name: "SugarTV Card",
    description: "A custom lovelace card for Home Assistant that provides a better way to display Dexcom data."
});