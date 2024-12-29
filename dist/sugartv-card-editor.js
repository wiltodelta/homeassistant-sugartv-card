import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";

import { fireEvent, createEntityRow } from "https://unpkg.com/custom-card-helpers@1.9.0/dist/index.m.js?module";
import "@ha/components/ha-entity-picker";

class SugarTvCardEditor extends LitElement {
    static get properties() {
        return {
            hass: {},
            config: {}
        };
    }

    setConfig(config) {
        this.config = config;
    }

    get _glucose_value() {
        return this.config.glucose_value || "";
    }

    get _glucose_trend() {
        return this.config.glucose_trend || "";
    }

    render() {
        if (!this.hass) {
            return html``;
        }

        return html`
            <div class="card-config">
                <div class="values">
                    <ha-entity-picker
                        .hass=${this.hass}
                        .value=${this._glucose_value}
                        .configValue=${"glucose_value"}
                        .label=${"Glucose value (required)"}
                        .includeDomains=${["sensor"]}
                        @value-changed=${this._valueChanged}
                        allow-custom-entity
                    ></ha-entity-picker>
                    <div class="help-text">Select sensor that provides glucose value (e.g. sensor.dexcom_glucose_value)</div>
                </div>
                <div class="values">
                    <ha-entity-picker
                        .hass=${this.hass}
                        .value=${this._glucose_trend}
                        .configValue=${"glucose_trend"}
                        .label=${"Glucose trend (required)"}
                        .includeDomains=${["sensor"]}
                        @value-changed=${this._valueChanged}
                        allow-custom-entity
                    ></ha-entity-picker>
                    <div class="help-text">Select sensor that provides glucose trend (e.g. sensor.dexcom_glucose_trend)</div>
                </div>
            </div>
        `;
    }

    _valueChanged(ev) {
        if (!this.config || !this.hass) {
            return;
        }
        const target = ev.target;
        if (this[`_${target.configValue}`] === target.value) {
            return;
        }
        if (target.configValue) {
            if (target.value === "") {
                delete this.config[target.configValue];
            } else {
                this.config = {
                    ...this.config,
                    [target.configValue]: target.value,
                };
            }
        }
        const messageEvent = new CustomEvent("config-changed", {
            detail: { config: this.config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(messageEvent);
    }

    static get styles() {
        return css`
            .values {
                padding-bottom: 16px;
            }
            ha-entity-picker {
                width: 100%;
            }
            .help-text {
                color: var(--secondary-text-color);
                font-size: 12px;
                margin-top: 4px;
            }
        `;
    }
}

customElements.define("sugartv-card-editor", SugarTvCardEditor); 