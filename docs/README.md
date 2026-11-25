# Kata — docs

Everything needed to build the Kata app (workout routines you build once and press play).

| File / folder | What it is |
|---|---|
| `PRODUCT_SPEC.md` | Features, screens, rules (player modes, streak, templates, logging), suggested data model, open questions |
| `DESIGN_SYSTEM.md` | Colours, type, spacing, components, player layout, illustration and logo rules |
| `design/tokens.json`, `design/tokens.css` | Design tokens to import into the code |
| `design/screens/` | The 12 key screens (PNG @2x, 390×844 phone frames), numbered in navigation order |
| `design/foundations.png`, `components.png`, `illustrations.png`, `progress-options.png` | Design system boards |
| `assets/exercises/` | Exercise line drawings (SVG, `currentColor`) |
| `brand/logo/` | Final logo (B1): mark, app icon (SVG + 1024 PNG), lockup |
| `brand/explorations/` | Name and logo explorations (for history only) |

Live design canvas (editable): https://claude.ai/artifact/NeKzKywwdojTznDwps7hmD

Suggested line for the project's `CLAUDE.md`:

> Read `docs/PRODUCT_SPEC.md` and `docs/DESIGN_SYSTEM.md` before building any screen. Match `docs/design/screens/*.png`, use the values in `docs/design/tokens.json`, and the SVGs in `docs/assets` and `docs/brand/logo`. Ask before changing a design decision.
