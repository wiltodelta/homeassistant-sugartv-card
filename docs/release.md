# Release process

Relocated verbatim from the repo root `CLAUDE.md`. Never force-pushing a tag
stays inline in `CLAUDE.md`, because HACS caching is the reason here; always
incrementing the version is the global rule in `~/.claude/CLAUDE.md` under
`Code quality`, phrased there as never re-tagging a published release.

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
