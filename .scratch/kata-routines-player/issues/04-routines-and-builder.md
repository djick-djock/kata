# 04: Routines and builder

**What to build:** The Routines tab and the routine builder. I see a list of my routines with search and category filter; each card shows drawing, name, category, total length and when I last did it, with a Play button. I can create a routine from blank, from a template (Intervals: 45 s work, 15 s rest, 2 rounds; Tabata: 20 s, 10 s, 8 rounds; Stretch flow: 30 s each, no rest) or by copying one (the original stays untouched). In the builder a routine is a list of blocks with a name and repeat count; a block can be flagged warm-up (no rest, visually distinct) and collapsed. A step is a catalog exercise (I pick a variant if it has any, and warm-up-tagged exercises are offered first inside a warm-up block, though I can still pick anything) or a custom step where I type a name and a time or reps value, optionally per side. Each step has a time or reps measure and a rest after in seconds (zero allowed). I can reorder steps by dragging. The header shows total duration with an approximate mark when reps steps are present. I can pin one routine. Routines save and load locally. A step that references a catalog exercise no longer present falls back to a custom step with its saved name.

**Blocked by:** 02, 03

Status: ready-for-agent

- [ ] Routine list with search, category filter and card info; a Play button exists (the player arrives in ticket 05)
- [ ] Create from blank, template and copy; copy leaves the original unchanged (tested)
- [ ] Blocks with name, repeat count, warm-up flag and collapse; steps with exercise or custom step, variant choice, measure, per-side and rest after
- [ ] Add-exercise picker works from the builder and "add to routine" works from the exercise detail screen
- [ ] Warm-up-tagged exercises are listed first in a warm-up block
- [ ] Drag to reorder steps works on touch
- [ ] Total duration is computed through the engine's flattening, approximate mark shown for reps
- [ ] Only one routine can be pinned
- [ ] Routines persist across reloads; round-trip save and load tested; a missing catalog id falls back to the saved name (tested)
- [ ] Screens match the design (routines list, new routine sheet, builder) at 400 px wide in both themes
- [ ] Build and tests pass
