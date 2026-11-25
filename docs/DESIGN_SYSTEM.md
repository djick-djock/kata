# Kata — Design system (v1)

**Mood:** calm, light, zen — suits yoga and stretching as much as HIIT. Soft colours, thin strokes, rounded corners, generous space. The player is the exception: full-screen colour and huge numbers, readable from the floor.

Machine-readable values: `design/tokens.json` and `design/tokens.css`. Visual references: `design/foundations.png`, `design/components.png`, `design/illustrations.png`, `design/screens/*.png`.

> The PNG screens are the source of truth for layout. Where a PNG and this file disagree, ask.

---

## 1. Colour

### App (light theme — chosen)
| Token | Hex | Use |
|---|---|---|
| `bg` | `#F5F3EE` | Screen background (warm off-white) |
| `surface` | `#FFFFFF` | Cards, fields, tab bar |
| `surfaceRaised` | `#ECE9E2` | Thumbnails, secondary buttons, info rows |
| `line` | `#DDD9D0` | Borders, dividers |
| `text` | `#1F2422` | Primary text; selected chip background |
| `textMuted` | `#5F6863` | Secondary text, inactive tabs |
| `textFaint` | `#A3A9A5` | Drag handles, decoration only (not for text) |
| `accent` | `#A9C8A0` | **Sage** — primary buttons, work pills, pinned card (always with `ink` text) |
| `accentText` | `#4F7A47` | Green text/icons on light (links, "Save", active tab) |
| `accentPale` | `#E3EEDF` | Logo ground, subtle green fills |
| `restText` | `#3F6C93` | Rest pill outline + text on light |
| `danger` | `#B5503F` | Destructive text ("Delete routine") |
| `warningText` | `#8A5F1A` | Partial session % |

Rule: soft pastel colours (`accent`, phases, categories) are **fills only**. On light backgrounds, text and icons use the darker `accentText` / `restText` versions to stay readable (WCAG AA).

### Player phases (final — same in any theme)
| Phase | Background | Text |
|---|---|---|
| Warm-up | `#E6C79C` sand | `#161A1A` |
| Work | `#A9C8A0` sage | `#161A1A` |
| Rest | `#A3BFD9` mist blue | `#161A1A` |
| Reps / ready / paused | `#272D2B` dark | `#EEF0EC`, accent `#A9C8A0` |

Translucent panels on phase screens: `rgba(255,255,255,0.28)`. Secondary text on phases: `rgba(22,26,26,0.72)`. Ring track: `rgba(22,26,26,0.16)`.

### Categories (user-defined; starter palette)
Strength `#E3A786` · HIIT `#D9A0B8` · Stretch `#B8AEDD` · Mobility `#8FCBC0` · Run `#E3C26F` · Warm-up `#E6C79C`.
Shown as 7–8 px dots next to labels, never as text colour. Illustrations in lists use the darker tint in `tokens.json → color.illustration`.

## 2. Typography

- **Outfit** (Google Fonts) — numbers, timers, headings, card titles. Weights 500/600.
- **Inter** — all UI text. Weights 400/500/600.
- Timers always `font-variant-numeric: tabular-nums`.

| Style | Size / weight |
|---|---|
| Timer (reps screen, no ring) | Outfit 150 / 500, letter-spacing −0.04em |
| Timer in ring | Outfit 96 / 500 |
| Screen title | Outfit 32 / 600 |
| Exercise name on player | Outfit 34 / 600 |
| Card title | Outfit 17–22 / 600 or Inter 16 / 600 |
| Body | Inter 15–16 / 400–500 |
| Small / meta | Inter 13–14 / 400–500, `textMuted` |
| Section label | Inter 13 / 600, uppercase, +0.08em, `textMuted` |

Phase labels are sentence case ("Work", "Rest · breathe"), not all-caps.

## 3. Space, shape, touch

- Spacing scale: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48. Screen side padding 20.
- Radius: chip 8–10 · field 14 · card 20 · bottom sheet 28 · pills/round buttons full.
- Touch targets ≥ 48 px; player controls 64 px, main play/pause 84 px; "Done" button 72 px tall.
- Icons: line icons, 1.8 px stroke, round caps (outline style, no fills except play/pause glyphs).
- No shadows needed; separation comes from `line` borders and surface contrast.

## 4. Components (see `design/components.png`)

- **Primary button**: sage pill, `ink` text, 56 px tall, icon + label. One per screen.
- **Secondary button**: `surfaceRaised` pill with `line` border.
- **Text button**: `accentText`, no background.
- **Round player buttons**: 64 px outline (1.5 px, phase ink) and 84 px filled (phase ink bg, glyph in phase colour).
- **Chips**: 36 px pills. Selected = `text` background + white label. Unselected = white + border + category dot.
- **Segmented control** (Time | Reps): 48 px, white track, selected segment dark.
- **Stepper** (−  45 s  +): 48 px field, value in Outfit 20/600.
- **Routine card**: white, 20 radius, 52 px drawing thumbnail, name, "dot · category · length", "Last: …", 48 px sage play button.
- **Exercise tile**: white card, drawing on `surfaceRaised`, name, dot + category + default measure.
- **Builder block**: white card; header with name, meta, "⟲ ×2" repeat pill; step rows (40 px drawing thumb, name, work pill in sage, rest pill outlined in `restText`); "+ Add exercise" row. Warm-up block shows a 4 px sand bar on the left.
- **Tab bar**: white, top border, 4 items (icon 24 + label 12), active = `accentText` 600.
- **Bottom sheet**: `bg` colour, 28 px top radius, grab handle, dark scrim `rgba(31,36,34,0.45)`.

## 5. Player layout

Top → bottom: close + block/round + time left · block segments (4 px, one per step) · drawing panel (150 px tall) · phase label + exercise name (centred) · timer in a 250 px ring (7 px stroke, round cap, drains clockwise from top) with "of 0:45" · Next card · controls.
Reps step: no ring, giant "×20", elapsed time, big sage **Done · rest 15 s** button.
Chosen progress pattern: **ring = current step** + **segments = block progress** (see `design/progress-options.png`).

## 6. Illustrations — `assets/exercises/*.svg`

Original single-line figures, round caps, faint floor line, static (never animated). `viewBox 0 0 120 100`, `stroke="currentColor"` so the app tints them:
- Player: ~180–200 px wide, stroke 2.6, colour = phase ink.
- Detail page: 200 px, category tint.
- Lists/thumbs: 40–110 px; thicken stroke (3–4) at small sizes.
A user photo/GIF can replace any drawing. New drawings must follow the same style.

## 7. Brand — `brand/logo/`

- Name: **Kata** (a set sequence of moves practised until it flows).
- Mark (**B1**, chosen): three rounded blocks stepping up — dark `#1F2422` (bottom), sand `#E6C79C`, mist `#A3BFD9` (top) — on pale sage `#E3EEDF`.
- Files: `kata-mark.svg` (blocks only), `kata-app-icon.svg` (rounded), `kata-app-icon-square.svg` + `kata-app-icon-1024.png` (full-bleed for iOS/Android, the OS masks corners), `kata-lockup.svg` (icon + wordmark).
- Wordmark: Outfit 600, `#1F2422`, slight negative tracking. In-app header: 32 px icon + "Kata" at 20 px.
- Explorations that led here: `brand/explorations/`.
