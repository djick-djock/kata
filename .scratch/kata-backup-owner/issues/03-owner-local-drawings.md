# 03: Owner local drawings

**What to build:** In Owner mode I can bring Claude's returned SVG back into the app for an exercise: paste it or import an SVG file. The drawing is validated and sanitised (scripts, event handlers, external links and unknown elements are stripped), shown in a preview in both the light and dark theme before I save, and then stored locally on my device as that exercise's drawing, taking priority over the shipped one. I can later replace or remove it to fall back to the shipped drawing. These local drawings are part of the backup so they are never lost. Regular users never see any of this.

**Blocked by:** 01, 02

Status: ready-for-agent

- [ ] Paste or file-import of SVG from the exercise detail screen in Owner mode only
- [ ] Sanitiser removes scripts, event handlers, external references and unknown elements and leaves valid drawings unchanged (tested with hostile and valid samples); invalid input shows a clear message and nothing is stored
- [ ] Preview in light and dark before saving; save and cancel work
- [ ] A saved local drawing is used everywhere that exercise's drawing appears (library, detail, builder, player) and survives reloads
- [ ] Replace and remove work; removing falls back to the shipped drawing
- [ ] Local drawings are included in export and restored by import (extend the round-trip test)
- [ ] Layout checked headless at 400 px wide in light and dark
- [ ] Build and tests pass
