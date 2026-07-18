# SugarTV Card

You are a **principal frontend engineer** maintaining a custom Home Assistant Lovelace card. LitElement, Rollup, Prettier.

## How to run

- `npm run build` — build the card
- `npm test` — vitest suite (`test/*.test.js`)
- `npm run demo` — local demo on http://localhost:3000
- No `maintain.sh`. The gate is `npm test && npm run build && npx prettier --check .`
- **README images are generated, not hand-cropped.** `demo/shot.html` takes one
  `WIDTHxHEIGHT:VALUE:TREND` spec a card and renders them on an HA-like
  background; headless Chrome shoots it at 2x:

    ```bash
    node demo/server.js &
    CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    shoot() { "$CHROME" --headless --disable-gpu --hide-scrollbars \
      --force-device-scale-factor=2 --virtual-time-budget=8000 \
      --window-size="$1" --screenshot="$2" \
      "http://localhost:3000/demo/shot.html?specs=$3"; }

    shoot 964,396  sugartv-card-layouts.png 560x200:145:rising,260x300:145:rising
    shoot 1152,216 sugartv-card-zones.png \
      320x120:52:falling_quickly,320x120:120:rising_slightly,320x120:210:rising
    ```

    Four things the pictures depend on. The window is the stage plus its 48px
    padding, so it tracks the specs. A column shape wants both axes binding at
    once (260x300) or the card floats in its own slack. The reading time has to
    be `now` or the card correctly greys itself out as stale, so the clock reads
    whenever it was shot. And the stage colours `.ha-card`, never `sugartv-card`:
    a rule in the outer document outranks the card's own `:host()` rules, so
    colouring the element directly shoots black text on the red urgent zone.

## Home Assistant facts worth not re-deriving

- **Lovelace calls `setConfig` before it assigns `hass`, so nothing about the
  entity is knowable there.** Anything derived from the entity's state or
  attributes at config time is a guess. Deriving the unit there and baking the
  matching thresholds into the config meant a mmol card carried mg/dL numbers
  for good, so 8.1 read as urgent low and a dangerous 14.0 read as urgent low
  too. Resolve unit-dependent defaults when the value is read, not when the
  config is normalized, and treat thresholds that exactly equal another unit's
  defaults as a stale guess rather than a choice. The test helper hid this for
  years by assigning `card.config` directly instead of going through
  `setConfig`; two tests even asserted the broken behaviour.
- **Entity ids come from an integration's entity NAMES, not its internal keys.**
  Carelink's `last_sg_mgdl` key is published as "Last glucose level mg/dl", so
  the entity is `sensor.*last_glucose_level_mg_dl`. Trend auto-detection was
  keyed on the key spelling and never matched. Read the integration's
  `SensorEntityDescription(name=...)`, never the `key=`.
- **Dexcom sets `has_entity_name = True` with the device name equal to your
  account username, so its entity is `sensor.<username>_glucose_value` (entity
  name "Glucose value"), with no `dexcom_` in the id.** The README examples and
  `getStubConfig()` both once shipped `sensor.dexcom_glucose_value`, an id that
  exists for nobody; both now use a `sensor.<username>_glucose_value`
  placeholder. Match the `*_glucose_value` tail, never a literal `dexcom_` head.
- **An entity id has no predictable head, so match its tail.** The same
  integration yields different ids depending on when it was installed: HA only
  consults `suggested_object_id` at first registration, so a rename upstream
  never moves an existing id, and HA 2026.4 changed composition for entities
  without `has_entity_name` (the device name is now prepended). Carelink alone
  has three live shapes, from `sensor.last_glucose_level_mg_dl` to
  `sensor.john_doe_carelink_john_doe_last_glucose_level_mg_dl`. Use
  `siblingEntityId()`, never a prefix assumption or a bare `endsWith`.
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
- **HA ships 64 languages; `test/ha-languages.json` is the snapshot.** Taken from
  the frontend's own `translationMetadata.json`, and a test compares the card's
  tables against it so a new HA language turns the suite red instead of silently
  falling back. Several tags only exist qualified (`zh-Hans`, `sr-Latn`,
  `pt-BR`, `es-419`), so match the exact tag BEFORE the part before the hyphen:
  `zh-Hans`.split('-')[0] is `zh`, which no table has, and Simplified Chinese
  would read English with a good translation sitting right there.
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
- **`last_updated` is not "when the sensor was last polled."** HA only advances
  it when the state or an attribute actually changes; an identical rewrite
  early-returns and bumps `last_reported`, which the websocket never sends to
  the frontend. A flat glucose value on an attribute-less integration (Dexcom)
  therefore has no readable freshness.
- **Do not reach for `last_reported` to fix that.** It is obtainable, via a
  `render_template` subscription whose template calls `now()` to force a
  per-minute re-render (a plain template only re-renders on
  `EVENT_STATE_CHANGED` and would freeze; REST and `get_states` freeze too, as
  `State._as_dict` is an uninvalidated `under_cached_property`). It is still the
  wrong signal: it means "HA polled the API", not "the reading is recent".
  Dexcom's coordinator never checks a reading's age, so an out-of-range
  transmitter keeps `last_reported` advancing on a hours-old value. That turns
  a safe failure (live sensor looks stale) into an unsafe one (dead sensor
  looks live). The fix belongs upstream: `pydexcom` already exposes
  `GlucoseReading.datetime`, and the integration drops it.
- **A glyph's box is not its ink, and the eye measures ink.** Every spacing
  complaint on this card traced back to this, never to the margins. Three
  offsets, all neutralised in the stylesheet: a font reserves room above the cap
  line and below the baseline, so the descent under a big number read as double
  the gap above it (`text-box: trim-both cap alphabetic`); proportional digits
  have uneven side bearings, so "145" leans 1.8px right of centre and "111"
  4.9px left, which reads as the time being off-centre and shifted the number on
  every new reading (`font-variant-numeric: tabular-nums`); an MDI glyph inks
  about two thirds of its box, and the fraction is per-icon, so plain arrows,
  double chevrons and the help circle each carry their own measured `--icon-trim`.
  Measure ink, not boxes: `getBoundingClientRect()` on the SVG `path` for icons,
  `measureText().actualBoundingBox*` for text. Equal box gaps prove nothing.
- **A `Range` rect is a box, not ink, and it looks exactly like the right tool.**
  `text-box: trim-both cap alphabetic` ends `.value` at the baseline, which is
  exact for digits and wrong for a decimal comma: in a mmol locale writing
  `11,4` the comma hung 26px past a 13px gap and printed on the forecast line.
  The first fix measured `Range.getBoundingClientRect()` and reported the same
  `4.86u` under `205` as under `11,4`, because that rect describes the font's
  line box. `measureText(text).actualBoundingBoxDescent` is the ink and
  separates them: `0.2u` for digits, `2.84u` once a comma is there. Reserve that
  as `--value-descent` (scale-invariant, same argument as the width budget) so
  the ink-to-ink gap is identical whatever separator the locale writes.
- **Fullwidth `＋` and `－` (U+FF0B/U+FF0D) are CJK-width glyphs.** They advance
  29.9px where a digit advances 16.6, so the delta ran wide enough to wrap
  between the sign and its number and strand the sign on its own line. Use ASCII
  `+` and U+2212 `−`: both match the digit advance, which is what keeps the sign
  optically attached under `tabular-nums`. `white-space: nowrap` belongs on
  `.value` and `.delta` as well as `.time` — a sign must never part from its
  number, and unit tests against a fake DOM cannot see a wrap, so this one has
  no automated guard.
- **Width-per-unit is scale-invariant, so one measurement sizes the type.** The
  column budget has to know how wide a reading renders, which depends on the
  font and theme; CSS cannot ask. Text width scales linearly with font-size, so
  `width / --u` is a property of the string alone: measure once, set the budget,
  and a new `--u` changes measurement and font-size by the same factor, so it
  cannot oscillate. Recover `--u` from `.value`'s font-size (it is 20u) because
  the custom property reads back as the unresolved `min()` expression. Size the
  budget for the widest string the CURRENT UNIT allows, not the reading on
  screen: per-reading fills marginally better but jumps the number a quarter of
  its size crossing 99 to 100.
- **A card is localised on three surfaces, and two of them never see a `hass`.**
  `getConfigForm()` is static and `window.customCards` is filled at module load,
  so both localizers used to resolve to English and 14 of 22 strings were
  unreadable in all 64 languages (#101). Verified against the frontend source,
  not assumed: `hui-element-editor` assigns `configElement.hass` to whatever
  `getConfigElement()` returns; `hui-form-editor` calls `computeLabel(schema,
hass.localize)`, whose second argument translates HA's keys and carries no
  language; `hui-card-picker` reads `ccard.name`/`ccard.description` as
  properties while rendering, so getters are evaluated late enough; and
  `home-assistant` is a real element (`HomeAssistantAppEl`) holding `hass`, so
  `document.querySelector('home-assistant')?.hass` is a real source rather than
  folklore. `frontendLanguage()` is the one place that reads it. The trap is
  that a translation review of `localize.js` sees only correct translations;
  nothing in the file says where they end up.
- **Sections view: row height 56px, gap 8px, so `rows: N` is `N*64-8` px.** The
  height is only definite when `getGridOptions()` returns a numeric `rows`.
  Masonry never sets a card height, so `cqh`/`height: 100%` do not resolve
  there and layout must degrade gracefully.

## Release process

- **Never force-push tags.** HACS caches releases by tag name — re-tagging means users won't get the update.
- **Always increment version** for every push that should reach users, even hotfixes.

Steps:

```bash
npm version <major|minor|patch> --no-git-tag-version
npm run build
git add -A && git commit -m "v<version>: <description>"
git tag -a v<version> -m "v<version>: <description>"
git push origin main --tags
gh release list -L 3                          # verify
gh release edit v<version> --notes "<notes>"  # add release notes
```

- GitHub Actions (`build.yml`) triggers on `v*` tags, builds and creates GitHub Release
- HACS picks up new releases automatically
- No emoji in release notes — `gh` CLI can corrupt them
