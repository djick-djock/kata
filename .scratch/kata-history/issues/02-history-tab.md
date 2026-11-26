# 02: History tab

**What to build:** The History tab. It shows monthly stats (routines this month, number of activities, current streak), a month calendar with a green dot on each day that has a routine, previous and next month navigation so I can look back, and a recent list of sessions showing the routine name, date and "Done" or the percent for partial sessions (clearly labelled partial). An empty state appears when there are no sessions yet. Layout follows the design screen. The distance and run tiles from the design stay hidden until the Log activity slice exists. The screen reads sessions from the existing store through the engine from ticket 01 and owns no data.

**Blocked by:** 01

Status: done

- [x] Stats tiles show routines this month, activities this month and the streak, matching the design
- [x] Month calendar with a dot on days with a routine; today is marked; previous and next month work, and future months are not offered beyond the current one
- [x] Recent list shows routine name, date and time, and Done or percent; partial sessions are labelled
- [x] Empty state when there are no sessions
- [x] Days follow local time; a late-evening session appears on the right day (checked with a seeded session)
- [x] Distance and run tiles are not shown yet
- [x] Layout checked headless at 400 px wide in light and dark; matches the design screen
- [x] Build and tests pass

## Notes

Built `screens/History.tsx` + `history.css`, helpers in `history/calendar.ts` (grid, month nav, recent formatting, session to DayEntry mapping, tested). Activities tile counts 0 for now; adding activities is one change in `toEntries`/`useHistoryData`. Partial sessions show the percent plus a small "Partial" label. The "+ Log" header button from the design was not added (Settings stays in the header; Home already links Log). Checked headless at 400 px, light and dark, with seeded sessions (23:50 session lands on its own day, partial, previous month); tests and build pass.

## Notes

- Built and checked headless at 400 px in light and dark (see commit). The "+ Log" header button arrived with log-activity ticket 03; the distance and runs tiles likewise. Device test pending.
