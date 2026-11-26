# 06: Home, session complete and settings

**What to build:** Everything around the player. When a session finishes or I stop it early, it is saved (stopped early saves as partial with the percent completed) with date, routine, category, duration, steps done and rounds. A completion screen shows duration, steps done, rounds and an optional "How did it feel" rating. Home shows the pinned routine as one-tap Start and a Quick start list of my other routines. Settings lets me choose the switch pause length for per-side exercises, turn sound and vibration on or off independently, and set the volume; these settings are stored locally and used by the engine and cue output. A Settings screen shows the app version.

**Blocked by:** 05

Status: ready-for-agent

- [ ] Finished and early-stopped sessions are written to a sessions store with the fields above; round-trip tested
- [ ] Completion screen matches the design and the optional feel rating is saved with the session
- [ ] Home shows the pinned routine and a Quick start list; Start opens the player in one tap
- [ ] Routine cards show "last done" from the sessions store
- [ ] Settings: switch pause, sound on/off, vibration on/off, volume; they persist and take effect in the next session
- [ ] Layout matches the design at 400 px wide in both themes
- [ ] Build and tests pass
