# 01: Streak and stats engine

**What to build:** The pure logic that turns saved sessions into what History and Home show, with no screens. From a list of sessions (and, later, logged activities) and today's date in the device's local time zone it answers: which days are active, the current streak, the number of routines done in a month and the number of activities in a month, the day-by-day markers for a month, and the most recent category per day for the week strip. A day is active when at least one session with at least one step done started on it. A zero-step session does not count. The streak counts consecutive active days ending today or yesterday, so a rest day in progress does not zero it. Days are grouped by the session's start time in local time, so a late-evening or past-midnight session lands on the right day. Nothing is stored: everything is derived, so deleting a session simply changes the result. The module accepts activities as a second kind of active day from the start so the Log activity slice only has to feed it.

**Blocked by:** None (can start immediately)

Status: done

- [x] Active days computed from sessions in local time; zero-step sessions ignored, partial sessions with at least one step counted
- [x] Current streak: consecutive days ending today or yesterday; broken streak resets; no sessions gives zero
- [x] Month stats: routines this month, activities this month, active days this month
- [x] Month markers: for each day of a given month, which kinds of activity occurred (routine, logged) and the category of the most recent one
- [x] Week strip data: seven days ending today (or the current week) with the category of each day's most recent activity and a today marker
- [x] Tests cover: consecutive days, streak ending yesterday, reset, partial counts, zero-step does not count, a session just before and just after midnight and across a time zone change, a day with several sessions counting once, deleting a session changing the streak
- [x] The functions take plain data and a "today" input, so tests need no clock or storage
- [x] Build and tests pass

Implemented in `app/src/history/streak.ts` (tests in `streak.test.ts`, 37 cases). Pure: plain `DayEntry[]` (sessions and activities) plus a `today` input and an optional IANA time zone (default: device zone, via Intl) so tests are deterministic. Activities count regardless of steps and show as the `'activity'` category.
