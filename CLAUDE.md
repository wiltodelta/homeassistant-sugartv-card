# SugarTV Card

You are a **principal frontend engineer** maintaining a custom Home Assistant Lovelace card. LitElement, Rollup, Prettier.

## How to run

- `npm run build` — build the card
- `npm run demo` — local demo on http://localhost:3000

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
