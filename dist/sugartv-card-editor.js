import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";

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
        `;
    }
}

customElements.define("sugartv-card-editor", SugarTvCardEditor); 