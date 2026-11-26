# 07: Drawings for the new exercises

**What to build:** Drawings in the same style as the existing ones for the 23 new exercises (16 stretches, 4 meditation, 3 warm-up moves) listed in the starter shortlist, replacing their placeholders. They use the current text colour plus accent variables so they work in light and dark themes, share the standard canvas size and line weight, and meditation exercises use a calm glyph instead of a body figure. A variant may reuse its parent drawing.

**Blocked by:** 02

Status: done

- [x] One drawing for each of the 23 new exercises, wired to the catalog so no new exercise shows a placeholder
- [x] Style matches the existing drawings (canvas, line weight, current-colour strokes, accent variables); checked visually in light and dark in a contact sheet screenshot
- [x] Per-side stretches show one side clearly
- [x] No scripts, no external references in any drawing
- [x] Build and tests pass

Note: 23 hand-written single-line SVGs (120x100, stroke 2.6, currentColor, --ill-far for far limbs) added in app/src/catalog/drawings, auto-wired by the existing glob. Meditation uses glyphs (silent sit lotus in a halo, box with arrows, three-segment 4-7-8 arc, body outline with scan bands). Checked in a light and dark contact sheet; a unit test in app/src/catalog/index.test.ts asserts every catalog exercise has a drawing and none has scripts or external references.
