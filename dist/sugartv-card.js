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
        };
    }

    render() {
        const last_changed = this.hass.states[this.config.value_entity].last_changed;

        const date = new Date(last_changed);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        const formattedHours = hours < 10 ? `0${hours}` : hours;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        const timeString = `${formattedHours}:${formattedMinutes}`;

        const value = this.hass.states[this.config.value_entity].state;
        const trend = this.hass.states[this.config.trend_entity].state;

        let trent_symbol = "?";

        switch (trend) {
            case "rising quickly":
                trent_symbol = "↑↑"
                break;
            case "rising":
                trent_symbol = "↑"
                break;
            case "rising slightly":
                trent_symbol = "↗"
                break;
            case "steady":
                trent_symbol = "→"
                break;
            case "falling slightly":
                trent_symbol = "↘"
                break;
            case "falling":
                trent_symbol = "↓"
                break;
            case "falling quickly":
                trent_symbol = "↓↓"
                break;
        }
        return html`
            <!--<div class="update-fail">There was a problem during the update, will try again soon.</div>-->
            <div class="wrapper">
                <div class="container">
                    <!--<div class="loading">Loading…</div>-->
                    <div class="time">${timeString}</div>
                    <div class="value">${value}</div>
                    <div class="trend">${trent_symbol}</div>
                    <div class="delta">+5</div>
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
                font-size: 15vw;
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
                line-height: 1;
            }
            
            .update-fail {
                display: none;
                position: absolute;
                left: 0;
                right: 0;
                text-align: center;
                padding: 2%;
                font-size: 5%;
                color: white;
                background-color: #CD113B;
            }
            
            .loading {
                font-size: 20%;
                font-weight: bold;
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