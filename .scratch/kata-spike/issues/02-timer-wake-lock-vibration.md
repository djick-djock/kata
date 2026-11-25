# 02: Interval timer that stays awake, stays accurate, and vibrates

**What to build:** On the spike's start screen I press Start and a repeating work and rest interval timer runs for at least 5 minutes (work 20 s, rest 10 s by default, adjustable). It shows a large time remaining and the current phase, in the phase colours (work sage, rest mist blue). The screen stays awake while it runs, including after I switch to another app and come back. The timer is accurate after I leave the app for about 20 seconds and return, because remaining time comes from real elapsed time, never from counting ticks. A vibration plays at each phase change and in each of the last 5 seconds of work, on devices that support it. The screen also reports whether vibration exists, whether the wake lock is currently held, and whether persistent storage was granted (the app requests it at startup).

The timer exposes its schedule as events (phase started, one-second tick with seconds left, phase ended, finished) so the audio ticket can attach cues without touching the timer.

**Blocked by:** 01

Status: done

- [x] Start, pause/resume and stop controls work
- [x] Work and rest durations and number of rounds are adjustable, defaulting to a run of at least 5 minutes
- [x] Remaining time is computed from timestamps; a unit test simulates a large clock jump and checks the remaining time is still correct
- [x] A unit test covers phase sequencing across rounds and the final finish event
- [x] The timer emits events for phase start, per-second tick with seconds remaining, phase end and finish, available to other modules
- [x] Screen wake lock is requested on start and re-requested when the page becomes visible again; failure to acquire it is shown on screen - implemented (src/wake-lock.ts), smoke-tested with a stubbed wakeLock API; real screen-stays-on and app-switch behaviour: device test pending
- [x] Vibration fires at phase changes and on each of the last 5 seconds of work, feature-detected, and the screen shows whether vibration is available - implemented and unit-tested via pattern mapping; smoke-tested with a stubbed navigator.vibrate; real vibration: device test pending
- [x] Persistent storage is requested at startup and the result is shown - implemented; headless Chromium shows 'not granted' (expected); device result pending
- [x] The screen shows current phase, time remaining, round and whether the wake lock is held
- [x] Layout is readable on a phone held at arm's length and at about 400 px wide - checked headless at 400 px wide (no horizontal scroll); arm's-length readability: device test pending
- [x] Build and tests pass
