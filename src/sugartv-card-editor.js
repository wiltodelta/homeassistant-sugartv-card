import { LitElement, html } from 'lit';

function fireEvent(node, type, detail) {
    const event = new Event(type, {
        bubbles: true,
        composed: true,
    });
    event.detail = detail;
    node.dispatchEvent(event);
}

import { editorStyles } from './sugartv-card-styles.js';
import { getLocalizer } from './localize.js';

const DEFAULT_THRESHOLDS = {
    'mg/dL': { urgent_low: 54, low: 70, high: 180, urgent_high: 250 },
    'mmol/L': { urgent_low: 3.0, low: 3.9, high: 10.0, urgent_high: 13.9 },
};

class SugarTvCardEditor extends LitElement {
    static get properties() {
        return {
            hass: { attribute: false },
            config: { type: Object },
        };
    }

    setConfig(config) {
        this.config = config;
    }

    get _glucose_value() {
        return this.config.glucose_value || '';
    }

    get _glucose_trend() {
        return this.config.glucose_trend || '';
    }

    get _show_prediction() {
        return this.config.show_prediction !== false;
    }

    get _color_thresholds() {
        return this.config.color_thresholds !== false;
    }

    _getUnit() {
        const entityId = this.config.glucose_value;
        if (entityId && this.hass.states[entityId]) {
            const attrs = this.hass.states[entityId].attributes;
            if (attrs && attrs.unit_of_measurement) {
                return attrs.unit_of_measurement;
            }
        }
        return 'mg/dL';
    }

    _getThresholdValue(key) {
        if (this.config.thresholds && this.config.thresholds[key] != null) {
            return this.config.thresholds[key];
        }
        const unit = this._getUnit();
        const defaults =
            DEFAULT_THRESHOLDS[unit] || DEFAULT_THRESHOLDS['mg/dL'];
        return defaults[key];
    }

    render() {
        if (!this.hass || !this.config) {
            return html``;
        }

        const entities = Object.keys(this.hass.states).filter((eid) =>
            eid.startsWith('sensor.'),
        );
        const localize = getLocalizer(this.config, this.hass);
        const unit = this._getUnit();
        const defaults =
            DEFAULT_THRESHOLDS[unit] || DEFAULT_THRESHOLDS['mg/dL'];

        return html`
            <div class="card-config">
                <ha-select
                    naturalMenuWidth
                    fixedMenuPosition
                    label="${localize('editor.glucose_value')}"
                    .configValue=${'glucose_value'}
                    .value=${this._glucose_value}
                    @selected=${this._valueChanged}
                    @closed=${(ev) => ev.stopPropagation()}
                >
                    ${entities.map(
                        (entity) =>
                            html`<ha-list-item .value=${entity}
                                >${entity}</ha-list-item
                            >`,
                    )}
                </ha-select>

                <ha-select
                    naturalMenuWidth
                    fixedMenuPosition
                    label="${localize('editor.glucose_trend')}"
                    .configValue=${'glucose_trend'}
                    .value=${this._glucose_trend}
                    @selected=${this._valueChanged}
                    @closed=${(ev) => ev.stopPropagation()}
                >
                    ${entities.map(
                        (entity) =>
                            html`<ha-list-item .value=${entity}
                                >${entity}</ha-list-item
                            >`,
                    )}
                </ha-select>

                <ha-formfield .label=${localize('editor.show_prediction')}>
                    <ha-switch
                        .checked=${this._show_prediction}
                        .configValue=${'show_prediction'}
                        @change=${this._valueChanged}
                    ></ha-switch>
                </ha-formfield>

                <ha-formfield .label=${localize('editor.color_thresholds')}>
                    <ha-switch
                        .checked=${this._color_thresholds}
                        .configValue=${'color_thresholds'}
                        @change=${this._valueChanged}
                    ></ha-switch>
                </ha-formfield>

                ${this._color_thresholds
                    ? html`
                          <div class="thresholds-grid">
                              <ha-textfield
                                  label="${localize(
                                      'editor.urgent_low',
                                  )} (${unit})"
                                  type="number"
                                  .value=${this._getThresholdValue(
                                      'urgent_low',
                                  )}
                                  placeholder="${defaults.urgent_low}"
                                  .configValue=${'urgent_low'}
                                  @change=${this._thresholdChanged}
                              ></ha-textfield>
                              <ha-textfield
                                  label="${localize('editor.low')} (${unit})"
                                  type="number"
                                  .value=${this._getThresholdValue('low')}
                                  placeholder="${defaults.low}"
                                  .configValue=${'low'}
                                  @change=${this._thresholdChanged}
                              ></ha-textfield>
                              <ha-textfield
                                  label="${localize('editor.high')} (${unit})"
                                  type="number"
                                  .value=${this._getThresholdValue('high')}
                                  placeholder="${defaults.high}"
                                  .configValue=${'high'}
                                  @change=${this._thresholdChanged}
                              ></ha-textfield>
                              <ha-textfield
                                  label="${localize(
                                      'editor.urgent_high',
                                  )} (${unit})"
                                  type="number"
                                  .value=${this._getThresholdValue(
                                      'urgent_high',
                                  )}
                                  placeholder="${defaults.urgent_high}"
                                  .configValue=${'urgent_high'}
                                  @change=${this._thresholdChanged}
                              ></ha-textfield>
                          </div>
                      `
                    : ''}
            </div>
        `;
    }

    _valueChanged(ev) {
        if (!this.config || !this.hass) {
            return;
        }

        const { target } = ev;

        const newConfig = {
            ...this.config,
            [target.configValue]:
                target.configValue === 'show_prediction' ||
                target.configValue === 'color_thresholds'
                    ? target.checked
                    : target.value,
        };

        fireEvent(this, 'config-changed', { config: newConfig });
    }

    _thresholdChanged(ev) {
        if (!this.config || !this.hass) {
            return;
        }

        const { target } = ev;
        const key = target.configValue;
        const val = target.value === '' ? undefined : parseFloat(target.value);

        if (val !== undefined && (isNaN(val) || val < 0)) {
            target.value = this._getThresholdValue(key);
            return;
        }

        const unit = this._getUnit();
        const defaults =
            DEFAULT_THRESHOLDS[unit] || DEFAULT_THRESHOLDS['mg/dL'];
        const current = { ...defaults, ...(this.config.thresholds || {}) };

        if (val !== undefined) {
            current[key] = val;
        } else {
            current[key] = defaults[key];
        }

        if (
            current.urgent_low >= current.low ||
            current.low >= current.high ||
            current.high >= current.urgent_high
        ) {
            target.value = this._getThresholdValue(key);
            return;
        }

        const thresholds = { ...(this.config.thresholds || {}) };
        if (val === undefined) {
            delete thresholds[key];
        } else {
            thresholds[key] = val;
        }

        const newConfig = {
            ...this.config,
            thresholds:
                Object.keys(thresholds).length > 0 ? thresholds : undefined,
        };

        fireEvent(this, 'config-changed', { config: newConfig });
    }

    static get styles() {
        return editorStyles;
    }
}

customElements.define('sugartv-card-editor', SugarTvCardEditor);
