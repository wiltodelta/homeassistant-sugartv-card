---
paths:
    - 'src/**/*.js'
    - 'test/**/*.js'
    - 'test/ha-languages.json'
description: Localization rules — hass.locale vs hass.language, Intl silent-fallback behaviour, the HA language snapshot, untranslated text outside the translation file, editing every language block by script, and the three localized surfaces.
---

# Localization rules

## Locale resolution

- **Read `hass.locale` as well as `hass.language`:** its `time_format` and `number_format` outrank any language tag, including the card's own `locale`. Mirror the frontend's `useAmPm` and `numberFormatToLocale`, and resolve the locale in ONE place.

## Intl behaviour

- **Intl never fails; it answers in English.** Compare each formatter's `resolvedOptions().locale` base tag with the requested one at runtime and degrade deliberately (this card shows the clock).
- **Render an age with `Intl.NumberFormat` (`style: 'unit'`, `unitDisplay: 'short'`), never `Intl.RelativeTimeFormat`,** whose narrow style is signed and wider styles run long. Take `now` from `RelativeTimeFormat(numeric: 'auto').format(0, 'second')`.

## The HA language snapshot

- **`test/ha-languages.json` is the snapshot of HA's languages (from the frontend's `translationMetadata.json`), and a test compares the card's tables against it.** Match the exact tag (`zh-Hans`, `sr-Latn`, `pt-BR`, `es-419`) BEFORE the part before the hyphen.

## Untranslated text hides outside the translation file

- **Before calling a localisation pass complete, grep for user-visible strings OUTSIDE `src/localize.js`:** aria-labels, anything built from an internal key, and any unit read off the sensor rather than through `units.*`. Take trend labels from `hass.localize` at `component.dexcom.entity.sensor.glucose_trend.state.*`, with the humanised key as the fallback.

## Editing every language block by script

- **`localize.js` is prettier-formatted, so never edit it line by line.** Match the whole property (key, optional newline, either quote style, trailing comma) inside its language block, assert the replacement count equals the number of language blocks before writing, then run `node --check src/localize.js`.
- **A narrowed feature narrows its label.** Deviation from the global rules: when a feature's scope changes, the docs-sync grep (pre-commit step 3) also covers every language block in `src/localize.js`, because they sit outside README, `docs/` and docstrings.

## The three localized surfaces

- **`getConfigForm()` is static and `window.customCards` is filled at module load, so neither sees a `hass`.** Their language comes from `frontendLanguage()`, the one place that reads `document.querySelector('home-assistant')?.hass`.
