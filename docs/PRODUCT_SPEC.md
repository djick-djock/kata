# Kata — Product spec

Personal app to **build workout routines and press play**. The phone sits on the floor and shows a big, calm timer while music or a TV plays — no need to follow a video.

Covers HIIT, strength, stretching, mobility and yoga. Language: English first (French/Spanish later as a setting).

Screens referenced below are in `design/screens/`.

---

## 1. Navigation

Bottom tab bar with 4 tabs: **Home · Routines · Exercises · History**.

Pushed screens (no tab bar): Routine builder, Exercise detail, New routine sheet, Player, Session complete, Log activity.

## 2. Home — `01-home.png`

- Logo + "Kata", date, greeting.
- **This week**: 7 day circles (Mon–Sun), filled with the category colour of the day's activity; today is outlined. Shows the active-day streak.
- **Pinned routine** card (sage background) with a Play button → starts the player directly.
- **Quick start**: horizontal list of other routines.
- **Log an activity** → Log activity screen.

## 3. Routines — `02-routines.png`, `03-new-routine.png`, `04-routine-builder.png`

### List
- Search, category filter chips, routine cards (drawing, name, category, length, "Last: …", Play button).
- Tapping the card opens the builder; the Play button starts the player.

### New routine (bottom sheet)
Three ways to start:
1. **Start blank**
2. **From a template** — timing pre-set, user picks the exercises:
   - Intervals: 45 s work / 15 s rest, ×2
   - Tabata: 20 s / 10 s, ×8
   - Stretch flow: 30 s each, no rest
3. **Copy an existing routine** — edits the copy, original untouched.

### Builder
- Header: category, name, total duration (estimated with `~` when the routine contains reps steps).
- A routine is a list of **blocks**. Each block has a name and a **repeat count** (×1, ×2…).
- A **warm-up is just a block** with rest = 0 (shown with the warm-up colour bar).
- Each **step** = an exercise + a measure:
  - **Time** (e.g. 45 s) — sage pill
  - **Reps** (e.g. ×20) — same pill
  - **Rest after** in seconds (blue outline pill), 0 allowed.
- Steps are reorderable (drag handle). Blocks collapse.
- Bottom actions: **Step by step** and **Play all**.

## 4. Exercises — `05-exercise-library.png`, `06-exercise-detail.png`

- Library: search, category chips, 2-column grid of drawings.
- Detail:
  - Illustration (line drawing by default; user can replace with their own photo/GIF)
  - Name, categories (multiple allowed), default measure (e.g. "30 s / side")
  - **How to** (numbered steps), **Tips**
  - **Video link** (Instagram / YouTube URL, opened externally)
  - "Add to a routine"
- Use case: see a stretch on Instagram → create the exercise, paste the link, add it to a short morning routine.

## 5. Player — `07-player-work.png`, `08-player-rest.png`, `09-player-reps.png`

Two modes:
- **Play all**: auto-advances through every step with timers.
- **Step by step**: the user starts each step manually.

In both modes a **reps step has no countdown**: it shows the rep count, an elapsed time, and a big **Done** button that starts the following rest.

Layout (top → bottom):
1. Close (×), "Block A · Round 1 of 2", time left for the whole routine.
2. **Block progress segments** — one thin segment per step (done / current / upcoming).
3. **Drawing** of the current exercise (static).
4. Phase label (Work / Rest · breathe / Reps · your pace) and exercise name. During rest: "Up next: …".
5. **Timer inside a ring** — the ring empties as the current step runs; "of 0:45" below.
6. **Next** card.
7. Controls: previous · pause/play (large) · skip.

**Full-screen phase colour**: warm-up = sand, work = sage, rest = mist blue, reps/ready/paused = dark. These colours are final — keep them in both themes.

Requirements: keep the screen awake, work while music/video plays in another app, large type readable from the floor.

## 6. Session complete — `10-session-complete.png`

Shown when a routine ends. Automatically **saved to history**: routine, date/time, duration, steps done / total, rounds. Optional "How did it feel?" (Easy / Good / Hard). Buttons: See history, Back to routine.

If a routine is stopped early, it is saved with the percentage completed.

## 7. History — `11-history.png`

- Header with **+ Log** button.
- Stats: routines this month, runs (count · km), **active-day streak**.
- Month calendar: one dot for routines (green), one for logged activities (gold).
- Recent list: routines (Done / %) and logged activities (Logged).

**Streak rule (decided):** any active day counts — a played routine **or** a manually logged activity.

## 8. Log activity — `12-log-activity.png`

For activities done outside the app (running, etc.):
- Type: Run, Walk, Bike, Swim, Other
- Date, start time, duration, distance (km)
- **Average pace calculated automatically** (duration ÷ distance)
- How did it feel (optional), notes (optional)
- Save to history.
- Smartwatch import: **later**, not in v1.

## 9. Suggested data model (stack-agnostic)

```js
Exercise   { id, name, categories: [categoryId], defaultMeasure: { type: 'time'|'reps', value },
             perSide: bool, howTo: [string], tips: string, videoUrl?, illustration: 'drawingKey' | mediaUri }
Category   { id, name, color }           // user-defined; starter set: Strength, HIIT, Stretch, Mobility
Routine    { id, name, categoryId, pinned: bool, blocks: [Block], createdFrom?: 'blank'|'template'|routineId }
Block      { id, name, repeat: int, isWarmup: bool, steps: [Step] }
Step       { id, exerciseId, measure: { type: 'time'|'reps', value }, restAfterSec: int }
Session    { id, routineId, startedAt, durationSec, stepsDone, stepsTotal, roundsDone,
             completed: bool, percent, feeling?: 'easy'|'good'|'hard' }
Activity   { id, type: 'run'|'walk'|'bike'|'swim'|'other', startedAt, durationSec, distanceKm?,
             feeling?, notes? }            // pace is derived, not stored
```

Streak = number of consecutive days (ending today or yesterday) with at least one Session or Activity.

## 10. Open questions (to settle in the grill session)

- Home: one pinned routine, or a weekly schedule (e.g. stretch every morning, HIIT Mon/Wed/Fri)?
- Does a routine stopped early count as an active day / toward stats?
- History views: add week and year views in addition to month?
- Sound / voice / vibration cues for "3-2-1", phase changes and end of routine?
- Should "per side" exercises auto-split into left/right with a short switch beep?
- Where the data lives (local-only, offline-first, sync/backup?) and target platform.
