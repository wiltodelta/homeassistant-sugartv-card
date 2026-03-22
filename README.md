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

| Integration              | Value Entity                   | Trend Detection                             |
| ------------------------ | ------------------------------ | ------------------------------------------- |
| **Dexcom**               | `sensor.*_glucose_value`       | Auto-detected from `*_glucose_trend` entity |
| **Nightscout**           | `sensor.blood_glucose`         | Auto-detected from `direction` attribute    |
| **LibreView** (PTST)     | `sensor.*_glucose_level`       | Auto-detected from `trend` attribute        |
| **LibreLink** (gillesvs) | `sensor.*_glucose_measurement` | Auto-detected from sibling `*_trend` entity |
| **Carelink** (Medtronic) | `sensor.*_last_sg_mgdl`        | Auto-detected from `*_last_sg_trend` entity |

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
show_prediction: true
color_thresholds: true
thresholds:
    urgent_low: 54 # mg/dL (or 3.0 mmol/L)
    low: 70 # mg/dL (or 3.9 mmol/L)
    high: 180 # mg/dL (or 10.0 mmol/L)
    urgent_high: 250 # mg/dL (or 13.9 mmol/L)
```

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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
