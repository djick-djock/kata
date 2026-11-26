# 01: Log an activity

**What to build:** A Log activity form for things I do outside Kata. I choose a type (Run, Walk, Bike, Swim, Other), the date and start time (past dates allowed), the duration, an optional distance in kilometres, an optional "How did it feel" (same options as routine sessions) and optional notes. Average pace is calculated from duration and distance and shown, and hidden when there is no distance. Validation: duration must be positive, distance must not be negative. The activity is saved locally. Each activity stores a source ("manual" for now) and an optional external identifier, and the model leaves optional unused fields for route and heart-rate data, so later imports need no schema change; pace is derived and never stored. Until History exists, the form opens from a quick "Log activity" link on Home.

**Blocked by:** None (can start immediately)

Status: done

- [x] Activity store with save, get, list (newest first), list by date range and delete; stored fields: type, start timestamp, duration, optional distance, feeling, notes, source, optional external id, and unused optional route and heart-rate fields
- [x] Pace is derived (zero or missing distance gives no pace); unit-tested
- [x] Form with type, date, start time, duration, distance, feeling and notes, matching the design screen
- [x] Validation: positive duration, non-negative distance; errors shown, nothing saved when invalid
- [x] Past dates and times can be chosen; a saved activity round-trips through the store
- [x] A duplicate external id is detected (helper and test), for later imports
- [x] A "Log activity" link on Home opens the form; saving returns to where I came from with a confirmation
- [x] Layout checked headless at 400 px wide in light and dark
- [x] Build and tests pass

Note: store in app/src/data/activities.ts (Dexie v5, table `activities`: id, startedAt, externalId); form app/src/screens/LogActivity.tsx at /log and /log/:id (edit + delete); toast via ui/Toast.tsx (`notify`). Verified headless at 400 px light and dark, persists across reload.
