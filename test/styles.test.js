import { describe, it, expect, vi } from 'vitest';

/*
 * The one suite that reads the REAL stylesheet.
 *
 * Every other test file mocks `sugartv-card-styles.js` away, so the card's
 * logic is covered and the CSS that renders it is not. That gap is where the
 * age fade actually lives: `_ageTier` can name the rungs perfectly and the card
 * still draw them in the wrong order, or draw a stale reading too faint to
 * read, and no assertion anywhere would notice.
 *
 * `css` is stubbed to return the raw string so the rules can be parsed.
 */
vi.mock('lit', () => ({
    css: (strings, ...values) =>
        strings.reduce(
            (acc, s, i) => acc + s + (values[i] !== undefined ? values[i] : ''),
            '',
        ),
}));

const { cardStyles } = await import('../src/sugartv-card-styles.js');

// The opacity declared inside `:host(<selector>)`, or null when the rung
// declares none, which is how "full strength" is spelled.
const hostOpacity = (selector) => {
    const block = cardStyles.match(
        new RegExp(`:host\\(\\.${selector}\\)\\s*\\{([^}]*)\\}`),
    );
    if (!block) return null;
    const found = block[1].match(/opacity:\s*([\d.]+)/);
    return found ? Number(found[1]) : null;
};

/*
 * Composite text over the card and score it the way WCAG does. The card's
 * default text is HA's #212121 on a white card; the numbers below are the
 * reason the rungs sit where they do rather than on round-looking values.
 */
const contrastOnWhite = (alpha) => {
    const channel = Math.round(255 - alpha * (255 - 33));
    const linear = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const luminance = linear(channel); // grey, so one channel describes it
    return (1.0 + 0.05) / (luminance + 0.05);
};

describe('the age fade in the stylesheet', () => {
    it('draws a current reading at full strength', () => {
        // No rung of its own: full strength is the card's ordinary appearance.
        expect(hostOpacity('current')).toBeNull();
    });

    /*
     * The direction, asserted on the CSS rather than on the tier names. An
     * inverted stylesheet passes every logic test in the suite, which is how
     * the backwards version shipped in two releases.
     */
    it('never draws an older rung brighter than a newer one', () => {
        const current = 1;
        const aging = hostOpacity('aging');
        const stale = hostOpacity('stale');

        expect(aging).toBeLessThan(current);
        expect(stale).toBeLessThan(aging);
    });

    /*
     * A stale card is still reporting the last reading anyone got, which is
     * information you want even when it is old. The fade has to say "do not
     * trust this as current" without saying "you may stop being able to see
     * it". 0.5 shipped for five releases and sat at 3.2:1, right on the
     * large-text floor.
     */
    it('keeps a stale reading readable', () => {
        expect(contrastOnWhite(hostOpacity('stale'))).toBeGreaterThanOrEqual(
            4.5,
        );
    });

    it('keeps every rung above it readable too', () => {
        expect(contrastOnWhite(hostOpacity('aging'))).toBeGreaterThanOrEqual(
            4.5,
        );
    });

    /*
     * Opacity multiplies through the tree, so any element carrying its own
     * fades twice on a stale card. The forecast line used to carry 0.7, which
     * put it at 2.1:1 there -- below every threshold at any size. Hierarchy on
     * that line is font size now, and this pins it: re-adding an opacity here
     * would silently reintroduce the compounding.
     */
    it('leaves the forecast line without an opacity to compound', () => {
        /*
         * EVERY rule whose selector list mentions .prediction, not the first
         * one that matches. The first version of this test looked for
         * `.prediction {` and found the grouped `.time, .value, .delta,
         * .prediction {` rule instead, which has never carried an opacity -- so
         * it passed whatever the real rule said, including with the 0.7 put
         * back. An opacity on the grouped rule would compound just as badly, so
         * checking all of them is also the stronger assertion.
         */
        const blocks = [...cardStyles.matchAll(/([^{}]*)\{([^}]*)\}/g)].filter(
            ([, selector]) => /(^|,)\s*\.prediction\s*$/m.test(selector),
        );

        expect(blocks.length).toBeGreaterThan(0);
        for (const [, , body] of blocks) {
            expect(body).not.toMatch(/opacity/);
        }
    });

    /*
     * Colour is spent on this card: orange means "out of range" and red means
     * "urgent". The fade must not reach for either, or a stale high reading
     * would paint two unrelated meanings the same colour.
     */
    it('fades with contrast rather than colour', () => {
        const stale = cardStyles.match(/:host\(\.stale\)\s*\{([^}]*)\}/)[1];

        expect(stale).not.toMatch(/color|background/);
        expect(stale).toMatch(/grayscale/);
    });
});
