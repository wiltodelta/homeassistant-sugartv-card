import { css } from 'lit';

/*
 * Sizing model
 * ------------
 * Everything scales from a single unit, --u, so the card fills whatever box
 * the dashboard gives it. --u is 1% of the width, capped so the vertical
 * stack can never outgrow the height:
 *
 *     padding 5u + value 20u + padding 5u   = 30u
 *     prediction (margin 2u + text 2.7u)    =  4.7u
 *                                           = 34.7u total
 *
 * That total lives in --stack, and the height cap is 100cqh / --stack. Without
 * it, a card stretched across many columns but only one row tall sized its
 * number from the width alone and spilled out of the card (issue #92). Any
 * change to the sizes above has to move --stack with it.
 *
 * cqh needs a size container, and a size container with an indefinite height
 * collapses to zero. Masonry views hand the card an auto height, so the
 * aspect-ratio below supplies one from the width. It reuses --stack, which
 * makes the cap a no-op there and keeps auto-height cards looking as they
 * always have. A definite height (sections view) wins over aspect-ratio, so
 * those cards get the cap.
 */
export const cardStyles = css`
    :host {
        --stack: 34.7;
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
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 1;
        padding: calc(5 * var(--u));
        box-sizing: border-box;
        width: 100%;
        height: 100%;
    }

    .main-row {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .time {
        font-size: calc(6 * var(--u));
    }

    :host(.stale) {
        opacity: 0.5;
        filter: grayscale(0.8);
    }

    .value {
        font-size: calc(20 * var(--u));
        margin: 0 calc(2.5 * var(--u));
    }

    .trend {
        font-size: calc(10 * var(--u));
        margin: 0 calc(2.5 * var(--u)) 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .trend ha-icon {
        --mdc-icon-size: calc(10 * var(--u));
        width: calc(10 * var(--u));
        height: calc(10 * var(--u));
    }

    .delta {
        font-size: calc(6 * var(--u));
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .delta ha-icon {
        --mdc-icon-size: calc(6 * var(--u));
        width: calc(6 * var(--u));
        height: calc(6 * var(--u));
    }

    .prediction {
        font-size: calc(2.7 * var(--u));
        margin-top: calc(2 * var(--u));
        opacity: 0.7;
        text-align: center;
    }

    .container {
        transition:
            background-color 0.4s ease,
            color 0.4s ease;
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

    :host(.zone-urgent-low) .prediction,
    :host(.zone-urgent-high) .prediction {
        opacity: 0.85;
    }
`;
