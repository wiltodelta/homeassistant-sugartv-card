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

/*
 * Depth-aware CSS rule walker. Returns [fullMatch, selector, body, atRule] so
 * top-level rules stay distinguishable from @media / @container overrides.
 */
const parseRules = (sheet, atRule = null) => {
    const out = [];
    let i = 0;
    const clean =
        atRule === null ? sheet.replace(/\/\*[\s\S]*?\*\//g, '') : sheet;
    while (i < clean.length) {
        const open = clean.indexOf('{', i);
        if (open === -1) break;
        const header = clean.slice(i, open).trim();
        let depth = 1;
        let close = open + 1;
        while (close < clean.length && depth > 0) {
            if (clean[close] === '{') depth++;
            else if (clean[close] === '}') depth--;
            close++;
        }
        const inner = clean.slice(open + 1, close - 1);
        if (header.startsWith('@')) {
            out.push(...parseRules(inner, header));
        } else {
            out.push([`${header}{${inner}}`, header, inner, atRule]);
        }
        i = close;
    }
    return out;
};

const parsedRules = parseRules(cardStyles);

const rulesMatching = (selectorPattern, { topLevelOnly = false } = {}) =>
    parsedRules.filter(
        ([, selector, , atRule]) =>
            (!topLevelOnly || atRule === null) &&
            selectorPattern.test(selector),
    );

// The body of top-level `:host(.<selector>)`, or null when the sheet declares no such rung.
const hostRule = (selector) => {
    const found = rulesMatching(
        new RegExp(`(^|,)\\s*:host\\(\\.${selector}\\)\\s*(,|$)`, 'm'),
        { topLevelOnly: true },
    );
    return found.length ? found[0][2] : null;
};

// Its opacity, or null when the rung declares none -- which is how "full
// strength" is spelled.
const hostOpacity = (selector) => {
    const body = hostRule(selector);
    const found = body && body.match(/opacity:\s*([\d.]+)/);
    return found ? Number(found[1]) : null;
};

const parseHex = (hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
];

const linear = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const lum = ([r, g, b]) =>
    0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

const ratio = (c1, c2) => {
    const [l1, l2] = [lum(c1), lum(c2)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

const blend = (fg, bg, alpha) =>
    fg.map((c, idx) => Math.round(alpha * c + (1 - alpha) * bg[idx]));

// CSS Filter Effects 1: grayscale(amount) interpolates toward Rec.709 luma.
const grayscale = ([r, g, b], amt) => {
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return [r, g, b].map((c) => y * amt + c * (1 - amt));
};

/*
 * Composite text over the card and score it the way WCAG does. The card's
 * default text is HA's #212121 on a white card; the numbers below are the
 * reason the rungs sit where they do rather than on round-looking values.
 */
const contrastOnWhite = (alpha) =>
    ratio(blend([33, 33, 33], [255, 255, 255], alpha), [255, 255, 255]);

describe('the age fade in the stylesheet', () => {
    /*
     * Paired with a rung that DOES exist, because "no rule" is what this
     * extractor returns for any name at all. Asserting the absence alone passed
     * identically for :host(.banana) and for a stylesheet that had been
     * deleted, so it proved the regex ran rather than that the rung is unstyled.
     */
    it('gives a current reading no rule of its own', () => {
        expect(hostRule('current')).toBeNull();
        expect(hostRule('stale')).not.toBeNull();
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
     * would silently reintroduce the compounding. The insulin line sits above
     * the reading and the forecast below it, but both are secondary lines that
     * would compound just the same, so both are held to the identical rule.
     */
    it('leaves the secondary lines without an opacity to compound', () => {
        /*
         * EVERY rule whose selector list mentions one of them, not the first
         * one that matches. The first version of this test looked for
         * `.prediction {` and found the grouped `.time, .value, .delta,
         * .prediction {` rule instead, which has never carried an opacity -- so
         * it passed whatever the real rule said, including with the 0.7 put
         * back. An opacity on the grouped rule would compound just as badly, so
         * checking all of them is also the stronger assertion.
         */
        const blocks = rulesMatching(
            /(^|,)\s*\.(prediction|insulin|footnotes)\s*$/m,
        );

        expect(blocks.length).toBeGreaterThan(0);
        for (const [, , body] of blocks) {
            expect(body).not.toMatch(/opacity/);
        }
    });

    /*
     * The fade must not be animated without something to animate from.
     * Transitioning the host left freshly rendered cards stuck at the
     * transition's start value: 13 of 14 cards in the demo carried .stale while
     * computing to grayscale(0) and opacity 1, and never settled. That is a
     * stale card drawn at full strength -- a dead sensor that looks live.
     *
     * The mechanism was not pinned down beyond "it happens on newly created
     * elements and not on a card that ages in place", so this guards the shape
     * rather than a theory: any :host rung that animates must also declare the
     * properties it animates, giving the browser a concrete start value.
     */
    it('never animates the fade without a baseline to animate from', () => {
        const hostRules = rulesMatching(/(^|,)\s*:host(\([^)]*\))?\s*$/m);

        // Vacuous otherwise: an empty list satisfies every check below.
        expect(hostRules.length).toBeGreaterThan(0);

        const animates = hostRules.some(
            ([, , body]) =>
                /transition/.test(body) && /(opacity|filter)/.test(body),
        );

        if (animates) {
            /*
             * The start value has to live on the UNCLASSED :host. A rung that
             * declares filter and opacity alongside its own transition is
             * declaring where to animate TO, which is what the first version of
             * this guard accepted -- so a transition on :host(.stale), the more
             * natural place to put one, passed it untouched.
             */
            const base = rulesMatching(/(^|,)\s*:host\s*$/m)
                .map(([, , body]) => body)
                .join('\n');

            expect(base).toMatch(/filter:/);
            expect(base).toMatch(/opacity:/);
        }
    });

    /*
     * Colour is spent on this card: orange means "out of range" and red means
     * "urgent". The fade must not reach for either, or a stale high reading
     * would paint two unrelated meanings the same colour.
     */
    it('fades with contrast rather than colour', () => {
        const stale = hostRule('stale');

        expect(stale).not.toMatch(/color|background/);
        expect(stale).toMatch(/grayscale/);
    });

    it('keeps warning and urgent zones above 4.5:1 across light, dark and stale', () => {
        const warnBody = hostRule('zone-low');
        const warnMatch =
            warnBody &&
            warnBody.match(
                /light-dark\(\s*(#[0-9a-fA-F]{6})\s*,\s*(#[0-9a-fA-F]{6})\s*\)/,
            );
        expect(warnMatch).not.toBeNull();
        const [warnLight, warnDark] = [
            parseHex(warnMatch[1]),
            parseHex(warnMatch[2]),
        ];

        const urgentBody = hostRule('zone-urgent-low');
        const urgBgMatch =
            urgentBody &&
            urgentBody.match(/--sugartv-urgent-bg,\s*(#[0-9a-fA-F]{6})\s*\)/);
        expect(urgBgMatch).not.toBeNull();
        const urgBg = parseHex(urgBgMatch[1]);

        const staleGrayMatch =
            hostRule('stale') &&
            hostRule('stale').match(/grayscale\(\s*([\d.]+)\s*\)/);
        expect(staleGrayMatch).not.toBeNull();
        const staleGray = Number(staleGrayMatch[1]);

        const white = [255, 255, 255];
        const darkCard = [28, 28, 28];
        const agingAlpha = hostOpacity('aging');
        const staleAlpha = hostOpacity('stale');

        // Warning text on light and dark across current, aging and stale.
        for (const [fg, bg] of [
            [warnLight, white],
            [warnDark, darkCard],
        ]) {
            expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
            expect(ratio(blend(fg, bg, agingAlpha), bg)).toBeGreaterThanOrEqual(
                4.5,
            );
            expect(
                ratio(blend(grayscale(fg, staleGray), bg, staleAlpha), bg),
            ).toBeGreaterThanOrEqual(4.5);
        }

        // Urgent zone (white text on red host) across current, aging and stale.
        expect(ratio(white, urgBg)).toBeGreaterThanOrEqual(4.5);
        expect(
            ratio(white, blend(urgBg, white, agingAlpha)),
        ).toBeGreaterThanOrEqual(4.5);
        expect(
            ratio(white, blend(grayscale(urgBg, staleGray), white, staleAlpha)),
        ).toBeGreaterThanOrEqual(4.5);
    });

    it('never clips .trend or .delta and centers ha-icon as a flex box', () => {
        const tailBlocks = rulesMatching(/(^|,)\s*\.(trend|delta)\b/m);
        expect(tailBlocks.length).toBeGreaterThan(0);
        for (const [, , body] of tailBlocks) {
            expect(body).not.toMatch(/overflow\s*:\s*(clip|hidden)/);
        }

        const iconBody = rulesMatching(/(^|,)\s*ha-icon\s*(,|$)/m)
            .map(([, , body]) => body)
            .join('\n');
        expect(iconBody).toMatch(/display\s*:\s*(inline-)?flex/);
    });
});
