import {
    LitElement,
    html,
} from "https://unpkg.com/lit-element@2.5.1/lit-element.js?module";

import { editorStyles } from "./sugartv-card-styles.js";

class SugarTvCardEditor extends LitElement {
    static get properties() {
        return {
            hass: { type: Object },
            _config: { type: Object }
        };
    }

    setConfig(config) {
        this._config = config;
    }

    get _glucose_value() {
        return this._config.glucose_value || '';
    }

    get _glucose_trend() {
        return this._config.glucose_trend || '';
    }

    _valueChanged(ev) {
        if (!this._config || !this.hass) {
            return;
        }
        
        const target = ev.target;
        const value = target.configValue === 'show_prediction' ? target.checked : target.value;
        
        if (this[`_${target.configValue}`] === value) {
            return;
        }

        const newConfig = {
            ...this._config,
            [target.configValue]: value,
        };
        
        const event = new CustomEvent('config-changed', {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    render() {
        if (!this.hass || !this._config) {
            return html``;
        }

        const entities = Object.keys(this.hass.states).filter(
            eid => eid.indexOf('sensor.') === 0
        );

        return html`
            <div class="card-config">
                <div class="values">
                    <ha-select
                        naturalMenuWidth
                        fixedMenuPosition
                        label="Glucose value (required)"
                        .configValue=${'glucose_value'}
                        .value=${this._glucose_value}
                        @selected=${this._valueChanged}
                        @closed=${ev => ev.stopPropagation()}
                    >
                        ${entities.map(entity => html`
                            <ha-list-item .value=${entity}>
                                ${entity}
                            </ha-list-item>
                        `)}
                    </ha-select>
                </div>

                <div class="values">
                    <ha-select
                        naturalMenuWidth
                        fixedMenuPosition
                        label="Glucose trend (required)"
                        .configValue=${'glucose_trend'}
                        .value=${this._glucose_trend}
                        @selected=${this._valueChanged}
                        @closed=${ev => ev.stopPropagation()}
                    >
                        ${entities.map(entity => html`
                            <ha-list-item .value=${entity}>
                                ${entity}
                            </ha-list-item>
                        `)}
                    </ha-select>
                </div>

                <div class="values">
                    <ha-formfield label="Show prediction">
                        <ha-switch
                            .checked=${this._config.show_prediction !== false}
                            .configValue=${'show_prediction'}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                </div>
            </div>
        `;
    }

    static get styles() {
        return editorStyles;
    }
}

customElements.define("sugartv-card-editor", SugarTvCardEditor);

export default SugarTvCardEditor; 