# SugarTV Card

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

A custom Lovelace card for Home Assistant that displays CGM (Continuous Glucose Monitor) data. Supports **Dexcom**, **Nightscout**, **LibreView**, **LibreLink**, and **Carelink (Medtronic)** with automatic trend detection.

![SugarTV Card in a room](sugartv-card-room.png)
![Full-screen view of the SugarTV Card](sugartv-card-fullscreen.png)
![Embedded SugarTV Card on a dashboard](sugartv-card-embedded.png)

## Features

- **Multi-sensor support** — Dexcom, Nightscout, LibreView, LibreLink, Carelink (auto-detected)
- Displays: current glucose, delta from previous reading, trend direction, last update time, glucose prediction
- Color-coded glucose zones (AGP/TIR standard thresholds)
- Stale data indicator — card fades when data is older than 15 minutes
- Tap to open HA more-info dialog with history graph
- Automatic local time format and unit support (mmol/L and mg/dL)
- Adapts to the space it is given: a wide slot lays the reading out in a row, a
  tall or square one stacks it into a column, and the type scales to fill either.
  No layout option and no font sizes to set.
- Visual configuration editor

## Supported integrations

| Integration              | Value Entity                       | Trend Detection                                 |
| ------------------------ | ---------------------------------- | ----------------------------------------------- |
| **Dexcom**               | `sensor.*_glucose_value`           | Auto-detected from `*_glucose_trend` entity     |
| **Nightscout**           | `sensor.blood_sugar`               | Auto-detected from `direction` attribute        |
| **LibreView** (PTST)     | `sensor.*_glucose_level`           | Auto-detected from `trend` attribute            |
| **LibreLink** (gillesvs) | `sensor.*_glucose_measurement`     | Auto-detected from sibling `*_trend` entity     |
| **Carelink** (Medtronic) | `sensor.*last_glucose_level_mg_dl` | Auto-detected from `*last_glucose_trend` entity |

Just select your glucose sensor — the card figures out the rest automatically.

## Installation

### Prerequisites

1. Home Assistant with HACS (Home Assistant Community Store) installed
2. A CGM integration set up (Dexcom, Nightscout, or LibreView)

### Installing via HACS

1. Open HACS in Home Assistant
2. Navigate to "Frontend" section
3. Click the "+" button
4. Search for "SugarTV Card"
5. Click "Install"
6. Restart Home Assistant

## Configuration

### Using the UI

1. Add a new card to your dashboard
2. Choose "Custom: SugarTV Card"
3. Use the visual editor to configure:
    - Select glucose value sensor
    - Toggle prediction display
    - Toggle color-coded glucose zones
    - Customize glucose thresholds

### Using YAML

```yaml
# Minimal — just one entity, trend auto-detected
type: custom:sugartv-card
glucose_value: sensor.jane_glucose_value
```

```yaml
# Full config with all options
type: custom:sugartv-card
glucose_value: sensor.jane_glucose_value
glucose_trend: sensor.jane_glucose_trend # optional override
timestamp_attribute: measurement_timestamp # optional override
show_prediction: true
color_thresholds: true
thresholds:
    urgent_low: 54 # mg/dL (or 3.0 mmol/L)
    low: 70 # mg/dL (or 3.9 mmol/L)
    high: 180 # mg/dL (or 10.0 mmol/L)
    urgent_high: 250 # mg/dL (or 13.9 mmol/L)
```

`sensor.jane_*` is a placeholder. Your entity ids depend on the integration, so
check Developer Tools, States and match the patterns in the table above. Dexcom,
for example, builds the id from your account username, so it is
`sensor.<username>_glucose_value`, with no `dexcom_` prefix.

### Layout

There is no layout option, on purpose. The card reads the shape of the slot it
is given and picks the arrangement that fills it, so it stays right when you
rearrange a dashboard instead of needing to be told again.

| Slot              | Layout                                     |
| ----------------- | ------------------------------------------ |
| Wider than 5:3    | Row: time, reading and trend on one line   |
| Narrower than 5:3 | Column: the reading stacked over its trend |

The type scales to fill either one, which is why there are no font sizes to
set. 5:3 is not a taste call: it is the point where the column starts giving a
larger reading than the row.

**To get the vertical layout**, give the card a slot taller than it is wide:

- **Sections view** is where this works, because it gives the card a definite
  size. The card starts at 6 columns by 1 row, which is wide and short; open its
  layout options and raise the rows or drop the columns until the slot is
  narrower than 5:3, and it turns vertical. It goes down to 3 columns.
- **Masonry view** never sets a card height, so the card keeps its own
  proportions there and always lays out as a row.
- **Panel and full-screen views** follow the same rule as any other slot: a tall
  narrow panel gets the column, a wide one gets the row.

### Reading time

The time on the card is when the reading was last confirmed, and it drives the
dimming of stale data.

The card resolves it in this order:

1. The attribute named by `timestamp_attribute`, if you set one.
2. A `measurement_timestamp` attribute (LibreView).
3. A `date` attribute, but only on a sensor that also carries Nightscout's
   `direction`/`delta` attributes, since `date` is a generic name.
4. A sibling entity holding the time: `*last_glucose_update` (Carelink) or
   `*_minutes_since_update` (LibreLink).
5. The entity's `last_updated`, then `last_changed`.

Both ISO date strings and epoch values (seconds or milliseconds) are accepted;
anything unparseable falls back to the next step.

**Accuracy depends on your integration**, because Home Assistant only advances
`last_updated` when the state or one of its attributes actually changes. A poll
that re-reports an identical value with identical attributes leaves both
`last_updated` and `last_changed` frozen. Home Assistant records that poll in
`last_reported`, which it does not send to the frontend, so a card cannot see
it. That is why the card prefers a time the integration itself reports.

| Integration      | Reading time                                                                   |
| ---------------- | ------------------------------------------------------------------------------ |
| LibreView (PTST) | Exact, from `measurement_timestamp`                                            |
| Nightscout       | Exact, from `date`                                                             |
| Carelink         | Exact, from the `*last_glucose_update` entity                                  |
| LibreLink        | To the minute while the reading is recent, from `*_minutes_since_update`       |
| Dexcom           | Approximate: it publishes no time at all, so a flat value can still look stale |

LibreLink is the weak one. It reports an age rather than a time, and computes it
by subtracting a device-local reading time from the Home Assistant server's
clock, so the number is wrong by the offset between the two timezones
([gillesvs/librelink#27](https://github.com/gillesvs/librelink/issues/27)
reports -118 minutes). A wrong age cannot be told apart from an old reading, so
the card only trusts an age below the staleness threshold. Past it, the age and
`last_updated` both say "stale" anyway.

If your integration reports the measurement time under some other attribute of
the glucose sensor, point the card at it with `timestamp_attribute`.

### Glucose zone thresholds

Color-coded zones are enabled by default using the [AGP/TIR international standard](https://diabetesjournals.org/care/article/42/8/1593/36034) thresholds.

| Zone        | mg/dL     | mmol/L      | Style                      |
| ----------- | --------- | ----------- | -------------------------- |
| Urgent Low  | < 54      | < 3.0       | Red background, white text |
| Low         | 54 – 70   | 3.0 – 3.9   | Orange text                |
| In Range    | 70 – 180  | 3.9 – 10.0  | Normal                     |
| High        | 180 – 250 | 10.0 – 13.9 | Orange text                |
| Urgent High | > 250     | > 13.9      | Red background, white text |

To disable color coding, set `color_thresholds: false` or use the toggle in the visual editor.

### Theme integration

Colors can be customized via CSS custom properties in your HA theme:

```yaml
# In your HA theme
sugartv-urgent-bg: '#c62828'
sugartv-urgent-text: '#ffffff'
sugartv-warning-text: '#e65100'
```

## Support

- Found a bug? [Create an issue](https://github.com/wiltodelta/homeassistant-sugartv-card/issues)
- Have an idea? [Suggest an improvement](https://github.com/wiltodelta/homeassistant-sugartv-card/issues)
- Like the project? Star it on GitHub!

If this card is useful to you, please consider supporting its development:

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa.svg?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/wiltodelta)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
