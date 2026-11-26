# Kata roadmap

Source for the roadmap section of the progress artifact. One line per item: `- **Title** — detail`. Sections: Done, Next, Later.

## Done

- **Device spike** — proved on a Galaxy S22 with Spotify: beeps play over music, screen stays awake, so the PWA route is confirmed.
- **Exercises, routines and player** — 52-exercise library with variants, routine builder with warm-up blocks and custom steps, player with both modes, cues, completion screen, Home and Settings.
- **History and streak** — monthly stats, calendar, recent list, session details and delete, Home week strip and streak.
- **Log activity** — runs, walks, bike and swim logged by hand, counted in streak, calendar and stats.
- **Feedback round 1** — exercise info from the picker and from routine steps, written details for custom exercises, and Owner mode reworked to list custom exercises in use (plus reading a backup file) instead of importing drawings.
- **Backup and Owner mode** — export and restore of all data with a 14-day nudge, hidden Owner mode, Request drawing prompt and local drawing import.

## Next

- **Keep reporting bugs and UX tweaks** — each one becomes a small ticket and is fixed in the app.

- **Use it for a week or two** — real routines on a real phone, then list what annoys you. Cheapest way to find what matters.
- **Review content and looks** — dark theme colours (derived, not designed), the how-to text for the 23 new exercises, and the five rough drawings.
- **Decide how to host it for family and friends** — Pages needs a public repo on the free plan. Keep it public (no personal data in it) or move to another static host before making it private.
- **Device checks still pending** — touch drag in the builder, the real share sheet, installed-app storage grant, timing after leaving the app.

## Later

- **Phase 2: import watch runs from a file** — GPX, TCX or FIT exported from Strava or Huawei Health, parsed on the phone. A short spike first to check what is possible.
- **Phase 3: automatic Strava sync** — needs the Raspberry Pi service because Strava's sign-in needs a secret kept on a server. Huawei already pushes to Strava, so Strava is the single source.
- **Raspberry Pi request service** — separate project: takes app-tagged requests (like drawing requests) and answers them with Claude. Kata already has the request seam; only a new transport is needed.
- **French interface** — all exercise text already has language slots; the screens still need translating.
- **Week and year history views** — the data is already stored in full detail.
- **Weekly schedule and reminders** — not planned yet; left out of v1 on purpose.
