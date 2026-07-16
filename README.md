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
- Responsive card sizing
- Visual configuration editor

## Supported integrations

| Integration              | Value Entity                        | Trend Detection                                  |
| ------------------------ | ----------------------------------- | ------------------------------------------------ |
| **Dexcom**               | `sensor.*_glucose_value`            | Auto-detected from `*_glucose_trend` entity      |
| **Nightscout**           | `sensor.blood_sugar`                | Auto-detected from `direction` attribute         |
| **LibreView** (PTST)     | `sensor.*_glucose_level`            | Auto-detected from `trend` attribute             |
| **LibreLink** (gillesvs) | `sensor.*_glucose_measurement`      | Auto-detected from sibling `*_trend` entity      |
| **Carelink** (Medtronic) | `sensor.*_last_glucose_level_mg_dl` | Auto-detected from `*_last_glucose_trend` entity |

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
glucose_value: sensor.dexcom_glucose_value
```

```yaml
# Full config with all options
type: custom:sugartv-card
glucose_value: sensor.dexcom_glucose_value
glucose_trend: sensor.dexcom_glucose_trend # optional override
timestamp_attribute: measurement_timestamp # optional override
show_prediction: true
color_thresholds: true
thresholds:
    urgent_low: 54 # mg/dL (or 3.0 mmol/L)
    low: 70 # mg/dL (or 3.9 mmol/L)
    high: 180 # mg/dL (or 10.0 mmol/L)
    urgent_high: 250 # mg/dL (or 13.9 mmol/L)
```

### Reading time

The time on the card is when the reading was last confirmed, and it drives the
dimming of stale data.

The card resolves it in this order:

1. The attribute named by `timestamp_attribute`, if you set one.
2. A `measurement_timestamp` attribute (LibreView).
3. A `date` attribute, but only on a sensor that also carries Nightscout's
   `direction`/`delta` attributes, since `date` is a generic name.
4. A sibling entity holding the time: `*_last_glucose_update` (Carelink) or
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
| Carelink         | Exact, from the `*_last_glucose_update` entity                                 |
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
