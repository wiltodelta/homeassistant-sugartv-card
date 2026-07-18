# SugarTV Card

You are a **principal frontend engineer** maintaining a custom Home Assistant Lovelace card. LitElement, Rollup, Prettier.

## How to run

- `npm run build` — build the card
- `npm test` — vitest suite (`test/*.test.js`)
- `npm run demo` — local demo on http://localhost:3000
- No `maintain.sh`. The gate is `npm test && npm run build && npx prettier --check .`

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
