# SugarTV Card

You are a **principal frontend engineer** maintaining a custom Home Assistant Lovelace card. LitElement, Rollup, Prettier.

## How to run

- `npm run build` — build the card
- `npm test` — vitest suite (`test/*.test.js`)
- `npm run demo` — local demo on http://localhost:3000
- No `maintain.sh`. The gate is `npm test && npm run build && npx prettier --check .`

## Home Assistant facts worth not re-deriving

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
