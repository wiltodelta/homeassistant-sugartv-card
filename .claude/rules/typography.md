---
globs: src/**/*.js, src/**/*.css
description: Type and layout metrics — measure ink not boxes, Range rect vs measureText, fullwidth sign glyphs, scale-invariant width-per-unit budget, and the card's colour budget.
---

# Typography and layout-metric rules

Relocated verbatim from the repo root `CLAUDE.md`. Read before editing this domain.

## Measure ink, not boxes

- **A glyph's box is not its ink, and the eye measures ink.** Every spacing
  complaint on this card traced back to this, never to the margins. Three
  offsets, all neutralised in the stylesheet: a font reserves room above the cap
  line and below the baseline, so the descent under a big number read as double
  the gap above it (`text-box: trim-both cap alphabetic`); proportional digits
  have uneven side bearings, so "145" leans 1.8px right of centre and "111"
  4.9px left, which reads as the time being off-centre and shifted the number on
  every new reading (`font-variant-numeric: tabular-nums`); an MDI glyph inks
  about two thirds of its box, and the fraction is per-icon, so plain arrows,
  double chevrons and the help circle each carry their own measured `--icon-trim`.
  Measure ink, not boxes: `getBoundingClientRect()` on the SVG `path` for icons,
  `measureText().actualBoundingBox*` for text. Equal box gaps prove nothing.
- **A `Range` rect is a box, not ink, and it looks exactly like the right tool.**
  `text-box: trim-both cap alphabetic` ends `.value` at the baseline, which is
  exact for digits and wrong for a decimal comma: in a mmol locale writing
  `11,4` the comma hung 26px past a 13px gap and printed on the forecast line.
  The first fix measured `Range.getBoundingClientRect()` and reported the same
  `4.86u` under `205` as under `11,4`, because that rect describes the font's
  line box. `measureText(text).actualBoundingBoxDescent` is the ink and
  separates them: `0.2u` for digits, `2.84u` once a comma is there. Reserve that
  as `--value-descent` (scale-invariant, same argument as the width budget) so
  the ink-to-ink gap is identical whatever separator the locale writes.

## Sign glyphs

- **Fullwidth `＋` and `－` (U+FF0B/U+FF0D) are CJK-width glyphs.** They advance
  29.9px where a digit advances 16.6, so the delta ran wide enough to wrap
  between the sign and its number and strand the sign on its own line. Use ASCII
  `+` and U+2212 `−`: both match the digit advance, which is what keeps the sign
  optically attached under `tabular-nums`. `white-space: nowrap` belongs on
  `.value` and `.delta` as well as `.time` — a sign must never part from its
  number, and unit tests against a fake DOM cannot see a wrap, so this one has
  no automated guard.

## Width budget

- **Width-per-unit is scale-invariant, so one measurement sizes the type.** The
  column budget has to know how wide a reading renders, which depends on the
  font and theme; CSS cannot ask. Text width scales linearly with font-size, so
  `width / --u` is a property of the string alone: measure once, set the budget,
  and a new `--u` changes measurement and font-size by the same factor, so it
  cannot oscillate. Recover `--u` from `.value`'s font-size (it is 20u) because
  the custom property reads back as the unresolved `min()` expression. Size the
  budget for the widest string the CURRENT UNIT allows, not the reading on
  screen: per-reading fills marginally better but jumps the number a quarter of
  its size crossing 99 to 100.

## Colour budget

- **Colour is spent on this card; new signals get loudness instead.** Orange
  (`--sugartv-warning-text`) means "out of range" and red means "urgent", so any
  second axis reaching for orange paints two unrelated meanings the same colour
  and lands on red in the urgent zones, where nothing shows. The freshness
  tiering (#94, point 2) is opacity only for that reason, and v0.9.3 had already
  learned it once: `.time.stale` used to go red, and the whole-card fade
  replaced it precisely because colour could not work across the zones.
  Before adding a colour, check the zone rules; before adding a tier, check
  whether opacity says it. Related: a tier whose text never changes still needs
  the age ticker, since only the tier moves, and a frozen card then looks
  correct rather than stuck.
