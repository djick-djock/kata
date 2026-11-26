Status: ready-for-agent
Blocked by: kata-spike passing

# Kata — routines, exercises and player

## Problem Statement

I want to build a routine once (a list of exercises with timings), then press play and have the phone guide me with a big readable timer, the current exercise drawing, and clear cues, while my own music plays. Today I follow a video, which I can't customise and which forces its own audio.

## Solution

An exercise library with drawings, a routine builder (blocks, steps, time or reps, rest, repeat), templates for common patterns, and a player with two modes (play all, step by step). The player shows a colour-coded full-screen phase, a ring timer, the next exercise, and fires sound and vibration cues. Everything works offline.

## User Stories

1. As a user, I want to browse a library of exercises with drawings in a two-column grid, so that I can find what I want visually.
2. As a user, I want to search exercises by name, so that I can find one quickly.
3. As a user, I want to filter exercises by category, so that I see only stretches or only strength.
4. As a user, I want to filter exercises by tag (push, pull, legs, core), so that I can narrow strength work.
5. As a user, I want to open an exercise to see its drawing, name, categories, default measure, how-to steps and tips, so that I do it correctly.
6. As a user, I want to see an exercise's default measure including "per side", so that I know what to expect.
7. As a user, I want to attach a video link (Instagram or YouTube) to an exercise and open it externally, so that I can keep a reference demo.
8. As a user, I want to add a custom step to a routine by typing a name and a time or reps value (and optionally per side), so that I can include something that is not in the exercise library without editing the library.
9. As a user, I want an exercise with variants (for example pull-up: strict, chin-up, band-assisted; squat: bodyweight, goblet with kettlebell) to ask me which variant when I add it to a routine, so that one exercise covers its versions and the library stays short.
10. As a user, I want exercises and custom steps without a drawing to show a clean placeholder, so that every step still looks right.
11. As a user, I want exercises suited to warming up (for example jumping jack, mountain climber, high knees) to be offered first when I add a step to a warm-up block, so that building a warm-up is quick while any exercise can still be chosen.
12. As a user, I want to add an exercise to a routine from its detail screen, so that the flow from "I found a stretch" to "it is in my morning routine" is short.
13. As a user, I want a list of my routines with search and category filter, so that I find the right one.
14. As a user, I want each routine card to show its drawing, name, category, total length and when I last did it, so that I can choose at a glance.
15. As a user, I want to start a routine straight from its card with a Play button, so that starting is one tap.
16. As a user, I want to create a routine from blank, from a template, or by copying an existing routine, so that I rarely start from nothing.
17. As a user, I want templates for Intervals (45 s work, 15 s rest, 2 rounds), Tabata (20 s, 10 s, 8 rounds) and Stretch flow (30 s each, no rest), so that timing is pre-set and I only pick exercises.
18. As a user, I want copying a routine to leave the original untouched, so that I can safely experiment.
19. As a user, I want a routine to be a list of blocks each with a name and repeat count, so that I can express rounds.
20. As a user, I want a block to be marked as warm-up with no rest, so that warm-ups are visually distinct.
21. As a user, I want each step to be an exercise plus either a time or a reps measure plus a rest after in seconds (zero allowed), so that I control pacing.
22. As a user, I want to reorder steps by dragging, so that I can rearrange easily.
23. As a user, I want to collapse blocks, so that long routines stay readable.
24. As a user, I want the routine header to show total duration with an approximate mark when reps steps are present, so that I know how long it will take.
25. As a user, I want to pin one routine to Home, so that my most-used routine is one tap away.
26. As a user, I want a Quick start list of other routines on Home, so that I can start any routine from Home.
27. As a user, I want Play all mode to advance automatically through every step, so that I can leave the phone on the floor.
28. As a user, I want Step by step mode where I start each step myself, so that I can go at my own pace when needed.
29. As a user, I want a reps step to show the rep count, elapsed time and a big Done button instead of a countdown, so that I'm not rushed.
30. As a user, I want pressing Done on a reps step to start the following rest, so that the flow continues.
31. As a user, I want per-side exercises to split into a left and a right part automatically with a short switch pause, so that I set the time once.
32. As a user, I want to change the switch pause length in settings, so that it matches how long I need.
33. As a user, I want the player to show block name and round (for example "Block A, Round 1 of 2") and time left for the whole routine, so that I know where I am.
34. As a user, I want a progress strip with one segment per step in the block, so that I see done, current and upcoming steps.
35. As a user, I want the current exercise's drawing and name, with "Up next" during rest, so that I can prepare.
36. As a user, I want a large ring timer that empties as the step runs, readable from the floor, so that I can check at a glance.
37. As a user, I want a Next card, so that I always know what is coming.
38. As a user, I want pause or play, previous and skip controls, so that I can adapt mid-session.
39. As a user, I want the whole screen to take the phase colour (warm-up sand, work sage, rest mist blue, reps and paused dark), so that I can tell the phase from across the room.
40. As a user, I want the screen to stay awake during the session, so that the timer remains visible.
41. As a user, I want beeps and vibration in the last 5 seconds of work, warm-up and reps-timed steps of 8 seconds or longer, so that I know the step is ending.
42. As a user, I want no ticks during rest unless the rest is 30 seconds or longer, so that rests stay calm.
43. As a user, I want a distinct go tone and vibration when a step starts after a rest, so that I know it began without looking.
44. As a user, I want a softer lower tone when a rest begins, so that I know to breathe.
45. As a user, I want meditation steps and the end of a routine to use only a soft bell, so that they feel calm.
46. As a user, I want to turn sound off and keep vibration, or the reverse, and set volume, so that cues suit the situation.
47. As a user, I want a visual pulse on each cue, so that I get the cue even with sound and vibration off.
48. As a user, I want my music in another app to keep playing during a session, so that the app does not hijack my audio.
49. As a user, I want the timer to stay accurate if I briefly leave the app and come back, so that a music change doesn't ruin the session.
50. As a user, I want a session to end with a completion screen showing duration, steps done, rounds and an optional "How did it feel", so that I get a sense of closure.
51. As a user, I want stopping early to save the session as partial with the percent completed, so that effort is still recorded.
52. As a user, I want the app to work fully offline after install, so that I can use it anywhere.
53. As a user, I want the interface in light and dark themes with the phase colours unchanged, so that it suits my environment.

## Implementation Decisions

- **Session engine** (new deep module, no UI, audio or storage dependencies): takes a routine, user settings and an injected clock; accepts events (start, pause, resume, skip, previous, reps done, stop); exposes current state (phase, current and next step, block, round, step time left, routine time left, progress) and the list of cues due. All timing is derived from the clock, never from tick counting, so it stays correct after the app is backgrounded.
- The engine flattens a routine into an ordered list of runnable steps: expands block repeats, splits per-side steps into left and right with a switch pause between, inserts rests after steps, and marks warm-up steps.
- A reps step has no countdown. It runs until a Done event, tracking elapsed time. Done moves to the following rest.
- Cue rules (ticks on the last 5 seconds of eligible steps, thresholds of 8 s for steps and 30 s for rests, go and rest tones, meditation bell only, end-of-routine bell) live in the engine as data-driven rules, so they can be tested without sound.
- **Cue output** (separate thin module): turns engine cues into synthesized tones, vibration and a visual pulse according to user toggles and volume. Tones are generated, not audio files.
- **Wake lock** handled in a small helper that requests on session start and re-acquires on returning to the app.
- **Exercise catalog**: the library ships inside the app as read-only data and is always present, even if the browser cache or site data is cleared. Users cannot add, edit, hide or delete library exercises. Exercises carry: id, per-language name, how-to and tips maps with English fallback, one category (from the fixed set of five), optional tags (push, pull, legs, core, and a warm-up suitability tag; cool-down likewise), default measure (time or reps), per-side flag, an optional list of variants, and a drawing reference. A variant has a label, an optional note (for example "kettlebell") and optionally its own drawing, otherwise it uses the parent drawing; history counts the parent exercise.
- **Routine store**: Dexie-backed repositories for routines, sessions and settings, plus a small per-user table for personal additions to catalog exercises (such as the video link). Nothing from the catalog is copied into user storage.
- Categories are a fixed set of five defined in code, each with a colour used for week circles and cards. Changing them requires a code change in v1.
- Routine model: routine with category and pinned flag, blocks (name, repeat count, warm-up flag, which also serves as the Warm-up section), steps. A step is either a catalog exercise (with a chosen variant if it has any) or a custom step (typed name, no drawing, no category of its own), plus measure type and value, per-side flag and rest after seconds. The block warm-up flag and the exercise warm-up tag are separate: the flag changes how the block plays, the tag only orders the picker.
- The catalog is the validated starter shortlist. Because it is app data and not user data, updating the app updates the library for everyone; routines reference catalog exercises by stable id, and removing a catalog exercise in a later version must be handled (the step falls back to a custom step with its saved name).
- The routine templates are pre-set timing patterns that create a routine with empty step slots for the user to fill.
- Drawings use the current text colour plus accent variables so they work in both themes.
- The UI follows the existing design system, screens and tokens. Navigation is a four-tab bottom bar (Home, Routines, Exercises, History) with pushed screens for builder, exercise detail, new routine sheet, player and session complete.
- Saving a session writes to the sessions store; the history slice reads from it.

## Testing Decisions

- A good test drives the engine through public events with a fake clock and asserts on observable state and cues, never on internal structure.
- **Session engine (primary seam):** flattening of blocks and repeats; per-side splitting and switch pause; reps step with Done; rest after each step including zero rest; warm-up handling; pause and resume preserving elapsed time; skip and previous; early stop producing a partial result with percent; tick thresholds (8 s step minimum, 30 s rest minimum); go tone after rest; meditation bell-only rule; accuracy after a large clock jump (simulated backgrounding).
- **Data boundary (secondary seam):** routine save and load, copy routine leaves original unchanged, catalog available with empty storage, routine with a custom step plays and saves, variant choice stored and counted under the parent exercise, step referencing a removed catalog id falls back to its saved name, language fallback to English.
- Screens are checked manually on the device against the design screenshots.
- Prior art: none yet; these tests establish the pattern for later slices.

## Out of Scope

- History, calendar and streak (separate slice), though this slice writes sessions.
- Backup and Owner mode.
- Logging non-routine activities.
- Weekly schedules and reminders.
- Spoken voice cues.
- User-defined categories.
- French UI (data model is ready, UI is English only).

## Further Notes

- The spike result may change how cues are delivered; read the spike results note before implementing cue output.
- Exercises with unusual equipment needs (chair, wall, step) are tagged but not filtered by environment in v1.
