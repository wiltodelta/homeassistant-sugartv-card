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

    async _render() {
        const iconName = this.getAttribute('icon') || '';
        const icon = iconName.startsWith('mdi:')
            ? iconName.substring(4)
            : iconName;

        if (!icon) {
            this.shadowRoot.innerHTML = '';
            return;
        }

        const toCamelCase = (s) => s.replace(/-./g, (x) => x[1].toUpperCase());
        const camelCaseIcon = toCamelCase(icon);
        const exportName = `mdi${camelCaseIcon.charAt(0).toUpperCase()}${camelCaseIcon.slice(1)}`;
        let path = '';

        try {
            const module = await import(
                `https://unpkg.com/@mdi/js@7.4.47/mdi.js`
            );
            path = module[exportName];

            if (!path) {
                console.error(`Icon ${icon} not found in @mdi/js`);
            }
        } catch (error) {
            console.error(`Could not load icon ${icon}:`, error);
        }

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
