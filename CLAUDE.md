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

## Rules and conventions

Topic-specific rules live in `.claude/rules/*.md` and are auto-loaded when matching files are touched. Read the matching file before editing that domain -- each holds the full architecture notes, thresholds, gotchas, and incident history for its subsystem:

| File                            | Covers                                                                                                                                                                                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/rules/ha-entities.md`  | Entity-id resolution (names not keys, tail-matching), `setConfig`-before-`hass` ordering, `last_updated` vs `last_reported` freshness, the age ladder (median cadence, one-way fade, staleness), sections-view grid sizing, where insulin entities live across integrations |
| `.claude/rules/localization.md` | `hass.locale` vs `hass.language`, Intl silent-fallback behaviour, the 64-language HA snapshot, untranslated text that hides outside the translation file, editing the 64 blocks by script, the three localized surfaces                                                     |
| `.claude/rules/typography.md`   | Glyph-ink metrics, `Range` rect vs `measureText`, fullwidth sign glyphs, scale-invariant width-per-unit budget, colour budget                                                                                                                                               |

Additional docs: [`docs/readme-screenshots.md`](docs/readme-screenshots.md) (screenshot recipe), [`docs/release.md`](docs/release.md) (release steps).
