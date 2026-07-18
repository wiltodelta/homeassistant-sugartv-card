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

/*
 * The reading is trimmed to the alphabetic baseline so the space above it
 * matches the space below. Digits sit on that baseline; a decimal comma does
 * not, and in a locale that writes 11,4 it hung far enough below to print on
 * the forecast line. The card reserves exactly the ink that hangs over.
 */
describe('descender clearance under the reading', () => {
    let realGetComputedStyle;

    beforeEach(() => {
        realGetComputedStyle = globalThis.getComputedStyle;
        SugarTvCard._measuringContext = undefined;
    });

    afterEach(() => {
        globalThis.getComputedStyle = realGetComputedStyle;
        SugarTvCard._measuringContext = undefined;
    });

    // Stand in for the canvas, which the test environment has no real one of.
    // The numbers are what Roboto actually reports at this size.
    function stubMeasuring(descentByText) {
        SugarTvCard._measuringContext = {
            font: '',
            measureText: (text) => ({
                actualBoundingBoxDescent: descentByText[text] ?? 0,
            }),
        };
    }

    const descentFor = (text, descentPx) => {
        const card = new SugarTvCard();
        card._data = { unit: 'mmol/L' };
        const { setProperty } = stubRenderRoot(card, { text, fontSize: 80 });
        stubMeasuring({ [text]: descentPx });

        card._measureValueDescent();

        const call = setProperty.mock.calls.find(
            ([name]) => name === '--value-descent',
        );
        return call ? Number(call[1]) : null;
    };

    it('reserves room for a comma, which hangs below the baseline', () => {
        // 80px over a 20u value is 4px a unit, so 11.36px of ink is 2.84u.
        expect(descentFor('11,4', 11.36)).toBe(2.84);
    });

    it('reserves almost nothing for digits, which sit on it', () => {
        expect(descentFor('205', 0.8)).toBe(0.2);
    });

    it('does not pay for a comma the locale did not write', () => {
        expect(descentFor('11.4', 0.48)).toBeLessThan(
            descentFor('11,4', 11.36),
        );
    });

    /*
     * The property that lets one measurement stand for every size: the ink and
     * the font grow together, so a card that re-measures after resizing gets
     * the same answer and cannot oscillate.
     */
    it('is scale invariant', () => {
        const single = new SugarTvCard();
        single._data = { unit: 'mmol/L' };
        const a = stubRenderRoot(single, { text: '11,4', fontSize: 80 });
        stubMeasuring({ '11,4': 11.36 });
        single._measureValueDescent();

        const doubled = new SugarTvCard();
        doubled._data = { unit: 'mmol/L' };
        const b = stubRenderRoot(doubled, { text: '11,4', fontSize: 160 });
        stubMeasuring({ '11,4': 22.72 });
        doubled._measureValueDescent();

        const read = (s) =>
            s.mock.calls.find(([n]) => n === '--value-descent')[1];
        expect(read(b.setProperty)).toBe(read(a.setProperty));
    });

    it('does not rewrite an unchanged value', () => {
        const card = new SugarTvCard();
        card._data = { unit: 'mmol/L' };
        const { setProperty } = stubRenderRoot(card, { text: '11,4' });
        stubMeasuring({ '11,4': 11.36 });

        card._measureValueDescent();
        card._measureValueDescent();

        expect(
            setProperty.mock.calls.filter(([n]) => n === '--value-descent'),
        ).toHaveLength(1);
    });

    it('survives an environment with no canvas at all', () => {
        const card = new SugarTvCard();
        card._data = { unit: 'mmol/L' };
        stubRenderRoot(card, { text: '11,4' });
        SugarTvCard._measuringContext = null;

        expect(() => card._measureValueDescent()).not.toThrow();
    });
});

/*
 * The reading time may not wrap, so a wordy phrasing has to be scaled down or
 * it runs off the card. "14 perccel ezelőtt" overran a 420px card by 68px and
 * was clipped at both edges, taking the first digit of the reading with it.
 */
describe('fitting the reading time beside the reading', () => {
    let realGetComputedStyle;

    beforeEach(() => {
        realGetComputedStyle = globalThis.getComputedStyle;
        SugarTvCard._measuringContext = undefined;
    });

    afterEach(() => {
        globalThis.getComputedStyle = realGetComputedStyle;
        SugarTvCard._measuringContext = undefined;
    });

    /*
     * containerWidth is the card, lineWidth what the row currently occupies,
     * timeWidth the part of it the time takes, and naturalTime what the phrase
     * wants at full size. Everything the method needs, and nothing that needs
     * a real layout engine.
     */
    function stubLine(
        card,
        {
            containerWidth,
            lineWidth,
            timeWidth,
            naturalTime,
            text = '14 min. ago',
            valueFont = 80,
        },
    ) {
        const setProperty = vi.fn();
        const wrapper = { style: { setProperty } };
        const container = { clientWidth: containerWidth };
        const line = { getBoundingClientRect: () => ({ width: lineWidth }) };
        const time = {
            textContent: text,
            getBoundingClientRect: () => ({ width: timeWidth }),
        };
        const value = { textContent: '11,4' };
        card.renderRoot = {
            querySelector: (sel) =>
                ({
                    '.wrapper': wrapper,
                    '.container': container,
                    '.line': line,
                    '.time': time,
                    '.value': value,
                })[sel] ?? null,
        };
        globalThis.getComputedStyle = (el) =>
            el === value
                ? { fontSize: `${valueFont}px` }
                : { fontWeight: '400', fontFamily: 'Roboto' };
        SugarTvCard._measuringContext = {
            font: '',
            measureText: () => ({ width: naturalTime }),
        };
        return { setProperty };
    }

    // The LAST write, not the first: the settling test measures twice and it is
    // the second answer that says whether the result is stable.
    const scaleOf = (setProperty) => {
        const calls = setProperty.mock.calls.filter(
            ([name]) => name === '--time-scale',
        );
        return calls.length ? Number(calls[calls.length - 1][1]) : null;
    };

    it('leaves a phrase that fits alone', () => {
        const card = new SugarTvCard();
        // 400px of card, 40px of padding, 200px taken by everything else,
        // and the phrase wants 120 of the 160 left.
        const { setProperty } = stubLine(card, {
            containerWidth: 400,
            lineWidth: 320,
            timeWidth: 120,
            naturalTime: 120,
        });

        card._measureTimeFit();

        expect(scaleOf(setProperty)).toBe(1);
    });

    it('scales a phrase that would overrun the card', () => {
        const card = new SugarTvCard();
        // The same card, but the phrase wants 200 where only 160 is free.
        const { setProperty } = stubLine(card, {
            containerWidth: 400,
            lineWidth: 400,
            timeWidth: 200,
            naturalTime: 200,
        });

        card._measureTimeFit();

        expect(scaleOf(setProperty)).toBeCloseTo(0.8, 2);
    });

    /*
     * Measured from the phrase's natural width rather than its rendered one, so
     * applying a scale does not change the next answer. Were it otherwise the
     * card would shrink the time a little more on every update.
     */
    it('settles rather than shrinking further each pass', () => {
        const card = new SugarTvCard();
        const { setProperty } = stubLine(card, {
            containerWidth: 400,
            lineWidth: 400,
            timeWidth: 200,
            naturalTime: 200,
        });

        card._measureTimeFit();
        const first = scaleOf(setProperty);
        /*
         * A second pass sees the already-scaled row: the time now renders at
         * 0.8 of its size, so the line is narrower, but the phrase's natural
         * width has not moved. Re-stubbing hands the card a fresh wrapper, so
         * the second pass has to be read from the second mock.
         */
        const second = stubLine(card, {
            containerWidth: 400,
            lineWidth: 360,
            timeWidth: 160,
            naturalTime: 200,
        });
        card._timeScale = undefined; // force a write rather than the no-op guard
        card._measureTimeFit();

        expect(scaleOf(second.setProperty)).toBe(first);
    });

    it('stops shrinking before the phrase becomes unreadable', () => {
        const card = new SugarTvCard();
        const { setProperty } = stubLine(card, {
            containerWidth: 400,
            lineWidth: 900,
            timeWidth: 700,
            naturalTime: 700,
        });

        card._measureTimeFit();

        expect(scaleOf(setProperty)).toBe(SugarTvCard.MIN_TIME_SCALE);
    });

    it('survives an environment with no canvas', () => {
        const card = new SugarTvCard();
        stubLine(card, {
            containerWidth: 400,
            lineWidth: 520,
            timeWidth: 320,
            naturalTime: 320,
        });
        SugarTvCard._measuringContext = null;

        expect(() => card._measureTimeFit()).not.toThrow();
    });
});
