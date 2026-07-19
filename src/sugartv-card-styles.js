import { css } from 'lit';

/*
 * Layout
 * ------
 * One markup, two orientations. The container holds the time, the value, a
 * .tail carrying the trend and delta, and the prediction. Wide boxes lay them
 * out as a row with the prediction wrapped onto its own line; tall and square
 * boxes stack them into a column. Nothing here is configurable: the card reads
 * the shape it was given and picks the orientation that fills it.
 *
 * Optical geometry
 * ----------------
 * Everything below exists because a glyph's box is not its ink, and the eye
 * measures ink. Three separate offsets bite, and all three are neutralised
 * here so that one gap value produces an even rhythm in both orientations:
 *
 *   text-box       a font reserves room above the cap line and below the
 *                  baseline. Under a big number that descent alone is wider
 *                  than the gap, so the space under the value read as roughly
 *                  double the space above it.
 *   tabular-nums   proportional digits have uneven side bearings, so the ink
 *                  of a reading does not sit where its box does: "145" leans
 *                  1.8px right of centre, "111" leans 4.9px left. That reads
 *                  as the time being off-centre against the value, and it also
 *                  shifted the number sideways on every new reading.
 *   --icon-trim    an MDI glyph inks about two thirds of its 24x24 box, so the
 *                  box padding lands on top of the gap and the trend sat
 *                  further from the value than the time sat above it.
 *
 * Spacing is only ever the container's gap. No element carries a margin, so
 * the rhythm is one number to reason about rather than a pile of margins that
 * quietly fight each other and the optical offsets above.
 *
 * Sizing model
 * ------------
 * Everything scales from a single unit, --u, so the card fills whatever box the
 * dashboard gives it. In the row --u is 1% of the width, capped so the stack can
 * never outgrow the height; --stack is that height budget. Without the cap a
 * card stretched across many columns but only one row tall sized its number from
 * the width alone and spilled out (issue #92).
 *
 * --stack stays at 34.7 rather than tracking the trimmed content, which now
 * comes to roughly 29u. It is also the masonry aspect-ratio, so lowering it
 * would shorten every auto-height card already on a dashboard; the slack simply
 * reads as breathing room and leaves the overflow guard with headroom.
 *
 * cqh needs a size container, and a size container with an indefinite height
 * collapses to zero. Masonry hands the card an auto height, so the aspect-ratio
 * supplies one from the width. A definite height (sections view) wins over
 * aspect-ratio, so those cards get the cap.
 *
 * The column gets its own budget (--tall-w, --tall-h) because its content is a
 * different shape. 5/3 is the crossover between the two: exactly where the
 * column starts yielding a larger --u than the row.
 */
export const cardStyles = css`
    :host {
        --stack: 34.7;
        /* Fraction of an icon box that is padding rather than ink, per side. */
        --icon-trim: 0.17;
        display: flex;
        height: 100%;
        width: 100%;
        container-type: size;
        aspect-ratio: 100 / var(--stack);
    }

    .wrapper {
        --u: min(1cqi, calc(100cqh / var(--stack)));
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .container {
        /* The rhythm. One value drives every gap the eye reads as spacing. */
        --gap: calc(2.5 * var(--u));
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--gap);
        line-height: 1;
        padding: calc(5 * var(--u));
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        transition:
            background-color 0.4s ease,
            color 0.4s ease;
    }

    /*
     * The reading itself. nowrap is load-bearing: let this line wrap and a wide
     * value (mmol readings are the widest) drops its trend onto a second line
     * and the card falls apart. It stays one line and --u sizes it to fit.
     */
    .line {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: center;
        gap: var(--gap);
    }

    /* Box == ink, so the gap above a line equals the gap below it. */
    .time,
    .value,
    .delta,
    .prediction {
        text-box: trim-both cap alphabetic;
    }

    /* Even digit advances: no drift off centre, no jitter on a new reading. */
    .time,
    .value,
    .delta {
        font-variant-numeric: tabular-nums;
    }

    /* Flattened in the row so the trend and delta sit inline with the value. */
    .tail {
        display: contents;
    }

    /*
     * --time-scale is measured, and is 1 unless the phrasing is too wide to sit
     * beside the reading. Wordier languages ("14 perccel ezelőtt") would
     * otherwise overrun the card, and the line cannot wrap.
     */
    .time {
        font-size: calc(6 * var(--u) * var(--time-scale, 1));
    }

    /*
     * A sign must never part from its number, and a reading must never break
     * mid-figure. Both used to rely on there being room; in a narrow slot the
     * delta wrapped and left its plus stranded on a line of its own.
     */
    .time,
    .value,
    .delta {
        white-space: nowrap;
    }

    .value {
        font-size: calc(20 * var(--u));
    }

    .trend,
    .delta {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .trend {
        font-size: calc(10 * var(--u));
    }

    .delta {
        font-size: calc(6 * var(--u));
    }

    /*
     * Pull each icon box in to its ink, the same way text-box does for text,
     * on both axes: the padding inflates the gap beside the glyph just as much
     * as the gap above it.
     */
    .trend ha-icon {
        --mdc-icon-size: calc(10 * var(--u));
        width: calc(10 * var(--u));
        height: calc(10 * var(--u));
        margin: calc(-10 * var(--icon-trim) * var(--u));
    }

    /*
     * How much of its box a glyph inks is per-icon, so the two shapes that are
     * not plain arrows get their own measured value. Without this the double
     * chevrons sit ~2px low and the help circle ~4px high against the rhythm.
     */
    .trend[data-icon$='-double-up'],
    .trend[data-icon$='-double-down'] {
        --icon-trim: 0.22;
    }

    .trend[data-icon$='help-circle-outline'] {
        --icon-trim: 0.083;
    }

    .delta ha-icon {
        --mdc-icon-size: calc(6 * var(--u));
        width: calc(6 * var(--u));
        height: calc(6 * var(--u));
        margin: calc(-6 * var(--icon-trim) * var(--u));
    }

    /*
     * Clear the reading's descender. .value is trimmed to the alphabetic
     * baseline so its box ends where the digits do, but a decimal comma hangs
     * below that and would otherwise print on this line. --value-descent is
     * measured from the rendered glyphs, and is zero whenever the reading has
     * no descender, which is every mg/dL card.
     */
    /*
     * No opacity of its own, deliberately. It used to carry 0.7 to read as
     * secondary, but font size already says that -- 2.7u against the reading's
     * 20u -- and the opacity cost more than it bought. It multiplied with the
     * age fade below, so a stale forecast landed at 0.35 and 2.1:1 against the
     * card, which is not readable at any size; and on the orange out-of-range
     * zones it fell to 2.6:1 even on a current reading. Hierarchy by size,
     * contrast left alone.
     */
    .prediction {
        font-size: calc(2.7 * var(--u));
        margin-top: calc(var(--value-descent, 0) * var(--u));
        max-width: 100%;
        text-align: center;
    }

    /*
     * The age fade, and it runs one way only: toward staleness. A current
     * reading is drawn at full strength, a reading that has missed a poll loses
     * a little contrast, and a stale one loses the most. Older is never
     * brighter, so the card can be read at a glance from across a room without
     * reading the time at all.
     *
     * An earlier cut ran backwards, fading the time WHILE the reading was
     * current, which put the card's only "something is off" signal on the state
     * where nothing is off.
     *
     * Opacity, not colour. Orange already means "out of range" here
     * (--sugartv-warning-text on the low and high zones), so a second axis
     * reaching for orange would paint two unrelated meanings the same colour,
     * and on the urgent zones it would land on red.
     */
    /*
     * No transition here, and that is a fix rather than an omission. Animating
     * the host's filter left freshly rendered cards stuck at the transition's
     * START value: 13 of 14 cards in the demo carried the .stale class while
     * computing to grayscale(0) and opacity 1, and never settled. A stale card
     * rendering at full strength is a dead sensor that looks live, which is the
     * one failure mode this card does not accept, so the fade snaps instead.
     *
     * Three explanations were tested against the real page and all three are
     * WRONG, so do not reintroduce this on the strength of a fourth:
     *
     *   Setting the host class from inside render(), a Lit anti-pattern, was
     *   the leading theory. Moving it to willUpdate fixed the anti-pattern and
     *   changed nothing here -- still 13 of 14 stuck.
     *
     *   Interpolating from an absent value was the second. Giving :host an
     *   explicit opacity and filter to start from changed nothing either.
     *
     *   Off-screen elements never painting was the third. A real 1280x900
     *   viewport, and scrolling every card through it, changed nothing.
     *
     * What DID separate the cases: a card created on its own animates
     * correctly, and cards created as a synchronous burst do not -- one of
     * fourteen settles and the rest hold the start value forever. A dashboard
     * builds its cards in exactly such a burst on load, so the failure is
     * reachable in production even though it looks like a demo artifact.
     *
     * A stale card at full strength is a dead sensor that looks live. Until
     * something explains the burst case, the fade snaps.
     */
    :host(.aging) {
        opacity: 0.85;
    }

    /*
     * A stale card must still be READABLE. It is reporting the last reading
     * anyone got, which is information you want even when it is old; the fade
     * says "do not trust this as current", not "you may stop being able to see
     * it". 0.5 shipped from v0.9.3 and put the reading at 3.2:1 against the
     * card, right on the large-text floor, with the forecast line below any
     * threshold at all. 0.7 holds the reading at 5.9:1 and is still an obvious
     * step down from the rung above.
     *
     * The greyscale does the rest, and does it where opacity cannot: on the
     * coloured zones it is the whole signal, and it happens to RAISE contrast
     * rather than lower it, since orange desaturates toward a darker luma
     * (3.8:1 to 5.3:1). On a normal white card it changes nothing visible,
     * which is why the opacity has to carry that case on its own.
     */
    :host(.stale) {
        opacity: 0.7;
        filter: grayscale(0.8);
    }

    :host(.zone-urgent-low),
    :host(.zone-urgent-high) {
        background-color: var(--sugartv-urgent-bg, #c62828);
        color: var(--sugartv-urgent-text, #ffffff);
        border-radius: var(--ha-card-border-radius, 12px);
    }

    :host(.zone-low),
    :host(.zone-high) {
        color: var(--sugartv-warning-text, #e65100);
    }

    /*
     * Tall and square boxes. One tight stack, centered as a block, sized against
     * the column's own budget. The trend and delta share a line so the block
     * under the value does not tower over the time above it. Last so it wins.
     */
    @container (max-aspect-ratio: 5 / 3) {
        .wrapper {
            /*
             * A fallback only. _measureValueWidth replaces this with the width
             * the current reading actually needs, so the number fills the card
             * instead of leaving room for the widest reading imaginable. This
             * value has to cover that widest case ("13.9") for the frame or two
             * before the first measurement lands.
             */
            --tall-w: 52;
            --tall-h: 50;
            --u: min(
                calc(100cqi / var(--tall-w)),
                calc(100cqh / var(--tall-h))
            );
        }

        /*
         * A stacked reading needs more air between its lines than a single row
         * needs between words, so the rhythm opens up. --tall-h carries the
         * extra height. The trend and delta keep the tighter row gap: they read
         * as one unit, not as two more lines of the stack.
         */
        .container {
            --gap: calc(3.5 * var(--u));
        }

        .line {
            flex-direction: column;
        }

        .tail {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: calc(2.5 * var(--u));
        }
    }
`;
