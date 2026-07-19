# README screenshots

Relocated verbatim from the repo root `CLAUDE.md` "How to run".

**README images are generated, not hand-cropped.** `demo/shot.html` takes one
`WIDTHxHEIGHT:VALUE:TREND` spec a card and renders them on an HA-like
background; headless Chrome shoots it at 2x:

```bash
node demo/server.js &
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shoot() { "$CHROME" --headless --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --virtual-time-budget=8000 \
  --window-size="$1" --screenshot="$2" \
  "http://localhost:3000/demo/shot.html?specs=$3"; }

shoot 964,396  sugartv-card-layouts.png 560x200:145:rising,260x300:145:rising
shoot 1152,216 sugartv-card-zones.png \
  320x120:52:falling_quickly,320x120:120:rising_slightly,320x120:210:rising
```

Four things the pictures depend on. The window is the stage plus its 48px
padding, so it tracks the specs. A column shape wants both axes binding at
once (260x300) or the card floats in its own slack. The reading time has to
be `now` or the card correctly greys itself out as stale, so the clock reads
whenever it was shot. And the stage colours `.ha-card`, never `sugartv-card`:
a rule in the outer document outranks the card's own `:host()` rules, so
colouring the element directly shoots black text on the red urgent zone.
