# 02: Exercise library

**What to build:** The Exercises tab. The library ships inside the app as read-only data (never stored in user storage, so it survives cleared site data) and is built from the validated starter shortlist: 52 exercises with name, one of five categories (Strength, HIIT, Stretch, Mobility, Meditation), optional tags (push, pull, legs, core, warm-up, cool-down), default measure (time or reps), per-side flag, how-to steps and tips, and an optional list of variants (label, optional note, optional own drawing). Names, how-to and tips are stored as per-language maps with English fallback. I can browse a two-column grid of drawings, search by name, filter by category and tag, and open an exercise to see drawing, name, category, default measure including per side, variants, how-to and tips. The 29 existing exercises show their existing drawings; the 23 new ones show a clean placeholder until ticket 07. I can attach a personal video link to an exercise (stored per user) and open it externally. Users cannot add, edit, hide or delete library exercises.

**Blocked by:** 01

Status: done

- [x] Catalog contains exactly the ticked exercises in the starter shortlist, with variants and tags as written there; each has a stable id - 52 exercises in app/src/catalog/exercises.ts with variants and tags as in the shortlist; ids are stable slugs
- [x] Catalog is code/static data, available with empty storage (tested) - catalog is a TS module, tested without any database
- [x] Drawings for existing exercises come from the existing assets and respect light and dark themes; missing drawings show a placeholder - 29 drawings bundled from docs/assets and the docs/exercises archive, recoloured via currentColor and CSS variables; 23 new show a placeholder; checked in both themes
- [x] Grid, search, category filter and tag filter work together - search, category chips and tag chips combine (checked headless)
- [x] Exercise detail shows drawing, name, category, tags, measure (with "per side"), variants, how-to and tips; matches the design screens - detail matches 06 (back, drawing, name, category/tag/measure pills, variants, how-to, tips, video link). 'Edit' and 'Add to a routine' from the mockup are left out (no library editing; routine flow is a later ticket)
- [x] Personal video link can be set, changed, removed and opened externally; it persists locally and is not part of the catalog - link stored in Dexie table exerciseLinks (version 2), tested; opens in a new tab; device test pending for external app opening
- [x] No UI to create, edit, hide or delete library exercises - no create/edit/hide/delete UI (the mockup's 'New' button is not built)
- [x] A catalog lookup module exposes: all exercises, find by id, variants of an exercise, warm-up-tagged exercises; unit-tested (language fallback to English included) - src/catalog/index.ts, tests in src/catalog/index.test.ts incl. language fallback
- [x] Layout checked headless at 400 px wide in both themes - screenshots at 400 px, light and dark, no horizontal overflow
- [x] Build and tests pass - npm test (all pass) and npm run build pass
