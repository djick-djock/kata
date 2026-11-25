# Kata

A personal installable web app (PWA) to build routines (workout, stretch, mobility, meditation) and press play. The phone sits on the floor and shows a big, calm timer and the current exercise, with sound and vibration cues, while your own music plays in another app. Works offline; your data stays on your device.

## Status

Planning is done; nothing is built yet. First step is a device spike (audio, screen-awake, timer accuracy on Android) that decides PWA versus native wrapper.

## Where things are

| What | Where |
|---|---|
| Specs, one per slice (start with `kata-v1`) | `.scratch/<slice>/spec.md` |
| Tickets, once created | `.scratch/<slice>/issues/NN-slug.md` |
| Product spec (screens, rules, data model) | `docs/PRODUCT_SPEC.md` |
| Design system, tokens, screens, brand | `docs/DESIGN_SYSTEM.md`, `docs/design/`, `docs/brand/` |
| Exercise catalog (84, archive) and starter shortlist | `docs/exercises/` |

## Build order

1. Spike
2. Routines and player
3. History
4. Backup and Owner mode
5. Log activity (may slip to v1.1)

Later phases: watch data import from GPX/TCX/FIT files, then automatic Strava sync through a future Raspberry Pi service.

## Stack (planned)

Vite, React, TypeScript, Dexie (IndexedDB), a PWA plugin, Vitest. Hosted as static files on GitHub Pages. English only in v1, with French-ready data.
