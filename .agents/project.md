# SugarTV Card — Project Guidelines

## Release Process

### ⚠️ Critical Rules

1. **Never force-push tags.** HACS caches releases by tag name. If you re-tag an existing version, HACS users **will not** receive the update.
2. **Always increment the version** for every push that should reach users. Even for hotfixes, bump the patch version (e.g., `0.9.0` → `0.9.1`).
3. **One tag = one release.** Once a tag is pushed and GitHub Actions creates a release, that version is "burned." Any fixes must go into the next version.
4. **Always add release notes.** GitHub Actions creates releases without a body. After release is created, update it with notes via `gh release edit`. HACS shows these notes to users on the update screen.

### Steps to Release

1. Bump version in `package.json`:

    ```bash
    npm version <major|minor|patch> --no-git-tag-version
    ```

2. Build the project:

    ```bash
    npm run build
    ```

3. Run quality checks:

    ```bash
    npx prettier --check .
    ```

4. Commit all changes (including `dist/`):

    ```bash
    git add -A
    git commit -m "v<version>: <description>"
    ```

5. Create an annotated tag:

    ```bash
    git tag -a v<version> -m "v<version>: <description>"
    ```

6. Push commit and tag:

    ```bash
    git push origin main --tags
    ```

7. **Verify** that GitHub Actions created the release:

    ```bash
    gh release list -L 3
    ```

8. **Add release notes** (HACS shows these to users):

    ```bash
    gh release edit v<version> -R wiltodelta/homeassistant-sugartv-card --notes "<markdown notes>"
    ```

### What Happens Automatically

- GitHub Actions (`build.yml`) triggers on tag push `v*`
- It builds the project, creates a GitHub Release, and attaches `sugartv-card.js`
- HACS picks up the new release automatically
- Users see release notes from the GitHub Release body
- Users must manually clear frontend cache after updating (browser hard refresh)

### Cache Busting

- HACS adds `?hacstag=<timestamp>` to the resource URL automatically
- Browsers may still cache aggressively; users must do Cmd+Shift+R (hard refresh)
- We added `console.info` with version badge so users can verify which version is loaded in DevTools
- There is **no programmatic way** for the card to invalidate browser cache

## Development

### Stack

- **LitElement** for the web component
- **Rollup** for bundling
- **Prettier** for code formatting

### Key Files

- `src/sugartv-card.js` — Main card component + `getConfigForm()` editor schema
- `src/sugartv-card-styles.js` — CSS styles (card zones, transitions)
- `src/localize.js` — i18n translations (EN, RU)
- `demo/index.html` — Demo page for local testing
- `demo/hass-mock.js` — Mock HA components for demo
- `demo/server.js` — Local dev server

### Running the Demo

```bash
npm run demo
# Opens at http://localhost:3000
```

### Configuration Architecture

The card uses HA's declarative `getConfigForm()` API (recommended approach). This means:

- HA renders the form natively with correct theming
- No custom CSS needed for the editor
- Entity selectors, boolean toggles, number inputs, and expandable panels are built-in HA components
- Validation is handled via `assertConfig`
- Default values must be populated in `setConfig()` so the form displays them

Important: `setConfig` normalizes the config by setting `color_thresholds: true` if undefined and populating default thresholds based on the sensor's unit.

### Color-Coded Glucose Zones

Default thresholds follow the **AGP/TIR international standard**:

| Zone        | mg/dL     | mmol/L      |
| ----------- | --------- | ----------- |
| Urgent Low  | < 54      | < 3.0       |
| Low         | 54 – 70   | 3.0 – 3.9   |
| In Range    | 70 – 180  | 3.9 – 10.0  |
| High        | 180 – 250 | 10.0 – 13.9 |
| Urgent High | > 250     | > 13.9      |

Zone background is applied to `:host` element (not `.container`) so it fills the entire card.

CSS custom properties for theming:

- `--sugartv-urgent-bg` (default: `#c62828`)
- `--sugartv-urgent-text` (default: `#ffffff`)
- `--sugartv-warning-text` (default: `#e65100`)

### Stale Data

- Time turns red when data is older than 15 minutes
- In urgent zones (red background), stale uses pulsing white animation instead
- Stale styling must be compatible with all zone colors

### Multi-Sensor Support (v0.10.0+)

The card auto-detects the trend source. `glucose_trend` config is YAML-only override (not in UI editor).

**Auto-detect order in `_resolveTrend()`:**

1. YAML override: `config.glucose_trend` entity
2. Sibling entity patterns:
    - Dexcom: `*_glucose_value` → `*_glucose_trend`
    - Carelink: `*_last_sg_mgdl` / `*_last_sg_mmol` → `*_last_sg_trend`
3. Generic prefix match: `sensor.*_{key}` → `sensor.*_trend` (LibreLink/gillesvs)
4. Nightscout: attribute `direction` on value entity
5. LibreView/PTST: attribute `trend` on value entity
6. Fallback: `'unknown'`

**TREND_MAP** normalizes all integration-specific values to internal format (`rising_quickly`, `rising`, `rising_slightly`, `steady`, `falling_slightly`, `falling`, `falling_quickly`).

**Verified integrations (source code audit):**

| Integration               | Entity Naming                                     | Trend Source                      |
| ------------------------- | ------------------------------------------------- | --------------------------------- |
| Dexcom (official)         | `sensor.dexcom_{user}_glucose_value`              | Separate `*_glucose_trend` entity |
| Nightscout (official)     | `sensor.blood_sugar`                              | Attribute `direction`             |
| LibreView/PTST (HACS)     | `sensor.{name}_glucose_level`                     | Attribute `trend`                 |
| LibreLink/gillesvs (HACS) | `sensor.librelink_{name}_glucose_measurement`     | Separate `*_trend` entity         |
| Carelink/Medtronic (HACS) | `sensor.carelink_{name}_last_glucose_level_mg_dl` | Separate `*_last_sg_trend` entity |

**Delta calculation:** Uses History API to find the reading closest to ~5 minutes ago (standard CGM interval), ensuring consistent delta across integrations with different update frequencies (1 min for LibreView vs 5 min for Dexcom).

### Release Notes Formatting

- **No emojis** in release notes text — `gh` CLI can corrupt them
- Use `###` headers and `- bullet` lists
- Keep notes concise and user-facing
