import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";
import { VERSION } from "./sugartv-card.js";

class SugarTvCardEditor extends LitElement {
    static get properties() {
        return {
            hass: {},
            config: {},
            version: { type: String }
        };
    }

    constructor() {
        super();
        this.version = VERSION;
    }

    setConfig(config) {
        this.config = config;
    }

    // Get all sensor entities
    getSensorEntities() {
        return Object.keys(this.hass.states).filter(eid => eid.substr(0, 7) === 'sensor.');
    }

    render() {
        if (!this.hass) {
            return html``;
        }

        const sensorEntities = this.getSensorEntities();

        return html`
            <div class="card-config">
                <div class="version">Version: ${this.version}</div>
                ${!this.config.value_entity ? html`
                    <div class="preview">
                        <div class="card">
                            <div class="wrapper">
                                <div class="container">
                                    <div class="time">12:34</div>
                                    <div class="value">120</div>
                                    <div class="trend">↗</div>
                                    <div class="delta">+5</div>
                                </div>
                            </div>
                        </div>
                        <div class="preview-text">Preview: This is how this card will look with sample data.</div>
                    </div>
                ` : ''}
                
                <div class="values">
                    <ha-select
                        naturalMenuWidth
                        fixedMenuPosition
                        label="Value"
                        .configValue=${'value_entity'}
                        .value=${this.config.value_entity}
                        @selected=${this._valueChanged}
                        @closed=${(ev) => ev.stopPropagation()}
                        required
                    >
                        ${sensorEntities.map(entity => html`
                            <ha-list-item .value=${entity}>${entity}</ha-list-item>
                        `)}
                    </ha-select>
                </div>
                
                <div class="values">
                    <ha-select
                        naturalMenuWidth
                        fixedMenuPosition
                        label="Trend"
                        .configValue=${'trend_entity'}
                        .value=${this.config.trend_entity}
                        @selected=${this._valueChanged}
                        @closed=${(ev) => ev.stopPropagation()}
                        required
                    >
                        ${sensorEntities.map(entity => html`
                            <ha-list-item .value=${entity}>${entity}</ha-list-item>
                        `)}
                    </ha-select>
                </div>
            </div>
        `;
    }

    _valueChanged(ev) {
        if (!this.config || !this.hass) {
            return;
        }
        
        const target = ev.target;
        const configValue = target.configValue;
        const value = ev.target.value;
        
        if (this.config[configValue] === value) {
            return;
        }

        const newConfig = {
            ...this.config,
            [configValue]: value,
        };
        
        const event = new CustomEvent('config-changed', {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    static get styles() {
        return css`
            .version {
                padding: 8px 16px;
                color: var(--secondary-text-color);
                font-size: 0.9em;
            }
            ha-select {
                width: 100%;
                margin-bottom: 8px;
            }
            .values {
                padding: 16px;
            }
            ha-select[required] label::after {
                color: var(--error-color, red);
                content: " *";
                margin-left: 4px;
            }
            .preview {
                padding: 16px;
                border-bottom: 1px solid var(--divider-color, #e0e0e0);
                margin-bottom: 16px;
                background: var(--secondary-background-color, #f5f5f5);
            }
            .preview-text {
                color: var(--secondary-text-color, #666);
                font-style: italic;
                margin-top: 8px;
                text-align: center;
            }
            .card {
                display: flex;
                height: 100px;
                width: 100%;
                font-family: 'Roboto', sans-serif;
                --min-dimension: min(100px, 100%);
                --base-size: calc(var(--min-dimension) / 20);
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
                padding: var(--base-size);
                box-sizing: border-box;
            }
            .time {
                font-size: calc(var(--base-size) * 1.2);
            }
            .value {
                font-size: calc(var(--base-size) * 4);
                margin: 0 calc(var(--base-size) * 0.5);
            }
            .trend {
                font-size: calc(var(--base-size) * 2);
                font-family: 'overpass';
                margin: 0 calc(var(--base-size) * 0.5) 0 0;
            }
            .delta {
                font-size: calc(var(--base-size) * 1.2);
            }
        `;
    }
}

customElements.define("sugartv-card-editor", SugarTvCardEditor); 