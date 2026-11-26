Status: done

# Kata v1 — overview, decision log and build order

This is the umbrella document. Each slice below has its own spec in a sibling directory. Read this first, then the slice you are working on.

## Problem Statement

I do workout, stretch, mobility and meditation routines by following a video. I don't like that: sometimes I just want my own music playing and the phone on the floor showing a timer and the current exercise. No existing tool lets me build my own routines once, press play, and have a calm, readable timer with cues that coexist with my music. I also want it to work offline, keep my data on my device, and be shareable with family and friends who each keep their own data.

## Solution

Kata is a personal installable web app (PWA). I build routines out of exercises (blocks, steps, time or reps, rest), press play, and the player runs a full-screen timer with colour-coded phases, sound and vibration cues, and a drawing of the current exercise. Sessions are saved to a history with a month calendar and an active-day streak. Data lives only on the device, with manual backup to a file. The owner (me) has a hidden mode to request new exercise drawings from Claude through a copy-paste flow.

## Decision log (settled in the grilling session)

**Product**
- Screens, navigation, player layout, phase colours and routine templates follow the existing product spec and design system documents. Ask before changing a design decision.
- Home shows one pinned routine plus quick start. No weekly schedule, no reminders in v1.
- A routine stopped early with at least one step done is saved as partial (with percent) and counts as an active day for the streak.
- Exercises measured per side auto-split into left and right with an adjustable switch pause (default 5 seconds).
- History shows the month view only in v1, but every session and activity is stored with full detail so week and year views can be added later without migration.
- Meditation is a category like the others. Breathing exercises live under it.

**Platform and data**
- Installable PWA, hosted on GitHub Pages from a GitHub Actions build. Repository is private for now.
- A device spike comes before the full build. If beeps pause the user's music, try vibration plus a visual cue first; wrap in a native shell only if that is not enough.
- Data is local-only. Manual JSON export, replace-all import with confirmation, and a nudge after 14 days without a backup. Each person gets their own empty copy with the starter library.
- Stack: Vite, React, TypeScript, Dexie over IndexedDB, a PWA plugin for offline, Vitest for tests.
- English only in v1. All exercise text is stored as a per-language map with English fallback so French can be added later without migrating data.

**Content**
- Five fixed categories: Strength, HIIT, Stretch, Mobility, Meditation. Changing the set means changing the code in v1. Push, pull, legs and core become optional tags used for filtering.
- The exercise library is bundled with the app as read-only data (always present, not part of user storage); users cannot add or edit library exercises but can add custom steps inside routines by typing a name and time or reps. Exercises may have variants (pull-up: strict, chin-up, band-assisted). A warm-up tag orders the picker, and routine blocks can be flagged warm-up. The 84-exercise catalog is an archive. The starter library is a shortlist the user validates (see the starter shortlist document in the exercises docs). Starter stretch, mobility and meditation exercises are added.
- Drawings use the current text colour plus accent variables so they work in light and dark themes. Only starter exercises get regenerated drawings.

**Cues**
- Ticks and a short vibration on each of the last 5 seconds of work, warm-up and reps-timed steps that last 8 seconds or longer.
- Rest steps get no ticks unless the rest lasts 30 seconds or longer.
- A distinct "go" tone plus vibration when a step starts after a rest. A softer lower tone when a rest starts.
- Meditation steps and the end of a routine get a soft bell only, no ticks.
- Reps steps have no countdown; the Done button gives a single confirm tone.
- Every cue is toggleable, with a volume setting and optional vibration. No spoken voice in v1.

**Owner mode and requests**
- A hidden Owner mode (unlocked in Settings) adds a "Request drawing" action to exercises. It copies a ready-made prompt to the clipboard; the user pastes it into Claude and imports the returned SVG.
- Requests go through one small reusable module with an app id, request type and payload, with clipboard as the only transport in v1. A Raspberry Pi intake service is a separate future project, out of scope here.

## Build order (slices)

1. **Spike** — prove audio, screen-awake, vibration and timer accuracy on the user's Android phone. Pass or fail gates everything else.
2. **Routines and player** — starter library, routine builder, session engine, player. This is the heart of the app.
3. **History** — saved sessions, month calendar, streak.
4. **Backup and Owner mode** — settings, export and import, backup nudge, Owner mode and request module.
5. **Log activity** — manual logging of runs and other activities. May slip to v1.1.

Each slice is its own spec in the sibling directories named after it.

## Later phases (not v1, recorded so the data model is ready)

- **Phase 2 — file import of watch data:** import GPX, TCX or FIT files exported from Strava or Huawei Health as logged activities, parsed on the device.
- **Phase 3 — automatic sync:** pull new runs from Strava through the future Raspberry Pi service, because Strava's sign-in step needs a server-held secret. Huawei Health already pushes to Strava, so Strava is the single source. A direct Huawei Health Kit integration needs per-app verification by Huawei and is not planned.
- Whether phases 2 and 3 are one phase or two is decided at that time, after a spike on what is possible.
- Other later items: week and year history views, French UI, user-defined categories, Capacitor wrapper if the spike requires it, Pi request service.

## Test seams

- **Seam A — session engine:** a pure module with no UI, audio or storage dependencies. Routine, settings and an injected clock go in; events (start, pause, resume, skip, previous, reps done, stop) go in; current state and cues to fire come out. Primary seam; most behaviour rules are tested here.
- **Seam B — data boundary:** saving and loading routines, exercises, sessions and activities, plus export and import, tested against an in-memory IndexedDB. Covers streak calculation, backup round-trip, and language fallback.
- Screens are verified manually on the device in v1.

## Further Notes

- Vocabulary: Exercise, Routine, Block, Step, Session, Activity, Category, Cue, Phase. Use these terms consistently.
- Parked idea: a Raspberry Pi service that accepts requests tagged with an app id, reusable across the user's other small apps. Recorded in project memory.
