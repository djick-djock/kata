# 06: Home, session complete and settings

**What to build:** Everything around the player. When a session finishes or I stop it early, it is saved (stopped early saves as partial with the percent completed) with date, routine, category, duration, steps done and rounds. A completion screen shows duration, steps done, rounds and an optional "How did it feel" rating. Home shows the pinned routine as one-tap Start and a Quick start list of my other routines. Settings lets me choose the switch pause length for per-side exercises, turn sound and vibration on or off independently, and set the volume; these settings are stored locally and used by the engine and cue output. A Settings screen shows the app version.

**Blocked by:** 05

Status: done

- [x] Finished and early-stopped sessions are written to a sessions store with the fields above; round-trip tested
- [x] Completion screen matches the design and the optional feel rating is saved with the session
- [x] Home shows the pinned routine and a Quick start list; Start opens the player in one tap
- [x] Routine cards show "last done" from the sessions store
- [x] Settings: switch pause, sound on/off, vibration on/off, volume; they persist and take effect in the next session
- [x] Layout matches the design at 400 px wide in both themes
- [x] Build and tests pass

## Notes

- Sessions: Dexie v4 table `sessions` (indexes `id, startedAt, routineId, [routineId+startedAt]`), `src/data/sessions.ts` (saveSession, getSession, setSessionFeel, listSessions, sessionsBetween, sessionsForRoutine, deleteSession). Row has id, startedAt, finishedAt, routineId, routineName, category, mode, durationSeconds, stepsDone/Total, roundsDone/Total, percent, completed, feel?.
- Saved once: Play creates the id, saves, then navigates to /session-complete with `{ sessionId }`; saving an existing id is a no-op, the completion screen only reads. `markRoutineDone` runs on a new save with at least one step done.
- Settings: switch pause stepper (0-60 s), sound and vibration switches, volume slider; changes apply from the next session. The app version comes from package.json via `__APP_VERSION__`. No backup section yet (later slice adds it).
- Home omits the week card and "Log an activity" (other slices).
- Verified headless at 400 px, light and dark: full run, completion, partial (stop early), saved row, Home, "Last: Today", settings persisting across reload, sound off gives no oscillators. Device test pending.
