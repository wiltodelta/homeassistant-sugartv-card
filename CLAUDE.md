# SugarTV Card

You are a **principal frontend engineer** maintaining a custom Home Assistant Lovelace card. LitElement, Rollup, Prettier.

## How to run

- `npm run build` — build the card
- `npm test` — vitest suite (`test/*.test.js`)
- `npm run demo` — local demo on http://localhost:3000
- No `maintain.sh`. The gate is `npm test && npm run build && npx prettier --check .`
- README images are generated, not hand-cropped — regenerate them with the headless-Chrome recipe in [`docs/readme-screenshots.md`](docs/readme-screenshots.md), never crop by hand.

## Home Assistant facts worth not re-deriving

- **Entity ids have no predictable head — match the tail via `siblingEntityId()`; `setConfig` runs before `hass`, so nothing about the entity is knowable at config time.** `last_updated` is not "when the sensor was last polled", and `last_reported` is the wrong fix. Full HA integration facts (entity-name-vs-key resolution, Dexcom/Carelink id shapes, freshness, sections-view grid sizing): [`.claude/rules/ha-entities.md`](.claude/rules/ha-entities.md).
- **`hass.locale` is not `hass.language` — read both, and resolve the locale in ONE place.** Intl never fails; it silently answers in English, so compare `resolvedOptions().locale` to what you asked for. HA ships 64 languages (`test/ha-languages.json` is the snapshot), and two of the card's three localized surfaces never see a `hass`. Full localization rules: [`.claude/rules/localization.md`](.claude/rules/localization.md).
- **A glyph's box is not its ink, and the eye measures ink** — measure with `measureText().actualBoundingBox*` / `getBoundingClientRect()` on the SVG `path`, never a `Range` rect (it reports the line box). Width-per-unit is scale-invariant, so one measurement sizes the type. Colour is already spent (orange = out of range, red = urgent); new signals get opacity. Full type + layout metrics: [`.claude/rules/typography.md`](.claude/rules/typography.md).

## Release process

- **Never force-push tags.** HACS caches releases by tag name — re-tagging means users won't get the update.
- **Always increment version** for every push that should reach users, even hotfixes.

The step-by-step release commands and the GitHub Actions / HACS pickup notes live in [`docs/release.md`](docs/release.md).

## Rules and conventions

Topic-specific rules live in `.claude/rules/*.md` and are auto-loaded when matching files are touched. Read the matching file before editing that domain -- each holds the full architecture notes, thresholds, gotchas, and incident history for its subsystem:

| File                            | Covers                                                                                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.claude/rules/ha-entities.md`  | Entity-id resolution (names not keys, tail-matching), `setConfig`-before-`hass` ordering, `last_updated` vs `last_reported` freshness, the age ladder (median cadence, quiet tier, staleness), sections-view grid sizing |
| `.claude/rules/localization.md` | `hass.locale` vs `hass.language`, Intl silent-fallback behaviour, the 64-language HA snapshot, the three localized surfaces                                                                                              |
| `.claude/rules/typography.md`   | Glyph-ink metrics, `Range` rect vs `measureText`, fullwidth sign glyphs, scale-invariant width-per-unit budget, colour budget                                                                                            |

Additional docs: [`docs/readme-screenshots.md`](docs/readme-screenshots.md) (screenshot recipe), [`docs/release.md`](docs/release.md) (release steps).
