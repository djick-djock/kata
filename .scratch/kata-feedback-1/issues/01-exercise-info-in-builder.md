# 01: Exercise info from the picker and from routine steps

**What to build:** While building a routine I can learn what an exercise is without leaving my work. In the add-exercise picker every exercise has an info control (separate from the quick add) that opens the full exercise details (drawing, how-to, tips, video link, variants), and going back returns me to the picker exactly where I was, with my search and filters kept. Once an exercise is in a routine, I can open its details from the step (a catalog exercise shows its normal details). A custom step has optional written details: a free-text field I can fill in when creating it and edit later in the step editor, and an info control on the step shows the name, measure and my written text (a placeholder drawing as before). Going back from any details screen returns to the builder with its state intact (expanded blocks, scroll position as far as is practical).

**Blocked by:** None (can start immediately)

Status: ready-for-agent

- [ ] Picker rows have an info control that opens exercise details; quick add keeps working; back returns to the picker with search, filter and scroll kept
- [ ] Each catalog step in the builder opens that exercise's details (including its variant if one was chosen)
- [ ] Custom steps have an optional details text field in the create and edit forms; it is saved with the routine and included in backups (stored on the step)
- [ ] A custom step's info view shows name, measure, per-side and the written details; empty details show a gentle hint to add some
- [ ] Details screens opened from the builder have a clear back path to the builder; unsaved builder state is not lost
- [ ] Data test: a custom step's details round-trip through save and load and through export and import
- [ ] Layout checked headless at 400 px wide in light and dark
- [ ] Build and tests pass
