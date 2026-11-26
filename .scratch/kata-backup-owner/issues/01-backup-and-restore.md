# 01: Backup and restore

**What to build:** In Settings I can export all my data to a single JSON file and restore it. Export saves the file through the phone's share sheet (or a normal download where sharing isn't available), so I choose where it goes. The file carries a format version and an export time and holds every store: routines (including custom steps), sessions, logged activities, settings, my personal exercise video links, and anything else the app keeps in its database, so stores added later are included automatically. Import lets me pick a file, validates it completely before touching anything, warns clearly that it overwrites everything on this device and asks for confirmation, then replaces everything in one transaction. A damaged, truncated or wrong file is rejected with a clear message and my data is left untouched. A backup made by an earlier format version is accepted. Settings shows "Last backup: N days ago" (or "Never"), and a gentle nudge appears in Settings and in History when more than 14 days have passed or no backup has ever been made. Settings also shows whether persistent storage was granted. While here, Settings gains the missing visual pulse on/off switch next to sound and vibration, honoured by the player.

**Blocked by:** None (can start immediately)

Status: ready-for-agent

- [ ] Export produces one JSON document with a format version, an export timestamp and every Dexie table's contents (enumerated from the database, not a hand-kept list)
- [ ] Share sheet is used when available, otherwise a file download; the last-backup time is recorded locally only when export succeeds
- [ ] Import validates the whole document first; a truncated, non-JSON, wrong-shape or future-version file is rejected with a clear message and no data change (tested)
- [ ] Import replaces all stores in one transaction; a failure part-way leaves the old data intact (tested)
- [ ] Confirmation step warns that everything on this device is overwritten before import runs
- [ ] Round trip: export, wipe, import restores every store identically (tested), including sessions, activities, routines with custom steps, settings and exercise links
- [ ] A backup in an earlier format version is accepted (tested with a fixture)
- [ ] "Last backup: N days ago" in Settings; nudge in Settings and History at more than 14 days or never (tested at 13, 14, 15 days and never); the nudge disappears after a backup
- [ ] Persistent storage status (granted or not) is shown in Settings
- [ ] A visual pulse on/off setting exists, persists, is included in backups and is honoured by the player (with sound and vibration off the pulse still works by default)
- [ ] Layout checked headless at 400 px wide in light and dark
- [ ] Build and tests pass
