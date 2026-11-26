# 03: Session engine

**What to build:** The pure session engine behind the player: no screens, audio or storage. Given a routine, user settings and an injected clock, it accepts events (start, pause, resume, skip, previous, reps done, stop) and exposes the current state (phase, current and next step, block, round, step time left, routine time left, progress) and the cues due. A routine is a list of blocks (name, repeat count, warm-up flag), each with steps; a step is a catalog exercise (with optional variant) or a custom step, with a time or reps measure, per-side flag and rest after in seconds. The engine flattens it: expands block repeats, splits per-side steps into left and right with a switch pause between, inserts rests (zero allowed), and marks warm-up steps. A reps step has no countdown and runs until Done, tracking elapsed time. Both modes exist: Play all advances automatically, Step by step waits for me to start each step. Stopping early yields a partial result with percent. Cue rules are data-driven: ticks on the last 5 seconds of work, warm-up and reps-timed steps of 8 seconds or longer; rest ticks only when rest is 30 seconds or longer; a go tone when a step starts after a rest; a softer rest tone when rest begins; meditation steps and the end use a soft bell only. All timing derives from the clock.

**Blocked by:** 01

Status: done

- [x] Flattening: block repeats, per-side splitting with adjustable switch pause (default 5 s), rests including zero, warm-up marking, custom steps; unit-tested - routine.ts flattenRoutine; routine.test.ts
- [x] Reps step runs until Done, tracks elapsed time, Done moves to the following rest - reps item has durationMs null, repsDone moves on, elapsed tracked
- [x] Play all and Step by step behave as described - play-all and step-by-step (first step starts on start(); later steps wait, start()/resume() begins them)
- [x] Pause and resume preserve elapsed time; skip and previous work across steps, rests and block boundaries - pause/resume keep elapsed; skip/previous are step-level and cross rests and blocks
- [x] Early stop gives a partial result with steps done, rounds and percent completed - stop() returns result with stepsDone, roundsDone, elapsedMs, percent
- [x] Cue rules as above, including thresholds of 8 s and 30 s, the go tone, the rest tone, the meditation bell-only rule and the end bell; unit-tested without sound - cue rules in session.ts with tests; extra: go tone also after a switch pause
- [x] A large simulated clock jump (backgrounding) leaves state correct and emits only sensible cues - clock jump tests: latest tick only, stale transition cues dropped (3 s)
- [x] Routine time left and progress per block are correct, including per-side parts - routineRemainingMs and block progress/segments, per-side included
- [x] Types for routine, block and step are exported for use by the builder - exported from src/engine/index.ts
- [x] Build and tests pass - npm test (74 pass) and npm run build pass
