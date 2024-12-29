import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";

class SugarTvCardEditor extends LitElement {
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
        return this.config.value_entity || "";
    }

    get _trend_entity() {
        return this.config.trend_entity || "";
    }

    render() {
        if (!this.hass) {
            return html``;
        }

        return html`
            <div class="card-config">
                <div class="values">
                    <ha-entity-picker
                        label=${"Value (required)"}
                        .hass=${this.hass}
                        .value=${this._value_entity}
                        .configValue=${"value_entity"}
                        .includeDomains=${["sensor"]}
                        @value-changed=${this._valueChanged}
                        allow-custom-entity
                    ></ha-entity-picker>
                    <ha-entity-picker
                        label=${"Trend (required)"}
                        .hass=${this.hass}
                        .value=${this._trend_entity}
                        .configValue=${"trend_entity"}
                        .includeDomains=${["sensor"]}
                        @value-changed=${this._valueChanged}
                        allow-custom-entity
                    ></ha-entity-picker>
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
        const event = new CustomEvent("config-changed", {
            detail: { config: this.config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
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
            ha-entity-picker {
                width: 100%;
            }
        `;
    }
}

customElements.define("sugartv-card-editor", SugarTvCardEditor); 