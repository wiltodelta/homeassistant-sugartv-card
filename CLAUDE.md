# SugarTV Card

You are a **principal frontend engineer** maintaining a custom Home Assistant Lovelace card. LitElement, Rollup, Prettier. `src/sugartv-card.js` is the element, `src/trend.js` resolves sibling entities and trends, `src/localize.js` holds the per-language strings, `src/sugartv-card-styles.js` the CSS; `demo/` serves the card against a mocked `hass` (`demo/hass-mock.js`).

## How to run

- `npm run build` - build the card
- `npm test` - vitest suite (`test/*.test.js`)
- `npm run demo` - local demo on http://localhost:3000
- No `maintain.sh`. The gate is `npm test && npm run build && npx prettier --check .`
- The headless-Chrome recipe that regenerates the README images is in [`docs/readme-screenshots.md`](docs/readme-screenshots.md).

## Release process

The step-by-step release commands and the GitHub Actions / HACS pickup notes live in [`docs/release.md`](docs/release.md).

Victor's personal website (`wiltodelta/wiltodelta-app`, page `/projects/sugartv/`) imports `sugartv-card-layouts.png` and the README sections "Features" from each stable release at its tag. Before tagging a release whose UI changed, regenerate those screenshots. Do not rename or remove them, or those sections, without updating `releaseSource` in that repository's `src/data/project-catalog.json` in the same change. After publishing, run `pnpm run build:products` there, read the page, and update its copy (`project-catalog.json`) when user-visible behavior changed. Nothing does this automatically yet; the full procedure is `docs/product-updates.md` there, "What product repositories owe the site".
