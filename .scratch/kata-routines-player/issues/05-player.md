# 05: Player

**What to build:** The player. From a routine's Play button I choose Play all or Step by step and the screen takes the phase colour (warm-up sand, work sage, rest mist blue, reps and paused dark, same in light and dark themes). It shows a large ring timer that empties as the step runs, the current exercise drawing and name (with "Up next" during rest), the block name and round (for example "Block A, Round 1 of 2"), the time left for the whole routine, a progress strip with one segment per step in the block, and a Next card. Pause or play, previous and skip controls work. A reps step shows the rep count, elapsed time and a big Done button instead of a countdown. Cues use the engine: synthesized tones, vibration and a visual pulse, honouring sound, vibration and volume settings (defaults on; the settings screen arrives in ticket 06). The screen stays awake during the session. My music in another app keeps playing, and the timer stays correct after I briefly leave the app and return. It all works offline.

**Blocked by:** 03, 04

Status: ready-for-agent

- [ ] Both modes work end to end on a real routine, including a per-side step, a reps step, a rest and a repeated block
- [ ] Phase colours, ring timer, drawing, Up next, block and round, routine time left, progress strip and Next card match the design screens (work, rest, reps) at 400 px wide
- [ ] Pause, resume, previous and skip work; Done on a reps step starts the following rest
- [ ] Cues are generated through the engine's cue list and played with the audio clock; sound off keeps vibration and the visual pulse; the pulse also works with reduced motion
- [ ] Wake lock is requested at start and re-acquired when the page becomes visible
- [ ] Remaining time is correct after the page is hidden and shown again (headless test with a simulated clock jump)
- [ ] Player works offline (verified headless)
- [ ] Meditation steps and the end use only the soft bell
- [ ] Device test pending items are listed in the ticket (audio over music, vibration, screen on)
- [ ] Build and tests pass
