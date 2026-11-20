---
paths:
    - 'src/**/*.js'
    - 'test/**/*.js'
description: Type and layout metrics — measure ink not boxes, Range rect vs measureText, host class ownership and no host transition, fullwidth sign glyphs, scale-invariant width-per-unit budget, and the card's colour budget.
---

# Typography and layout-metric rules

## Measure ink, not boxes

- **Measure ink, not boxes:** `getBoundingClientRect()` on the SVG `path` for icons, `measureText().actualBoundingBox*` for text; equal box gaps prove nothing. Keep `text-box: trim-both cap alphabetic`, `tabular-nums` and the per-icon `--icon-trim`.
- **Real `<ha-icon>` has `:host { fill: currentcolor }` with no `display: flex`, wrapping `<ha-svg-icon>` (`inline-flex; vertical-align: middle`).** Give `ha-icon` `display: flex` so `<ha-svg-icon>` never drops onto an inline baseline strut, and never set `overflow: clip`/`hidden` on `.trend` or `.delta`, which clips negative-margin icon tips and descenders.
- **A `Range` rect is the line box, not ink.** Reserve the reading's descent from `measureText(text).actualBoundingBoxDescent` as `--value-descent` (scale-invariant) so the gap is identical whatever decimal separator the locale writes.

## The host belongs to more than this card

- **Own only `stale`, `aging`, `view-compact` and the four `zone-*` classes on the host (`HOST_CLASSES`):** `classList.toggle` each from `willUpdate`, never assign `this.className`.
- **Never put a transition on `:host`:** cards created in one synchronous burst hold the transition's start value. `test/styles.test.js` guards the shape.

## Sign glyphs

- **Use ASCII `+` and U+2212 `−`, never fullwidth `＋`/`－`, and keep `white-space: nowrap` on `.value`, `.delta` and `.time`.** No automated test can see a wrap.

## Width budget

- **Size the column budget from `width / --u`, measured once (it is scale-invariant), for the widest string the CURRENT UNIT allows.** Recover `--u` through `_valueUnitPx()`, which divides `.value`'s font-size (20u times `--value-scale`) by both; the custom property reads back unresolved.
- **A word in the reading's place (`common.not_available`) is shrunk to the widest reading's width by `--value-scale`, never left to clip.** Size the rest of the line for numbers; the column budget skips the word.

## Colour budget

- **Orange (`--sugartv-warning-text`) means out of range and red means urgent; give new signals opacity, not colour.** Opacity multiplies down the tree, so check what an element's own opacity composes with, score a fade by its resulting contrast, and keep a stale card readable.
