---
globs: src/**/*.js, test/**/*.js
description: Home Assistant integration facts — entity-id resolution, setConfig/hass ordering, state freshness (last_updated vs last_reported), sections-view grid sizing.
---

# Home Assistant entity and lifecycle rules

Relocated verbatim from the repo root `CLAUDE.md`. Read before editing this domain.

## Config lifecycle

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

## Entity-id resolution

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

## Freshness (`last_updated` / `last_reported`)

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
- **A measured cadence is a MEDIAN gap, and both other statistics fail loudly
  in opposite directions.** The average is dragged up by the double-width hole
  HA leaves when a reading repeats and writes no history entry. The smallest,
  which shipped for that reason, is dragged down by any single early poll: the
  `MIN_CADENCE_MS` floor only rejects gaps under a minute, so one retry landing
  at 90 seconds redefined a 5 minute sensor as a 90 second one for the whole
  card. That collapsed staleness to 4.5 minutes and the quiet tier to 90
  seconds, so only the sub-minute `now` string ever read as current, which is
  the symptom that surfaced it. A cadence feeds every age tier at once, so a
  wrong one is never a local error. Prefer the statistic that ignores outliers
  on both sides, and resolve ties toward the tighter reading.
- **The age tiers are ONE ladder, and splitting them into predicates is how
  they drift.** `_isFresh` and `_isStale` each read their own threshold, and
  neither could see the other, which is how the quiet rung came to be derived
  from the CAPPED stale window (`/ STALE_INTERVALS`) instead of from the
  cadence. That inherited the 15 minute cap, so the rung could never exceed 5
  minutes and a 10 minute sensor announced a missed poll that had not happened.
  `_ageTier()` is the single source; the predicates delegate to it. It asks
  staleness FIRST so the rungs cannot overlap even if the thresholds are ever
  mis-ordered, which makes "stale card carrying a quiet time" unreachable by
  construction rather than by arithmetic.
- **State the no-history fallback as a CADENCE, not as a window.** Both
  thresholds then start from the same kind of number, and the quiet tier has an
  interval to take one of; deriving it from the stale window is what inherited
  the cap in the first place. `DEFAULT_CADENCE_MS` divides by `STALE_INTERVALS`
  by name rather than by the 3 it equals, because `_staleThresholdMs` clamps to
  `STALE_FALLBACK_MS` and would go on reading 15 minutes while a retune
  silently moved the quiet tier of every recorder-disabled install. A test pins
  the identity on the constants; asserting it on either window stays green
  through exactly that break, and with no history the old capped formula and
  the new one agree exactly, which is why the original bug only ever showed on
  a sensor slower than 5 minutes.

## Sections view (grid sizing)

- **Sections view: row height 56px, gap 8px, so `rows: N` is `N*64-8` px.** The
  height is only definite when `getGridOptions()` returns a numeric `rows`.
  Masonry never sets a card height, so `cqh`/`height: 100%` do not resolve
  there and layout must degrade gracefully.
