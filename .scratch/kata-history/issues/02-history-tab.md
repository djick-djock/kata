# 02: History tab

**What to build:** The History tab. It shows monthly stats (routines this month, number of activities, current streak), a month calendar with a green dot on each day that has a routine, previous and next month navigation so I can look back, and a recent list of sessions showing the routine name, date and "Done" or the percent for partial sessions (clearly labelled partial). An empty state appears when there are no sessions yet. Layout follows the design screen. The distance and run tiles from the design stay hidden until the Log activity slice exists. The screen reads sessions from the existing store through the engine from ticket 01 and owns no data.

**Blocked by:** 01

Status: ready-for-agent

- [ ] Stats tiles show routines this month, activities this month and the streak, matching the design
- [ ] Month calendar with a dot on days with a routine; today is marked; previous and next month work, and future months are not offered beyond the current one
- [ ] Recent list shows routine name, date and time, and Done or percent; partial sessions are labelled
- [ ] Empty state when there are no sessions
- [ ] Days follow local time; a late-evening session appears on the right day (checked with a seeded session)
- [ ] Distance and run tiles are not shown yet
- [ ] Layout checked headless at 400 px wide in light and dark; matches the design screen
- [ ] Build and tests pass
