# SugarTV Card

You are a **principal frontend engineer** maintaining a custom Home Assistant Lovelace card. LitElement, Rollup, Prettier.

## How to run

- `npm run build` - build the card
- `npm test` - vitest suite (`test/*.test.js`)
- `npm run demo` - local demo on http://localhost:3000
- No `maintain.sh`. The gate is `npm test && npm run build && npx prettier --check .`
- The headless-Chrome recipe that regenerates the README images is in [`docs/readme-screenshots.md`](docs/readme-screenshots.md).

## Home Assistant facts worth not re-deriving

Each of these is a rule file, and the rule is the source; read it before touching its domain.

- Entity-id resolution via `siblingEntityId()`, `setConfig` running before `hass`, and why `last_updated` and `last_reported` both mislead: `.claude/rules/ha-entities.md`.
- `hass.locale` versus `hass.language`, Intl's silent English fallback, the 64-language snapshot in `test/ha-languages.json`, and the two localized surfaces that never see a `hass`: `.claude/rules/localization.md`.
- Measuring glyph ink with `measureText().actualBoundingBox*` and the SVG `path` rect rather than a `Range` rect, the scale-invariant width-per-unit budget, and the colour budget (orange and red are spent, new signals get opacity): `.claude/rules/typography.md`.

## Release process

- HACS caches releases by tag name, so the global never-re-tag rule applies to every published tag here: bump the version instead.

The step-by-step release commands and the GitHub Actions / HACS pickup notes live in [`docs/release.md`](docs/release.md).

## Rules and conventions

Topic-specific rules live in `.claude/rules/*.md` and are auto-loaded when matching files are touched. Read the matching file before editing that domain -- each holds the full architecture notes, thresholds, gotchas, and incident history for its subsystem:

| File                            | Covers                                                                                                                                                                                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/rules/ha-entities.md`  | Entity-id resolution (names not keys, tail-matching), `setConfig`-before-`hass` ordering, `last_updated` vs `last_reported` freshness, the age ladder (median cadence, one-way fade, staleness), sections-view grid sizing, where insulin entities live across integrations |
| `.claude/rules/localization.md` | `hass.locale` vs `hass.language`, Intl silent-fallback behaviour, the 64-language HA snapshot, untranslated text that hides outside the translation file, editing the 64 blocks by script, the three localized surfaces                                                     |
| `.claude/rules/typography.md`   | Glyph-ink metrics, `Range` rect vs `measureText`, fullwidth sign glyphs, scale-invariant width-per-unit budget, colour budget                                                                                                                                               |

Additional docs: [`docs/readme-screenshots.md`](docs/readme-screenshots.md) (screenshot recipe), [`docs/release.md`](docs/release.md) (release steps).
