Status: in-progress

# Kata — history, calendar and streak

## Problem Statement

I want to see that I'm showing up. Right now, nothing records what I did, so I have no sense of consistency and no streak to protect.

## Solution

Every finished or stopped session is saved automatically. A History tab shows monthly stats, a month calendar with a dot per day for routines, and a recent list. Home shows the week at a glance and the current active-day streak.

## User Stories

1. As a user, I want a completed routine saved to history automatically, so that I never have to log it by hand.
2. As a user, I want a stopped-early routine saved as partial with the percent completed, so that partial effort still counts.
3. As a user, I want each saved session to record the routine, start time, duration, steps done and total, rounds, and completion, so that history is accurate.
4. As a user, I want to rate how a session felt (easy, good, hard) on the completion screen, so that I can see trends.
5. As a user, I want a History tab with stats for routines this month, number of activities and the active-day streak, so that I see progress.
6. As a user, I want a month calendar with a green dot on days with a routine, so that gaps are visible.
7. As a user, I want to move between months, so that I can look back.
8. As a user, I want a recent list showing each session with its routine name and Done or percent status, so that I see what I did.
9. As a user, I want partial sessions labelled as partial, so that I can tell them from finished ones.
10. As a user, I want the streak to count consecutive days (ending today or yesterday) with at least one session, so that a rest-day-in-progress doesn't zero it.
11. As a user, I want any session with at least one step done to count toward the streak, so that short efforts count.
12. As a user, I want Home to show seven day circles for the week filled with the category colour of that day's activity, so that I see the week.
13. As a user, I want today outlined on the week strip, so that I can orient myself.
14. As a user, I want the streak shown on Home, so that I see it daily.
15. As a user, I want the routine card to show "Last: …" from the latest session, so that I know when I last did it.
16. As a user, I want to open a session to see its details, so that I can review it.
17. As a user, I want to delete a mistaken session from history, so that my stats are right.
18. As a user, I want history to be kept with full detail even though only the month view exists now, so that week and year views can be added later.
19. As a user, I want days to be computed in my local time zone, so that late-evening sessions count for the right day.
20. As a user, I want an empty-state message when I have no sessions yet, so that the screen isn't blank.

## Implementation Decisions

- Sessions are stored with full detail: routine reference, started-at timestamp, duration, steps done and total, rounds done, completion flag, percent, and optional feeling. No aggregation is stored; all stats are derived.
- A streak module (pure, no UI) takes the set of active days and today's date in local time and returns the current streak. A day is active if at least one session with at least one step done, or (once that slice exists) at least one logged activity, falls on it.
- Active-day grouping uses the device's local time zone and the session's start time.
- The month calendar and recent list read from the same session store; they do not own data.
- The week strip on Home picks the category colour of the day's most recent activity when several exist.
- Deleting a session is allowed and recalculates derived stats.
- Activities from the Log activity slice plug into the same active-day and calendar logic when that slice is built, shown as a second dot colour.

## Testing Decisions

- Tests assert observable results of the streak and aggregation modules given sessions and a date, not internal structure.
- **Streak and aggregation (data boundary seam):** consecutive days; streak ending yesterday still counts; broken streak resets; partial session counts if at least one step done; zero-step session does not count; late-night sessions across midnight and across a timezone; month stats for routines this month; deleting a session updates the streak.
- Calendar and list screens are verified manually.
- Prior art: the data-boundary test setup from the routines and player slice.

## Out of Scope

- Week and year views (data is ready for them).
- Charts, trends or export of history as its own file (history is part of the full backup).
- Logging activities done outside the app (separate slice).
- Smartwatch import (later phases).

## Further Notes

- Distance and pace stats shown in the design for runs appear only once the Log activity slice exists; until then those tiles can be hidden or show zero.
