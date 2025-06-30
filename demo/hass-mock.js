import {
    mdiChevronDoubleUp,
    mdiArrowUp,
    mdiArrowTopRight,
    mdiChevronDoubleRight,
    mdiArrowBottomRight,
    mdiArrowDown,
    mdiChevronDoubleDown,
    mdiHelpCircleOutline,
    mdiProgressClock
} from 'https://unpkg.com/@mdi/js@7.4.47/mdi.js';

const MDI_ICONS = {
    'chevron-double-up': mdiChevronDoubleUp,
    'arrow-up': mdiArrowUp,
    'arrow-top-right': mdiArrowTopRight,
    'chevron-double-right': mdiChevronDoubleRight,
    'arrow-bottom-right': mdiArrowBottomRight,
    'arrow-down': mdiArrowDown,
    'chevron-double-down': mdiChevronDoubleDown,
    'help-circle-outline': mdiHelpCircleOutline,
    'progress-clock': mdiProgressClock,
};

class HaIcon extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this._render();
    }

    static get observedAttributes() {
        return ['icon'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'icon' && oldValue !== newValue) {
            this._render();
        }
    }

    _render() {
        const iconName = this.getAttribute('icon') || '';
        const icon = iconName.startsWith('mdi:') ? iconName.substring(4) : iconName;
        const path = MDI_ICONS[icon];

        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: var(--mdc-icon-size, 24px);
          height: var(--mdc-icon-size, 24px);
        }
        svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
        }
      </style>
      <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
        <path d="${path || ''}"></path>
      </svg>
    `;
    }
}

customElements.define('ha-icon', HaIcon); 