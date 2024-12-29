import { LitElement, html, css } from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";

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

        return html`
            <div class="card-config">
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
        return css`
            .card-config {
                padding: 16px;
            }
            .values {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
        `;
    }
}

customElements.define("sugartv-card-editor", SugarTvCardEditor); 