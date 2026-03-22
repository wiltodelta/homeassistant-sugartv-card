# SugarTV Card — Project Guidelines

## Release Process

### ⚠️ Critical Rules

1. **Never force-push tags.** HACS caches releases by tag name. If you re-tag an existing version, HACS users **will not** receive the update.
2. **Always increment the version** for every push that should reach users. Even for hotfixes, bump the patch version (e.g., `0.9.0` → `0.9.1`).
3. **One tag = one release.** Once a tag is pushed and GitHub Actions creates a release, that version is "burned." Any fixes must go into the next version.

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
    npm audit
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

### What Happens Automatically

- GitHub Actions (`build.yml`) triggers on tag push `v*`
- It builds the project, creates a GitHub Release, and attaches `sugartv-card.js`
- HACS picks up the new release automatically

## Development

### Stack

- **LitElement** for the web component
- **Rollup** for bundling
- **Prettier** for code formatting

### Key Files

- `src/sugartv-card.js` — Main card component + `getConfigForm()` editor schema
- `src/sugartv-card-styles.js` — CSS styles (card zones, transitions)
- `src/localize.js` — i18n translations (EN, RU)
- `src/sugartv-card-editor.js` — Legacy custom editor (deprecated, replaced by `getConfigForm()`)
- `demo/index.html` — Demo page for local testing
- `demo/hass-mock.js` — Mock HA components for demo
- `demo/server.js` — Local dev server

### Running the Demo

```bash
npm run demo
# Opens at http://localhost:3000
```

### Configuration Architecture

The card uses HA's declarative `getConfigForm()` API (not a custom editor element). This means:

- HA renders the form natively with correct theming
- No custom CSS needed for the editor
- Entity selectors, boolean toggles, number inputs, and expandable panels are all built-in HA components
- Validation is handled via `assertConfig`

### Color-Coded Glucose Zones

Default thresholds follow the **AGP/TIR international standard**:

| Zone        | mg/dL     | mmol/L      |
| ----------- | --------- | ----------- |
| Urgent Low  | < 54      | < 3.0       |
| Low         | 54 – 70   | 3.0 – 3.9   |
| In Range    | 70 – 180  | 3.9 – 10.0  |
| High        | 180 – 250 | 10.0 – 13.9 |
| Urgent High | > 250     | > 13.9      |

CSS custom properties for theming:

- `--sugartv-urgent-bg` (default: `#c62828`)
- `--sugartv-urgent-text` (default: `#ffffff`)
- `--sugartv-warning-text` (default: `#e65100`)
