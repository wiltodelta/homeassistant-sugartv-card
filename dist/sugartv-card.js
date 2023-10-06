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
            history: {}
        };
    }

    render() {
        const value = this.hass.states[this.config.value_entity].state;
        const history_value = this.history.value;
        const trend = this.hass.states[this.config.trend_entity].state;
        const value_last_changed = this.hass.states[this.config.value_entity].last_changed;

        let delta = 0;

        if (value && history_value) {
            delta = history_value - value;
        }

        const date = new Date(value_last_changed);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        const formattedHours = hours < 10 ? `0${hours}` : hours;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        const timeString = `${formattedHours}:${formattedMinutes}`;

        let trend_symbol = "?";

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

        this.history.value = value;

        return html`
            <div class="wrapper">
                <div class="container">
                    <div class="time">${timeString}</div>
                    <div class="value">${value}</div>
                    <div class="trend">${trend_symbol}</div>
                    <div class="delta">${delta}</div>
                </div>
            </div>
        `;
    }

    setConfig(config) {
        if (!config.value_entity) {
            throw new Error("You need to define 'value_entity' in your configuration.")
        }
        if (!config.trend_entity) {
            throw new Error("You need to define 'trend_entity' in your configuration.")
        }
        this.config = config;
        this.config.last_value = 0;
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
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
                margin: 0 10%;
            }
            
            .trend {
                font-family: 'overpass';
                font-size: 20%;
                margin: 0 5% 0 0;
            }
            
            .delta {
                font-size: 20%;
            }     
        `;
    }
}

customElements.define("sugartv-card", SugarTvCard);