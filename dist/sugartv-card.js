import {
    LitElement,
    html,
    css
} from "https://unpkg.com/lit-element@2.5.1/lit-element.js?module";

// Версия
const VERSION = "1.0.0";

// Стили для редактора
const editorStyles = css`
    .card-config {
        padding: 16px;
    }
    .values {
        padding-left: 16px;
        margin: 8px 0;
    }
    ha-select {
        width: 100%;
    }
`;

// Стили для карточки
const cardStyles = css`
    .card-content {
        padding: 16px;
    }
    .glucose-value {
        font-size: 24px;
        font-weight: bold;
    }
    .trend-arrow {
        margin-left: 8px;
    }
`;

// Редактор карточки
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
        
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        }));
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

// Основная карточка
class SugarTvCard extends LitElement {
    static get properties() {
        return {
            hass: { type: Object },
            config: { type: Object }
        };
    }

    static getConfigElement() {
        return document.createElement("sugartv-card-editor");
    }

    setConfig(config) {
        if (!config.glucose_value || !config.glucose_trend) {
            throw new Error('Please define glucose_value and glucose_trend entities');
        }
        this.config = config;
    }

    render() {
        if (!this.hass || !this.config) {
            return html``;
        }

        const glucoseState = this.hass.states[this.config.glucose_value];
        const trendState = this.hass.states[this.config.glucose_trend];

        if (!glucoseState || !trendState) {
            return html`
                <ha-card>
                    <div class="card-content">
                        Entity not found
                    </div>
                </ha-card>
            `;
        }

        return html`
            <ha-card>
                <div class="card-content">
                    <span class="glucose-value">${glucoseState.state}</span>
                    <span class="trend-arrow">${trendState.state}</span>
                </div>
            </ha-card>
        `;
    }

    static get styles() {
        return cardStyles;
    }
}

// Регистрация компонентов
customElements.define("sugartv-card-editor", SugarTvCardEditor);
customElements.define("sugartv-card", SugarTvCard);

// Экспорт версии и компонентов
export { VERSION, SugarTvCard, SugarTvCardEditor }; 