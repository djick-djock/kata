Status: in-progress

# Kata — log activity

## Problem Statement

I also run, walk and bike outside the app. Those days are active days too, and they break my streak if Kata doesn't know about them.

## Solution

A Log activity form to record activities done outside Kata: type, date, start time, duration, distance, feeling and notes, with average pace computed automatically. Logged activities count toward the streak and appear in the calendar and recent list.

## User Stories

1. As a user, I want a "+ Log" button in History, so that I can log an outside activity.
2. As a user, I want to choose a type (Run, Walk, Bike, Swim, Other), so that the log is meaningful.
3. As a user, I want to set the date and start time, so that I can log past activities.
4. As a user, I want to enter the duration, so that effort is recorded.
5. As a user, I want to enter the distance in kilometres, so that I track runs.
6. As a user, I want average pace calculated automatically from duration and distance, so that I don't compute it.
7. As a user, I want pace hidden when no distance is entered, so that I don't see nonsense.
8. As a user, I want an optional "How did it feel", so that logs match routine sessions.
9. As a user, I want optional notes, so that I can add context.
10. As a user, I want a logged activity to count as an active day for the streak, so that running days count.
11. As a user, I want logged activities shown with a gold dot on the calendar, so that I can tell them from routines.
12. As a user, I want logged activities in the recent list marked as Logged, so that they are distinguishable.
13. As a user, I want distance and total runs reflected in the History stats, so that I see running totals.
14. As a user, I want to edit or delete a logged activity, so that I can fix mistakes.
15. As a user, I want validation on the form (positive duration, non-negative distance), so that bad data isn't saved.
16. As a user, I want a quick way to log from Home, so that logging takes seconds.
17. As a developer, I want each activity to store a source (manual for now) and an optional external id, so that later file or Strava import can avoid duplicates.
18. As a developer, I want the activity model to leave room for route and heart-rate data, so that later phases don't need a migration.

## Implementation Decisions

- Activity records hold type, start timestamp, duration, optional distance, optional feeling, optional notes, a source (manual in this slice) and an optional external identifier. Pace is derived, never stored.
- The streak module from the history slice is extended so a day with a logged activity counts as active.
- The calendar and recent list read activities and sessions from their stores and present both kinds in one chronological list with different markers.
- Distance units are kilometres in v1.
- The data model leaves optional, unused fields for route and heart-rate samples so that phase 2 and 3 imports can fill them without a schema change.

## Testing Decisions

- Tests assert on observable results of derived values and streak logic.
- **Data boundary seam:** pace calculation including zero distance; activity-only days count toward the streak; a day with both a session and an activity counts once; deleting an activity updates stats; duplicate external ids are detected.
- Form and calendar markers are verified manually.
- Prior art: streak and aggregation tests from the history slice.

## Out of Scope

- Smartwatch import: GPX, TCX or FIT file import (phase 2) and automatic Strava sync (phase 3).
- Maps, routes, heart-rate or elevation display.
- Units other than kilometres.
- Goals or training plans.

## Further Notes

- This slice may slip to v1.1 if the earlier slices take longer than expected.
- Phase 2 and 3 are planned separately after a spike on what is possible; do not start them here.
