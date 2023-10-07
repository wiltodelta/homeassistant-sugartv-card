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
            hass: {},
            config: {},
            data: {}
        };
    }

    // Whenever anything updates in Home Assistant, the hass object is updated
    // and passed out to every card. If you want to react to state changes, this is where
    // you do it. If not, you can just ommit this setter entirely.
    // Note that if you do NOT have a `set hass(hass)` in your class, you can access the hass
    // object through `this.hass`. But if you DO have it, you need to save the hass object
    // manually, thusly:
    set hass(hass) {
        const previous_hass = this.hass;

        const value_entity = this.config.value_entity;
        const trend_entity = this.config.trend_entity;

        const value = hass.states[value_entity].state;
        const last_changed = hass.states[value_entity].last_changed;
        const trend = hass.states[trend_entity].state;

        const previous_value = previous_hass.states[value_entity].state;
        const previous_last_changed = previous_hass.states[value_entity].last_changed;
        const previous_trend = previous_hass.states[trend_entity].state;

        this.data.value = value;
        this.data.last_changed = last_changed;
        this.data.trend = trend;

        if (last_changed != previous_last_changed) {
            this.data.previous_value = previous_value;
            this.data.previous_last_changed = previous_last_changed;
            this.data.previous_trend = previous_trend;
        }

        this.hass = hass;
    }

    // The render() function of a LitElement returns the HTML of your card, and any time one or the
    // properties defined above are updated, the correct parts of the rendered html are magically
    // replaced with the new values. Check https://lit.dev for more info.
    render() {
        //if (!this.hass || !this.config) {
        //    return html``;
        //}

        console.debug(this.data);

        const value = this.data.value;
        const last_changed = this.data.last_changed;
        const trend = this.data.trend;

        const previous_value = this.data.value;
        //const previous_last_changed = this.data.last_changed;
        //const previous_trend = this.data.trend;

        const date = new Date(last_changed);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        const formattedHours = hours < 10 ? `0${hours}` : hours;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        const timeString = `${formattedHours}:${formattedMinutes}`;

        let trend_symbol = "▢";

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

        let delta = null;
        let delta_str = "▢";

        if (value && previous_value) {
            delta = value - previous_value;

            if (delta >= 0) {
                delta_str = `＋${delta}`;
            }
            else {
                delta_str = `－${delta}`;
            }
        }

        return html`
            <div class="wrapper">
                <div class="container">
                    <div class="time">${timeString}</div>
                    <div class="value">${value}</div>
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

        if (!config.value_entity) {
            throw new Error("You need to define 'value_entity' in your configuration.")
        }

        if (!config.trend_entity) {
            throw new Error("You need to define 'trend_entity' in your configuration.")
        }

        this.config = config;

        const dataObj = {
            value: null,
            last_changed: null,
            trend: null,
            previous_value: null,
            previous_last_changed: null,
            previous_trend: null
        };

        this.data = dataObj;
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    // This is actually optional. If not present, the cardHeight is assumed to be 1.
    getCardSize() {
        return 1;
    }

    static get styles() {
        return css`            
            :host {
                margin: 0;
                height: 100%;
                font-family: 'Roboto', sans-serif;
                font-size: 35vw;
            }
            
            .wrapper {
                display: flex;
                flex-direction: column;
                width: 80%;
                height: 100%;
                align-items: center;
                justify-content: center;
            }
            
            .container {
                display: flex;
                align-items: center;
                line-height: 1;
            }

            .time {
                font-size: 20%;
            }
            
            .value {
                font-size: 50%;
                font-weight: bold;
                margin: 0 8%;
            }
            
            .trend {
                font-family: 'overpass';
                font-size: 30%;
                margin: 0 5% 0 0;
            }
            
            .delta {
                font-size: 20%;
            }
        `;
    }
}

customElements.define("sugartv-card", SugarTvCard);

// Next we add our card to the list of custom cards
window.customCards = window.customCards || []; // Create the list if it doesn't exist. Careful not to overwrite it
window.customCards.push({
    type: "sugartv-card",
    name: "SugarTV Card",
    description: "A custom lovelace card for Home Assistant that provides a better way to display Dexcom data."
});