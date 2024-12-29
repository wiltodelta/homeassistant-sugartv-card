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
        if (this[`_${target.configValue}`] === target.value) {
            return;
        }

        const newConfig = {
            ...this._config,
            [target.configValue]: target.value,
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
                        label="Glucose Value Entity"
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
                        label="Glucose Trend Entity"
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
            </div>
        `;
    }

    static get styles() {
        return editorStyles;
    }
}

customElements.define("sugartv-card-editor", SugarTvCardEditor);

export default SugarTvCardEditor; 