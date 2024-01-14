# SugarTV Card

![](https://badgen.net/static/HACS/default)
![](https://badgen.net/github/release/wiltodelta/homeassistant-sugartv-card)
![](https://badgen.net/github/stars/wiltodelta/homeassistant-sugartv-card)
![](https://badgen.net/github/license/wiltodelta/homeassistant-sugartv-card)

A custom lovelace card for Home Assistant that provides a better way to display Dexcom data. This card aims to present the data in a visually appealing and easy-to-understand format, making it easier for users to monitor their glucose levels.

![Screenshot](screenshot.png)

## Features

- Using default Dexcom integration for Home Assistant
- Displays current glucose value, trend, and last updated time
- Supports View type "Panel (1 card)"

## Installation

### Prerequisites

- Home Assistant with HACS (Home Assistant Community Store) installed
- Dexcom integration set up in Home Assistant

### Installing via HACS

SugarTV Card is available in HACS (Home Assistant Community Store).

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Go to "Frontend" section
4. Click button with "+" icon
5. Search for "SugarTV Card"

## Example

```yaml
type: custom:sugartv-card
value_entity: sensor.dexcom_glucose_value
trend_entity: sensor.dexcom_glucose_trend
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
