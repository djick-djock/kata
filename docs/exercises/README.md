# Kata exercise catalog (starter)

84 calisthenics exercises with progression chains and a drawing each. Equipment limited to: bodyweight, pull-up bar (doorframe), parallel bars, resistance bands, one small kettlebell.

| File | What |
|---|---|
| `catalog.json` | Source of truth (array of exercises) |
| `CATALOG.md` | Readable tables by category |
| `drawings/<id>.svg` | One 400x300 SVG per exercise (start/end panels, or a single HOLD panel) |
| `drawings/index.html` | Contact sheet of all drawings (open in a browser) |
| `_generator/` | Python that produced the JSON, MD and SVGs (`python3 build.py`; exercise data in `d_*.py`, pose helpers in `lib.py`). Edit the data, rerun, regenerate everything. |

## Counts

push 20 · pull 14 · legs 17 · core 18 · mobility 9 · full-body 6 (total 84; a bit above the 60-80 target).

## Schema (per exercise)

| Field | Values |
|---|---|
| `id` | kebab-case slug, unique; also the SVG file name |
| `name_en`, `name_fr` | display names (FR names are my own Quebec-neutral renderings, not verified by a native coach) |
| `category` | `push` `pull` `legs` `core` `mobility` `full-body` |
| `movement_pattern` | free text, e.g. `horizontal push`, `hip hinge`, `anti-extension` |
| `primary_muscles[]`, `secondary_muscles[]` | free-text muscle names |
| `equipment[]` | `bodyweight` `pullup-bar` `parallel-bars` `bands` `kettlebell` |
| `difficulty` | 1 to 5 |
| `type` | `reps` `time` `reps-per-side` `time-per-side` |
| `progression` | `{easier: id\|null, harder: id\|null, chain: name}`; ids always resolve |
| `setup`, `steps[]`, `common_mistakes[]`, `tips` | short original wording |
| `drawing` | relative path to the SVG |

Progression chains (ordered easy to hard; `easier`/`harder` derive from this order):
- push-up: wall, incline, knee, standard, wide, diamond, decline, banded, archer, pseudo planche, one-arm
- dip: support hold, band-assisted, negative, parallel-bar dip
- pike-handstand: pike push-up, wall handstand hold, wall handstand push-up
- vertical-pull: dead hang, scapular, band-assisted, negative, chin-up, pull-up, neutral grip, L-sit pull-up, archer
- horizontal-pull: band row, kettlebell row; shoulder-health: pull-apart, face pull
- squat: bodyweight, goblet, split, cossack, assisted pistol, pistol
- glute-bridge, calf, hinge (KB deadlift, single-leg RDL, KB swing), plank (plank, shoulder tap), hanging-core (knee raise, leg raise, toes-to-bar), l-sit (tuck, full), leg-raise (lying, V-up), crunch, hollow (dead bug, hollow hold), back-extension (bird dog, superman), burpee (inchworm, burpee)
- Exercises with `easier`/`harder` null are standalone (no ladder).

## Drawings

Generated side-view (a few front-view) stick figures from a shared skeleton with inverse kinematics, so limbs always have consistent length and joints bend the right way. Same canvas, palette (navy figure, grey far limbs, orange bands/kettlebell, teal movement arrows) and stroke weight. Auto-scaled per exercise, strokes compensated so line weight is uniform. I spot-checked the SVGs visually in a browser (push-ups, dips, pull-ups, squats, bridges, hangs, holds, mobility) and fixed reach/pose errors; poses are *schematic*, not anatomically precise illustrations.

Known drawing limits: side view cannot show hand width (wide/diamond/archer have a caption), rotation (Russian twist, Pallof press, open-book style rotations) or true lateral movement; cat-cow and arm circles are approximations; hands are not drawn (limbs end as lines). A designer pass or real illustrations may replace these later; the `drawing` path is the only coupling.

## Sources and how they were used

Web research was shallow (the search tool returned summaries and aggregator pages, not full articles), so cues are written from established, widely repeated coaching practice and cross-checked only at the level of "do the major sources agree on the progression order and main cues":
- r/bodyweightfitness Recommended Routine and its progression ladders (push-up, pull-up, dip, row, core, warm-up), via mirrors/summaries such as liftosaur and Boostcamp.
- Progressive Calisthenics (Al Kavadlo) blog, for progression philosophy.
- NASM exercise library (band-assisted pull-up setup, common faults) and BarBend (goblet squat) for band/kettlebell items; a Breaking Muscle article for the caveat that bands can hide top-range weakness.
- Remaining cues (L-sit, pistol, leg raise, mobility drills, kettlebell swing) come from standard coaching knowledge, not from a fetched page. All text is paraphrased, no copied prose.

Treat the content as a solid draft to be reviewed, not a medically or coaching-validated reference.

## Open questions and gaps for the grilling/spec session

1. **Chair/step/wall.** Incline push-up, decline push-up, wall push-up, wall handstand and wall sit need a step/chair/wall, which are not in the equipment list. They are tagged `bodyweight`. Add an `environment`/`surface` flag, or drop them?
2. **Parallel-bar pulls.** `neutral-grip-pull-up` assumes a high set of parallel handles; confirm the parallel bars can be used for hanging. Dips/L-sit assume floor-standing bars about hip-to-chest height.
3. **No low bar for inverted rows.** Rows are band and kettlebell only. Can the doorframe bar or parallel bars be set low for body rows? That would add a proper horizontal pull ladder.
4. **Bands.** One band or a set? Resistance levels? Assisted pull-ups and dips need heavier bands; model band strength as data?
5. **Unilateral and per-side.** `reps-per-side` is a type; the app needs a rule for logging each side (one set per side? alternate?).
6. **Data model fit.** Should `difficulty` stay a single 1-5 number, or be tied to the chain position? Keep `movement_pattern` and muscle names as free text, or move to enums?
7. **Localisation.** FR names/cues: only names are translated; steps/tips are English. Do you want full FR text, and what terms (Quebec vs France: "traction", "pompe", "dips")?
8. **Media format.** SVG pairs (start/end) vs animated: if animation is wanted, the generator can output a frame sequence.
9. **Worth adding later:** inverted row, Australian pull-up, front lever tuck, planche lean, muscle-up progression, human flag, dragon flag (needs anchor), Nordic curl (needs anchor), Bulgarian split squat and step-up (need a surface), shrimp squat, hanging windshield wipers, kettlebell Turkish get-up and clean-and-press, band pull-through, bicep curl and triceps extension with bands, wrist and neck prehab, stretching library, tempo/hold-time targets per exercise.
10. **Safety copy.** No medical disclaimers or contraindications included (e.g. wrist-loaded moves, handstand bail-out). Needs product decision.
11. **Metrics.** `time` exercises have no suggested default; do you want target ranges (e.g. 3 x 8-12 reps, 3 x 20-30 s) per difficulty in the data?

Not done: the optional gallery on the Design canvas (step 4) was skipped; the contact sheet covers it and the canvas can be updated later on request.
