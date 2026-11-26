# 02: Owner mode shows custom exercises in use

**What to build:** Owner mode is repurposed. The "Import drawing" action and everything behind it (the SVG paste and file import, preview, replace and remove, and the local drawing override) is removed from the app; shipped drawings come only from the code. In Owner mode, the exercise detail screen of a shipped exercise no longer shows owner actions. Instead Settings (Owner mode on) has a "Custom exercises" screen listing every distinct custom step used in my routines: name, how many routines and steps use it, measure, per side and its written details. From that screen I can copy the whole list as text to paste into Claude for adding to the catalog, and copy a drawing-request prompt for one custom exercise (using the existing request module and prompt style). Because family and friends have their own copies, the screen also lets me open a backup file they send me and shows the custom exercises found in it, read only, without importing or changing anything on my phone. Regular users still see nothing of Owner mode.

**Blocked by:** 01 (custom steps' written details)

Status: ready-for-agent

- [ ] Drawing import UI, the sanitiser, the local drawing override and their screens are removed; existing databases and backups that contain the old drawing table still open and restore without error (the table may stay in the schema as legacy and is ignored)
- [ ] Owner mode off: nothing owner-related is visible; owner on: Settings shows a "Custom exercises" entry
- [ ] The list groups custom steps by name (case-insensitive), with counts, measure, per-side flag and details
- [ ] "Copy list" puts a readable plain-text summary on the clipboard (with the same fallback as the request module)
- [ ] Per-item "Request drawing" copies a prompt built from the custom exercise's name, details and measure through the request module
- [ ] "Read a backup file" validates the file with the backup module, lists its custom exercises read only, and never touches the local database (tested)
- [ ] Tests: grouping, list text, prompt for a custom exercise, reading a backup without side effects
- [ ] Layout checked headless at 400 px wide in light and dark
- [ ] Build and tests pass
