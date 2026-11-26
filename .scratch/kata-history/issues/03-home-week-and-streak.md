# 03: Home week strip and streak

**What to build:** Home shows the current week as seven day circles, each filled with the category colour of that day's most recent activity (empty if none) and today outlined, plus the current streak. The pinned routine and Quick start list stay as they are. The routine cards' "Last: …" label keeps reading from the latest session.

**Blocked by:** 01

Status: done

- [x] Seven day circles for the week, with category colours and today outlined, matching the design screen
- [x] Streak shown on Home and equal to the History tab's streak for the same data
- [x] A day with several activities uses the category colour of the most recent one
- [x] No sessions yet: week empty, streak zero, no errors
- [x] Layout checked headless at 400 px wide in light and dark
- [x] Build and tests pass

## Notes

Week runs Mon to Sun (per the design), today outlined, later days empty. Pure helper `app/src/history/home-week.ts` (+ tests) wraps `weekStrip`/`currentStreak`; `useHomeWeek.ts` loads sessions (extend `load()` to merge activities later). Streak text: "N-day streak" or "No streak yet". Checked headless at 400 px, light and dark, with seeded streak, empty and multi-session-day data. The design's "runs count too" caption is left out.
