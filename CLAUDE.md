# Kata

Personal PWA to build routines (workout, stretch, mobility, meditation) and press play: big calm timer, sound and vibration cues, works offline while the user's music plays in another app.

Read `docs/PRODUCT_SPEC.md` and `docs/DESIGN_SYSTEM.md` before building any screen. Match `docs/design/screens/*.png`, use the values in `docs/design/tokens.json`, and the SVGs in `docs/assets` and `docs/brand/logo`. Ask before changing a design decision.

Specs live in `.scratch/`. Start with `.scratch/kata-v1/spec.md` (overview and build order); each slice has its own spec.

## Agent skills

### Issue tracker

Issues and specs are local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context. See `docs/agents/domain.md`.

## Shipping

`main` is the live app: a push to `main` that touches `app/` deploys to https://djick-djock.github.io/kata/ through `.github/workflows/app-pages.yml`.

- Before anything reaches `main`, run `npm ci`, `npm test` and `npm run build` in `app/`.
- Work on a branch. Merge or push to `main` only when asked to ship.
- The app keeps its data in IndexedDB on the user's phone, so a schema change must migrate existing data.
- Sound, vibration and keeping the screen awake need a check on the phone; say so when a change touches them.
- The repo is public: keep personal details out of commits.
