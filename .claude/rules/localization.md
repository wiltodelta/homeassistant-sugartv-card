---
globs: src/localize.js, src/**/*.js, test/**/*.js, test/ha-languages.json
description: Localization rules — hass.locale vs hass.language, Intl silent-fallback behaviour, the 64-language HA snapshot, and the three surfaces a card is localized on.
---

# Localization rules

Relocated verbatim from the repo root `CLAUDE.md`. Read before editing this domain.

## Locale resolution

- **`hass.locale` is not `hass.language`, and the card must read both.** Each
  user's profile carries a `FrontendLocaleData`: `language`, plus `time_format`
  (`language` / `system` / `12` / `24`) and `number_format` (`comma_decimal`,
  `decimal_comma`, `space_comma`, `quote_decimal`, `system`, `none`). Those are
  explicit choices about clocks and digits and they outrank any language tag,
  including the card's own `locale`. Reading only the language meant a UK user
  on `en` who had set 24 hours still saw `03:12 PM`, because `en` alone is
  American English to Intl. Mirror the frontend's own `useAmPm` (it sniffs by
  formatting a 22:00 date and looking for "10") and `numberFormatToLocale` (a
  format names a style, so it maps to a language that writes numbers that way) —
  a card that disagrees with the clock in the HA header is worse than one that
  is merely wrong. Resolve the locale in ONE place: it used to be derived in
  four spots under three rules, and two of them stopped at `config.locale` and
  fell through to the browser, drawing `15:10` beside `8.1` on one card.

## Intl behaviour

- **Intl never fails; it answers in English.** Asked for a language its ICU build
  lacks, every `Intl.*` constructor silently falls back, so a card translated
  into 64 languages shows one English phrase inside an otherwise Georgian
  layout. `resolvedOptions().locale` is what gives the miss away — compare its
  base tag to the requested one and degrade deliberately (this card shows the
  clock). This is a property of the running engine, not of the language: Node
  and Chrome disagree today, so ask at runtime and never carry a list. Ask each
  formatter you actually use, since their data sets are separate.
- **`Intl.RelativeTimeFormat` is the obvious tool for an age and the wrong one.**
  Its `narrow` style renders as a signed number in several languages (`-3 мин`),
  and a minus beside a glucose reading reads as a negative value; which locales
  sign which style differs between engines, and Bosnian signs all three, so no
  fallback chain fixes it. Its wider styles run long: measured across every
  language, the full phrasing reaches 2.9x the width of the clock it replaces,
  and `for 14 min siden` left five pixels of slack before crowding the reading.
  `Intl.NumberFormat` with `style: 'unit'`, `unitDisplay: 'short'` gives each
  language's own abbreviation (`14 min`, `14 мин`, `14 Min.`), is never signed,
  and holds every language inside 1.4x. Pastness comes from the slot, plus the
  `now` that `RelativeTimeFormat(numeric: 'auto').format(0, 'second')` yields
  free in every language.

## The 64-language snapshot

- **HA ships 64 languages; `test/ha-languages.json` is the snapshot.** Taken from
  the frontend's own `translationMetadata.json`, and a test compares the card's
  tables against it so a new HA language turns the suite red instead of silently
  falling back. Several tags only exist qualified (`zh-Hans`, `sr-Latn`,
  `pt-BR`, `es-419`), so match the exact tag BEFORE the part before the hyphen:
  `zh-Hans`.split('-')[0] is `zh`, which no table has, and Simplified Chinese
  would read English with a good translation sitting right there.

## Untranslated text hides outside the translation file

- **Text a translation review never sees is where the untranslated English
  hides.** Reviewing `src/localize.js` covers what is in it, and the card's
  screen-reader label was not: it printed the internal trend key with the
  underscores stripped, so `rising_quickly` read as English by accident rather
  than by translation, in every language. Grep for user-visible strings OUTSIDE
  the translation file before calling a localisation pass complete: aria-labels,
  anything built from an internal key, and any unit read straight off the sensor
  rather than through `units.*`. For the trend specifically, Home Assistant
  already ships those seven states translated at
  `component.dexcom.entity.sensor.glucose_trend.state.*`; ask `hass.localize`
  for them rather than adding 7 x 64 strings of your own, and keep the
  humanised key as the fallback for installs without that integration loaded.

## Editing the 64 blocks by script

- **`localize.js` is prettier-formatted, so a line-oriented edit script will
  corrupt it -- twice, in two different ways.** Rewriting one key across all 64
  languages looks like a one-line `re.sub` per line and is not. Prettier wraps a
  long value onto its own continuation line (`dim_by_age:\n    'Attenuare la
scheda...'`), so replacing just the line that starts with the key leaves the
  old string dangling and every suite fails to import. It also switches a value
  containing an apostrophe to double quotes (Welsh and Luxembourgish are the two
  that do), so a pattern matching only single-quoted strings silently skips
  them. Match the whole property -- key, optional newline, either quote style,
  trailing comma -- inside the language block it belongs to, and assert the
  replacement count is exactly 64 before writing. `node --check src/localize.js`
  is the cheap confirmation; the test suite reports the same breakage as five
  unrelated red files, which reads as something far worse than a quoting bug.
- **A label is a promise about behaviour, and a narrowed feature has to narrow
  its label.** `dim_by_age` shipped saying "Fade the card as the reading gets
  older" while gating only the middle rung of the ladder, so turning it off and
  watching a stale card still fade read as a broken control -- which is exactly
  how it was reported. The README had already been corrected; the 64 editor
  strings had not, and the editor is the surface a user actually reads. When a
  feature's scope changes, grep the translation table in the same pass as the
  docs.

## The three localized surfaces

- **A card is localised on three surfaces, and two of them never see a `hass`.**
  `getConfigForm()` is static and `window.customCards` is filled at module load,
  so both localizers used to resolve to English and 14 of 22 strings were
  unreadable in all 64 languages (#101). Verified against the frontend source,
  not assumed: `hui-element-editor` assigns `configElement.hass` to whatever
  `getConfigElement()` returns; `hui-form-editor` calls
  `computeLabel(schema, hass.localize)`, whose second argument translates HA's
  own keys and carries no language; `hui-card-picker` reads `ccard.name`/`ccard.description` as
  properties while rendering, so getters are evaluated late enough; and
  `home-assistant` is a real element (`HomeAssistantAppEl`) holding `hass`, so
  `document.querySelector('home-assistant')?.hass` is a real source rather than
  folklore. `frontendLanguage()` is the one place that reads it. The trap is
  that a translation review of `localize.js` sees only correct translations;
  nothing in the file says where they end up.
