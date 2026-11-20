let mdiModulePromise;

class HaSvgIcon extends HTMLElement {
    static get observedAttributes() {
        return ['path'];
    }

    constructor() {
        super();
        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML = `
      <style>
        :host {
          display: var(--ha-icon-display, inline-flex);
          align-items: center;
          justify-content: center;
          position: relative;
          vertical-align: middle;
          fill: var(--icon-primary-color, currentcolor);
          width: var(--mdc-icon-size, 24px);
          height: var(--mdc-icon-size, 24px);
        }
        svg {
          width: 100%;
          height: 100%;
          pointer-events: none;
          display: block;
        }
      </style>
      <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
        <g><path class="primary-path"></path></g>
      </svg>
    `;
        this._pathEl = root.querySelector('path');
    }

    attributeChangedCallback(_name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this._pathEl.setAttribute('d', newValue || '');
        }
    }
}

if (!customElements.get('ha-svg-icon')) {
    customElements.define('ha-svg-icon', HaSvgIcon);
}

class HaIcon extends HTMLElement {
    static get observedAttributes() {
        return ['icon'];
    }

    constructor() {
        super();
        /*
         * Match home-assistant/frontend ha-icon.ts: the outer host sets only
         * fill: currentcolor, while ha-svg-icon carries inline-flex and
         * vertical-align: middle. Keeping the real two-element structure in
         * the mock ensures baseline-strut bugs show up in demo/ too.
         */
        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML = `
      <style>
        :host {
          fill: currentcolor;
        }
      </style>
      <ha-svg-icon></ha-svg-icon>
    `;
        this._svgIcon = root.querySelector('ha-svg-icon');
    }

    connectedCallback() {
        this._render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'icon' && oldValue !== newValue && this.isConnected) {
            this._render();
        }
    }

    async _render() {
        const requested = this.getAttribute('icon') || '';
        const icon = requested.startsWith('mdi:')
            ? requested.substring(4)
            : requested;

        if (!icon) {
            this._svgIcon.style.display = 'none';
            this._svgIcon.setAttribute('path', '');
            return;
        }

        const camelCaseIcon = icon.replace(/-./g, (x) => x[1].toUpperCase());
        const exportName = `mdi${camelCaseIcon.charAt(0).toUpperCase()}${camelCaseIcon.slice(1)}`;
        let path = '';

        try {
            mdiModulePromise ??=
                import('https://unpkg.com/@mdi/js@7.4.47/mdi.js');
            const module = await mdiModulePromise;
            if (this.getAttribute('icon') !== requested) return;
            path = module[exportName] || '';

            if (!path) {
                console.error(`Icon ${icon} not found in @mdi/js`);
            }
        } catch (error) {
            console.error(`Could not load icon ${icon}:`, error);
        }

        this._svgIcon.style.display = '';
        this._svgIcon.setAttribute('path', path);
    }
}

if (!customElements.get('ha-icon')) {
    customElements.define('ha-icon', HaIcon);
}
