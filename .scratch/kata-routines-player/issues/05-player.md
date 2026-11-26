# 05: Player

**What to build:** The player. From a routine's Play button I choose Play all or Step by step and the screen takes the phase colour (warm-up sand, work sage, rest mist blue, reps and paused dark, same in light and dark themes). It shows a large ring timer that empties as the step runs, the current exercise drawing and name (with "Up next" during rest), the block name and round (for example "Block A, Round 1 of 2"), the time left for the whole routine, a progress strip with one segment per step in the block, and a Next card. Pause or play, previous and skip controls work. A reps step shows the rep count, elapsed time and a big Done button instead of a countdown. Cues use the engine: synthesized tones, vibration and a visual pulse, honouring sound, vibration and volume settings (defaults on; the settings screen arrives in ticket 06). The screen stays awake during the session. My music in another app keeps playing, and the timer stays correct after I briefly leave the app and return. It all works offline.

**Blocked by:** 03, 04

Status: done

- [x] Both modes work end to end on a real routine, including a per-side step, a reps step, a rest and a repeated block
- [x] Phase colours, ring timer, drawing, Up next, block and round, routine time left, progress strip and Next card match the design screens (work, rest, reps) at 400 px wide
- [x] Pause, resume, previous and skip work; Done on a reps step starts the following rest
- [x] Cues are generated through the engine's cue list and played with the audio clock; sound off keeps vibration and the visual pulse; the pulse also works with reduced motion
- [x] Wake lock is requested at start and re-acquired when the page becomes visible
- [x] Remaining time is correct after the page is hidden and shown again (headless test with a simulated clock jump)
- [x] Player works offline (verified headless)
- [x] Meditation steps and the end use only the soft bell
- [x] Device test pending items are listed in the ticket (audio over music, vibration, screen on)
- [x] Build and tests pass

## Notes

Built: `app/src/player` (pure `logic.ts` + tests, `PlayerRun.tsx`, `player.css`), `app/src/screens/Play.tsx` (ready screen with mode choice, defaults from `?mode=step`; its Start tap creates and unlocks the AudioContext), `app/src/data/settings.ts` (sound, vibration, volume, switchPauseSeconds in the Dexie settings table, defaults on/on/0.7/5, `useSettings` hook; ticket 06 adds the UI), placeholder `screens/SessionComplete.tsx` at `/session-complete`.

Seam for 06: `PlayerRun` calls `onFinished({ result, routineId, routineName, mode })` once on finish or early stop; `Play` navigates to `/session-complete` with that object as router state. 06 should replace `SessionComplete`, save the session, and call `markRoutineDone`.

Verified headless (Chromium, 400 px wide, Playwright fake clock): Play all and Step by step over a routine with warm-up block, per-side step (with switch pause), reps step with Done, rests and a repeated block, ending at `/session-complete`; stubbed `navigator.vibrate` (go, rest, bell, last-5-s ticks), oscillator frequencies for each cue, AudioContext created only after Start (0 before, 1 after), wake lock requested at start and re-requested after hide/show; time correct after a 2 s hidden clock jump; pause holds time; previous, skip, stop-with-confirm (partial result); pulse also under reduced motion; works offline (service worker active, offline reload of /play and a running session). Screens compared with 07, 08, 09. Progress strip shows the current block's steps for one round.

Device test pending: audio over music playing in another app, real vibration, screen staying awake, timing after leaving the app on the phone, iOS audio unlock, colours on a real display.
