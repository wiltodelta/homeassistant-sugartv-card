---
paths:
    - 'src/**/*.js'
    - 'test/**/*.js'
    - 'README.md'
description: Home Assistant integration facts — entity-id resolution, setConfig/hass ordering, state freshness (last_updated vs last_reported), the age ladder, sections-view grid sizing, where insulin entities live.
---

# Home Assistant entity and lifecycle rules

## Config lifecycle

- **Lovelace calls `setConfig` before it assigns `hass`, so resolve unit-dependent defaults (thresholds) when the value is read, never when the config is normalized.** Treat thresholds that exactly equal another unit's defaults as a stale guess, and test config-time behaviour through `setConfig`, since a helper assigning `card.config` bypasses it.

## Entity-id resolution

- **Entity ids come from an integration's entity NAMES, not its internal keys.** Read `SensorEntityDescription(name=...)`, never `key=` (Carelink `last_sg_mgdl` is `sensor.*last_glucose_level_mg_dl`).
- **Dexcom's entity is `sensor.<username>_glucose_value`, with no `dexcom_` in the id.** Match the `*_glucose_value` tail, never a literal `dexcom_` head.
- **An entity id has no predictable head, so match its tail** with `siblingEntityId()`, never a prefix assumption or a bare `endsWith`.
- **Auto-detect a sibling only when the card renders the READING wrong without it, not merely less.** Active insulin is `insulin_value` in the config or nothing, with no sibling hunt.
- **If insulin sibling detection is ever asked for, do not tail-swap next to the glucose sensor:** glucose and insulin usually come from different integrations. Known insulin tails are `active_insulin`, `insulin_on_board` and `loop_iob`.
- **glucifer's `measurement_time` is an ENTITY, not an attribute, so `timestamp_attribute` cannot see it; keep it out of `TIMESTAMP_SIBLINGS`,** because the `glucose` tail it would hang off is the most generic tail there is.

## Freshness (`last_updated` / `last_reported`)

- **`last_updated` is not "when the sensor was last polled."** HA only advances
  it when the state or an attribute actually changes; an identical rewrite
  early-returns and bumps `last_reported`, which the websocket never sends to
  the frontend. A flat glucose value on an attribute-less integration (Dexcom)
  therefore has no readable freshness.
- **Do not use `last_reported` for freshness:** it means "HA polled the API", not "the reading is recent". Once home-assistant/core#176641 (`*_glucose_reading_time`) ships in an HA release, pair it with `glucose_value` in `TIMESTAMP_SIBLINGS` and update the README's Dexcom row.
- **Measure cadence as the MEDIAN gap, never the average or the smallest, and resolve ties toward the tighter reading.** A cadence feeds every age tier at once.
- **The age fade runs ONE WAY, toward staleness.** `_ageTier()` returns `current` / `aging` / `stale`; assert the ordering over a sweep of ages, never rung by rung.
- **`_ageTier()` is the single source of the age tiers (`_isStale` delegates to it).** It asks staleness first, and the middle rung derives from the cadence, never from the capped stale window.
- **State the no-history fallback as a CADENCE, not as a window.** `DEFAULT_CADENCE_MS` divides by `STALE_INTERVALS` by name; pin the identity on the constants, not on either window.
- **Whole-card dimming on staleness has no option and stays always-on; `dim_by_age` gates the middle rung only.** Never add one switch for all dimming, and keep the `dim_by_age` name.

## Sections view (grid sizing)

- **Sections view: row height 56px, gap 8px, so `rows: N` is `N*64-8` px.** The
  height is only definite when `getGridOptions()` returns a numeric `rows`.
  Masonry never sets a card height, so `cqh`/`height: 100%` do not resolve
  there and layout must degrade gracefully.
