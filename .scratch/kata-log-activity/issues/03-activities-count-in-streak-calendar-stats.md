# 03: Logged activities count toward streak, calendar and stats

**What to build:** A day with a logged activity is an active day: the streak counts it, and a day with both a session and an activity counts once. The History calendar shows a gold dot for logged days (green for routines, both when both). History stats include the number of activities and, now that data exists, distance and total runs tiles. A "+ Log" button in History opens the form. The Home week strip includes logged days. Deleting an activity updates all of these.

**Blocked by:** 02

Status: done

- [x] Streak and active days include activities; a day with a session and an activity counts once (tests)
- [x] Calendar shows gold dots for logged days and both dots when a day has both
- [x] Stats show number of activities, distance and runs this month
- [x] "+ Log" button in History opens the form; the Home quick link still works
- [x] Home week strip colours logged days
- [x] Deleting an activity updates streak, calendar, stats and week strip (tested at the data level)
- [x] Layout checked at 400 px wide in light and dark
- [x] Build and tests pass

## Notes

- `toEntries(sessions, activities)` (calendar.ts) feeds History and `useHomeWeek`; both load from the store on open, so a delete shows up on the next visit.
- History stats: Routines (sessions with steps), Activities (all logged, `monthStats`), Active streak, plus Distance (km, all activity types) and Runs (type 'run') this month via `activityMonthTotals`. Five tiles in two rows instead of the design's three, to cover the ticket.
- Calendar: green dot routine, gold (`--color-category-run`) dot logged, both side by side; small legend under the month title. `+ Log` pill in the History header opens `/log`; the Home quick link is unchanged.
- Home week strip colours logged days gold. Checked at 400 px in light and dark, including delete via the edit form.
