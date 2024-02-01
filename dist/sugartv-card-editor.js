import { LitElement, html } from 'lit-element'

const fireEvent = (node, type, detail = {}, options = {}) => {
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed,
    })

    event.detail = detail
    node.dispatchEvent(event)
    return event
}

export default class SugarTvCardEditor extends LitElement {
    static get properties() {
        return { hass: {}, config: {} }
    }

    setConfig(config) {
        this.config = config
    }

    render() {
        if (!this.hass)
            return html``

        return html`
            <div class="card-config">
                <div class="overall-config">
                    <div class="side-by-side">
                        <ha-entity-picker
                            label="Value Entity (required)"
                            .hass=${this.hass}
                            .value="${this.config.value_entity}"
                            .configValue=${'value_entity'}
                            @change="${this.valueChanged}"
                            allow-custom-entity
                        ></ha-entity-picker>
                    </div>
                    <div class="side-by-side">
                        <ha-entity-picker
                            label="Trend Entity (required)"
                            .hass=${this.hass}
                            .value="${this.config.trend_entity}"
                            .configValue=${'trend_entity'}
                            @change="${this.valueChanged}"
                            allow-custom-entity
                        ></ha-entity-picker>
                    </div>
                </div>
            </div>
        `;
    }

    valueChanged(ev) {
        if (!this.config || !this.hass) {
            return
        }
        const { target } = ev
        if (this[`_${target.configValue}`] === target.value) {
            return
        }
        if (target.configValue) {
            if (target.value === '') {
                delete this.config[target.configValue]
            } else {
                this.config = {
                    ...this.config,
                    [target.configValue]:
                        target.checked !== undefined ? target.checked : target.value,
                }
            }
        }
        fireEvent(this, 'config-changed', { config: this.config })
    }
}