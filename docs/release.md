# Release process

Steps:

```bash
npm version <major|minor|patch> --no-git-tag-version
npm run build
git add -A && git commit -m "v<version>: <description>"
git tag -a v<version> -m "v<version>: <description>"
git push origin main --tags
gh release list -L 3                          # verify
gh release edit v<version> --notes-file - <<'EOF'  # add release notes
<notes>

If the card works for you, a [star on GitHub](https://github.com/wiltodelta/homeassistant-sugartv-card) helps other CGM users find it.
EOF
```

- The bundle's version comes from `git describe --tags`, not `package.json`: a local build before tagging still carries the previous version
- GitHub Actions (`build.yml`) triggers on `v*` tags, builds and creates GitHub Release
- HACS picks up new releases automatically
- Never force-push or move a published release tag: HACS caches releases by tag, so a fix ships as the next version
- No emoji in release notes — `gh` CLI can corrupt them
- Keep the star line at the end of the notes: existing users read release notes in Home Assistant's update dialog, not the README
