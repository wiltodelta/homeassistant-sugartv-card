# README screenshots

**README images are generated, not hand-cropped.** `demo/shot.html` renders one
or more cards on an HA-like background, and `demo/shots.py` shoots them with
headless Chrome at 2x. Every figure in the README is defined in that script, so
a change to the card is re-shot rather than re-cropped:

```bash
node demo/server.js &
python3 demo/shots.py             # all six figures
python3 demo/shots.py age-tiers   # one, by name
```

Re-shooting is not idempotent: any card without an explicit `age` is rendered at
`now`, so its clock reads whatever time it was taken. Only re-shoot the figures a
change actually affects.

## The spec format

`shot.html` takes one spec a card on `?specs=`:

    WIDTHxHEIGHT:VALUE:TREND[:opt=value;opt=value]

Comma separated between cards, semicolon separated between options, since the
comma is already taken.

| Option  | Effect                                                        |
| ------- | ------------------------------------------------------------- |
| `age`   | Minutes to backdate the reading by. Default 0, meaning "now". |
| `rel`   | `1` shows the age in place of the clock (`relative_time`).    |
| `dim`   | `1` enables `dim_by_age`.                                     |
| `pred`  | `0` drops the forecast line.                                  |
| `loc`   | The card's locale. Default `en-US`.                           |
| `label` | Caption under the card. `<b>` and `<br>` are allowed.         |

`shots.py` URL-encodes labels for you, and rejects one containing a comma, which
would otherwise split the spec it belongs to.

## What the pictures depend on

1. **The window is the stage plus its 48px padding**, so it tracks the specs. A
   captioned figure needs roughly 36px more height per row than the card itself.
2. **A column shape wants both axes binding at once** (260x300) or the card
   floats in its own slack.
3. **The stage wraps.** A set too wide for the window becomes a grid, so the
   window width is what decides where a strip breaks — that is how the seven
   trend arrows land as 4 + 3.
4. **`age` backdates the mock history along with the reading**, so the measured
   cadence stays 5 minutes however old the reading is. Without that the age
   tiers would be shot against a cadence moving underneath them, and the rung a
   card lands on would depend on the figure rather than on its age.
5. **The captions are load-bearing on the age tiers.** Those three cards differ
   only in opacity; without a caption a reader cannot tell which rung is which,
   or that the difference is the subject.
6. **The stage colours `.ha-card`, never `sugartv-card`**: a rule in the outer
   document outranks the card's own `:host()` rules, so colouring the element
   directly shoots black text on the red urgent zone.
