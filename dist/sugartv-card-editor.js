import { LitElement, html, css } from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";
import { cardStyles } from "./sugartv-card-styles.js";

class SugarTvCardEditor extends LitElement {
    static getStubConfig() {
        return {
            type: "custom:sugartv-card",
            value_entity: "",
            trend_entity: ""
        };
    }

    static get properties() {
        return {
            hass: { type: Object },
            config: { type: Object }
        };
    }

    setConfig(config) {
        this.config = config;
    }

    get _value_entity() {
        return this.config.value_entity || '';
    }

    get _trend_entity() {
        return this.config.trend_entity || '';
    }

    _valueChanged(ev) {
        if (!this.config || !this.hass) {
            return;
        }
        const target = ev.target;
        if (target.configValue === undefined) {
            return;
        }

        const newValue = target.value;

        if (this[`_${target.configValue}`] === newValue) {
            return;
        }

        const newConfig = {
            ...this.config,
            [target.configValue]: newValue
        };
        const event = new CustomEvent('config-changed', {
            detail: { config: newConfig },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }

    render() {
        if (!this.hass || !this.config) {
            return html``;
        }

        const hasRequiredFields = this._value_entity && this._trend_entity;

        return html`
            <div class="card-config">
                ${!hasRequiredFields ? html`
                    <div class="preview">
                        <div class="wrapper">
                            <div class="container">
                                <div class="time">12:34</div>
                                <div class="value">120</div>
                                <div class="trend">↗</div>
                                <div class="delta">+5</div>
                            </div>
                        </div>
                        <div class="preview-hint">
                            Select Dexcom value and trend sensors to display data.
                        </div>
                    </div>
                ` : ''}
                <div class="values">
                    <ha-entity-picker
                        .label=${"Value (Required)"}
                        .hass=${this.hass}
                        .value=${this._value_entity}
                        .configValue=${"value_entity"}
                        .includeDomains=${["sensor"]}
                        @value-changed=${this._valueChanged}
                        allow-custom-entity
                        required
                    ></ha-entity-picker>
                    <ha-entity-picker
                        .label=${"Trend (Required)"}
                        .hass=${this.hass}
                        .value=${this._trend_entity}
                        .configValue=${"trend_entity"}
                        .includeDomains=${["sensor"]}
                        @value-changed=${this._valueChanged}
                        allow-custom-entity
                        required
                    ></ha-entity-picker>
                </div>
            </div>
        `;
    }

    static get styles() {
        return [
            cardStyles,
            css`
                .card-config {
                    padding: 16px;
                }
                .values {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .preview {
                    background: var(--primary-background-color, #fafafa);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                    text-align: center;
                    opacity: 0.7;
                }
                .preview-hint {
                    color: var(--primary-text-color, #212121);
                    opacity: 0.7;
                    font-size: 0.9em;
                    margin-top: 8px;
                }
            `
        ];
    }
}

customElements.define("sugartv-card-editor", SugarTvCardEditor); 