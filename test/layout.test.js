import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mock LitElement before importing the card ──────────────────────────
vi.mock('lit', () => {
    class FakeLitElement {
        static get properties() {
            return {};
        }
        static get styles() {
            return '';
        }
        requestUpdate() {}
    }
    return {
        LitElement: FakeLitElement,
        html: (strings, ...values) =>
            strings.reduce(
                (acc, s, i) =>
                    acc + s + (values[i] !== undefined ? values[i] : ''),
                '',
            ),
        css: (strings, ...values) =>
            strings.reduce(
                (acc, s, i) =>
                    acc + s + (values[i] !== undefined ? values[i] : ''),
                '',
            ),
    };
});

vi.mock('../src/sugartv-card-styles.js', () => ({
    cardStyles: '',
}));

if (typeof customElements === 'undefined') {
    globalThis.customElements = { define: vi.fn() };
}
globalThis.window = globalThis.window || {};
window.customCards = [];
vi.spyOn(console, 'info').mockImplementation(() => {});

const mod = await import('../src/sugartv-card.js');
const SugarTvCard =
    customElements.define.mock?.calls?.[0]?.[1] ||
    Object.values(mod).find((v) => typeof v === 'function');

/*
 * The column derives its width budget from a measurement, so the test has to
 * supply one. Nothing here touches a real layout engine: the point of the
 * method is arithmetic on a measured width, and that is what is pinned.
 */
function stubRenderRoot(card, { text = '145', fontSize = 80, width = 135 }) {
    const setProperty = vi.fn();
    const wrapper = { style: { setProperty } };
    const value = {
        textContent: text,
        getBoundingClientRect: () => ({ width }),
    };
    card.renderRoot = {
        querySelector: (sel) =>
            ({ '.wrapper': wrapper, '.value': value })[sel] ?? null,
    };
    globalThis.getComputedStyle = (el) =>
        el === value ? { fontSize: `${fontSize}px` } : {};
    return { setProperty };
}

function cardWithUnit(unit) {
    const card = new SugarTvCard();
    card._data = { unit };
    return card;
}

const lastBudget = (setProperty) => Number(setProperty.mock.calls.at(-1)[1]);

describe('column width budget', () => {
    let realGetComputedStyle;

    beforeEach(() => {
        realGetComputedStyle = globalThis.getComputedStyle;
    });

    afterEach(() => {
        globalThis.getComputedStyle = realGetComputedStyle;
    });

    it('sets --tall-w from the measured width', () => {
        const card = cardWithUnit('mg/dL');
        const { setProperty } = stubRenderRoot(card, {
            text: '145',
            fontSize: 80,
            width: 135,
        });

        card._measureValueWidth();

        // 80px over a 20u value is 4px per unit, so "145" is 11.25u a glyph.
        // Three glyphs is 33.75u, plus 5u of padding a side and 1u of slack.
        expect(setProperty).toHaveBeenCalledWith('--tall-w', '44.8');
    });

    /*
     * The property that keeps this from oscillating. A new budget changes --u,
     * which changes both the font-size and the measured width by the same
     * factor, so the budget it produces has to come out identical or the card
     * would resize itself forever.
     */
    it('is scale invariant: a doubled render yields the same budget', () => {
        const single = cardWithUnit('mg/dL');
        const a = stubRenderRoot(single, {
            text: '145',
            fontSize: 80,
            width: 135,
        });
        single._measureValueWidth();

        const doubled = cardWithUnit('mg/dL');
        const b = stubRenderRoot(doubled, {
            text: '145',
            fontSize: 160,
            width: 270,
        });
        doubled._measureValueWidth();

        expect(lastBudget(b.setProperty)).toBe(lastBudget(a.setProperty));
    });

    /*
     * The budget covers the widest reading the unit allows, not the one on
     * screen, so the number keeps one size instead of jumping when a reading
     * crosses from two digits to three.
     */
    it('sizes for the unit, not for the reading on screen', () => {
        const short = cardWithUnit('mg/dL');
        const a = stubRenderRoot(short, {
            text: '99',
            fontSize: 80,
            width: 90,
        });
        short._measureValueWidth();

        const long = cardWithUnit('mg/dL');
        const b = stubRenderRoot(long, {
            text: '145',
            fontSize: 80,
            width: 135,
        });
        long._measureValueWidth();

        expect(lastBudget(b.setProperty)).toBe(lastBudget(a.setProperty));
    });

    it('gives mmol a wider budget than mg/dL, since it renders four glyphs', () => {
        const mgdl = cardWithUnit('mg/dL');
        const a = stubRenderRoot(mgdl, {
            text: '145',
            fontSize: 80,
            width: 135,
        });
        mgdl._measureValueWidth();

        const mmol = cardWithUnit('mmol/L');
        const b = stubRenderRoot(mmol, {
            text: '8.1',
            fontSize: 80,
            width: 135,
        });
        mmol._measureValueWidth();

        expect(lastBudget(b.setProperty)).toBeGreaterThan(
            lastBudget(a.setProperty),
        );
    });

    it('does not rewrite an unchanged budget', () => {
        const card = cardWithUnit('mg/dL');
        const { setProperty } = stubRenderRoot(card, {
            text: '145',
            fontSize: 80,
            width: 135,
        });

        card._measureValueWidth();
        card._measureValueWidth();
        card._measureValueWidth();

        expect(setProperty).toHaveBeenCalledTimes(1);
    });

    it('recomputes when the unit changes', () => {
        const card = cardWithUnit('mg/dL');
        const { setProperty } = stubRenderRoot(card, {
            text: '145',
            fontSize: 80,
            width: 135,
        });

        card._measureValueWidth();
        card._data = { unit: 'mmol/L' };
        card._measureValueWidth();

        expect(setProperty).toHaveBeenCalledTimes(2);
    });

    // The card renders before it has been laid out, and inside a test harness
    // it has no DOM at all. None of that may throw.
    it.each([
        ['no render root', (card) => (card.renderRoot = undefined)],
        [
            'no elements yet',
            (card) => (card.renderRoot = { querySelector: () => null }),
        ],
        [
            'an empty value',
            (card) => stubRenderRoot(card, { text: '  ', width: 135 }),
        ],
        [
            'a zero width',
            (card) => stubRenderRoot(card, { text: '145', width: 0 }),
        ],
        [
            'no font size',
            (card) => stubRenderRoot(card, { text: '145', fontSize: 0 }),
        ],
    ])('survives %s', (_label, arrange) => {
        const card = cardWithUnit('mg/dL');
        arrange(card);
        expect(() => card._measureValueWidth()).not.toThrow();
    });
});

/*
 * The surface Home Assistant itself calls. These are contracts rather than
 * logic, which is exactly why they are easy to break silently: the card shipped
 * a stub pointing at an entity id no install has, and the README quotes the
 * grid defaults back to users.
 */
describe('the contract with Home Assistant', () => {
    it('offers a stub config the card accepts', () => {
        const stub = SugarTvCard.getStubConfig();
        const card = new SugarTvCard();
        expect(() => card.setConfig(stub)).not.toThrow();
    });

    it('suggests an entity shaped like a real one', () => {
        const { glucose_value } = SugarTvCard.getStubConfig();

        expect(glucose_value).toMatch(/^sensor\..+_glucose_value$/);
        // Dexcom names the entity from the account username, so an id with a
        // literal "dexcom_" head exists for nobody.
        expect(glucose_value).not.toContain('dexcom_');
    });

    it('leaves thresholds out of the stub, whose unit is not yet knowable', () => {
        expect(SugarTvCard.getStubConfig()).not.toHaveProperty('thresholds');
    });

    // README documents these numbers as the starting point users adjust to get
    // the column layout, so they cannot drift silently.
    it('starts at the grid size the README documents', () => {
        expect(new SugarTvCard().getGridOptions()).toMatchObject({
            columns: 6,
            rows: 1,
            min_columns: 3,
        });
    });

    it('reports a card size for masonry', () => {
        expect(typeof new SugarTvCard().getCardSize()).toBe('number');
    });

    it('opens more-info for its own entity on tap', () => {
        const card = new SugarTvCard();
        card.config = { glucose_value: 'sensor.jane_glucose_value' };
        const dispatch = vi.fn();
        card.dispatchEvent = dispatch;

        card._handleTap();

        const event = dispatch.mock.calls[0][0];
        expect(event.type).toBe('hass-more-info');
        expect(event.detail).toEqual({
            entityId: 'sensor.jane_glucose_value',
        });
        // It has to cross the shadow boundary to reach Home Assistant.
        expect(event.bubbles).toBe(true);
        expect(event.composed).toBe(true);
    });

    it('stays quiet on tap when no entity is configured', () => {
        const card = new SugarTvCard();
        card.config = {};
        const dispatch = vi.fn();
        card.dispatchEvent = dispatch;

        card._handleTap();

        expect(dispatch).not.toHaveBeenCalled();
    });
});
