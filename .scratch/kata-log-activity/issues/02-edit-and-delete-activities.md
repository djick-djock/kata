# 02: Edit and delete logged activities

**What to build:** Logged activities appear in the History recent list alongside routine sessions, in one chronological list, each marked "Logged" and showing type, duration, distance and pace. I can open one to edit any field with the same validation as the form, or delete it after confirmation.

**Blocked by:** 01, History 04 (session details and delete)

Status: ready-for-agent

- [ ] Recent list shows activities and sessions together in time order; activities are marked "Logged"
- [ ] Opening an activity shows its details and lets me edit it with the same validation
- [ ] Delete asks for confirmation and removes the activity
- [ ] Editing or deleting keeps the list order correct
- [ ] Layout checked at 400 px wide in light and dark
- [ ] Build and tests pass

Note: `recentItems` (app/src/history/calendar.ts) now merges sessions and activities, newest first, with a `kind` and a `to` link; activity rows show "Type · km", duration and pace, gold run dot, "Logged" status. Rows open the existing /log/:id form (edit and confirmed delete); saving or deleting returns to History, which reloads. Checked at 400 px light and dark with seeded data. Streak, calendar dots, stats and the activities tile are untouched (ticket 03).
