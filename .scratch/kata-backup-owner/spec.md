Status: ready-for-agent
Blocked by: kata-routines-player

# Kata — settings, backup and Owner mode

## Problem Statement

All my data lives on my device. If I clear site data, uninstall, or switch phone, I lose everything. Separately, I want to request Claude-generated drawings for exercises, but only for me: my sisters and friends shouldn't see that feature.

## Solution

A Settings screen with cue and language-ready preferences, a manual backup (export to a JSON file, replace-all import with confirmation) and a gentle reminder after 14 days without a backup. A hidden Owner mode, unlocked in Settings, adds a "Request drawing" action that copies a ready-made prompt for Claude and later imports the returned SVG, all through one small reusable request module.

## User Stories

1. As a user, I want a Settings screen, so that I can control the app's behaviour.
2. As a user, I want to toggle sound, vibration and the visual pulse for cues, so that I choose how I'm cued.
3. As a user, I want a volume setting for cue sounds, so that beeps are audible over my music without being loud.
4. As a user, I want to set the switch pause length for per-side exercises, so that it matches my pace.
5. As a user, I want to export all my data to a single JSON file, so that I can back it up.
6. As a user, I want to save that file through my phone's share sheet to Drive or elsewhere, so that I choose where it goes.
7. As a user, I want the backup to include routines, routines (including custom steps), sessions, activities and settings, so that nothing is lost.
8. As a user, I want to import a backup file, so that I can restore my data or move to a new device.
9. As a user, I want import to clearly warn me that it overwrites everything on this device and require confirmation, so that I don't lose data by accident.
10. As a user, I want a damaged or wrong file to be rejected with a clear message and my existing data left untouched, so that a bad file can't destroy anything.
11. As a user, I want to see "Last backup: N days ago" in Settings, so that I know my status.
12. As a user, I want a nudge in Settings and History after 14 days without a backup, so that I remember.
13. As a user, I want the app to request persistent storage and show whether it was granted, so that I know my data is less likely to be evicted.
14. As a user, I want the backup file to carry a version number, so that future versions of the app can still read old backups.
15. As an owner, I want to unlock Owner mode with a hidden gesture in Settings, so that regular users never see it.
16. As an owner, I want Owner mode to remain on until I turn it off, so that I don't re-unlock it each time.
17. As an owner, I want a "Request drawing" action on an exercise, so that I can ask Claude for an illustration.
18. As an owner, I want that action to copy a ready-made prompt containing the exercise name, how-to steps, per-side or measure info, and the drawing style rules, so that I can paste it into Claude directly.
19. As an owner, I want the prompt to require an SVG that uses the current text colour and accent variables with the standard canvas size, so that the result fits both themes and the existing drawings.
20. As an owner, I want to paste or import the returned SVG as a local drawing for that exercise on my device, so that I can see it in the app before it is added to the shipped library.
21. As an owner, I want the SVG validated and sanitised on import (no scripts, no external references), so that a pasted file can't harm the app.
22. As an owner, I want a preview of the imported drawing in light and dark themes before saving, so that I catch bad drawings.
23. As an owner, I want to replace or remove my local drawing later, so that I can iterate.
24. As a regular user (a friend or family member), I want none of the owner features visible, so that the app stays simple.
25. As a developer, I want the request mechanism to be one small module taking an app id, request type and payload, so that I can reuse it in other apps later.
26. As a developer, I want clipboard to be the only transport in v1 and the module to allow other transports later, so that a future Raspberry Pi service can be added without touching screens.

## Implementation Decisions

- **Backup module** (data boundary): export produces one JSON document with a format version, an export timestamp and every store's contents; import validates the document fully before touching existing data, then replaces everything in one transaction so a failure leaves the old data intact.
- Backup includes user drawings as embedded text (SVG) or image data, so the file is self-contained.
- Last backup time is stored locally and updated on export. The nudge shows when more than 14 days have passed or no backup has ever been made.
- Persistent storage is requested at startup and its result is shown in Settings.
- Settings are stored locally and included in backups.
- **Owner mode** is a local flag toggled by a hidden gesture (long-press on the version number in Settings). It is explicitly not a security boundary; it only hides a feature that is harmless without the owner's own Claude account.
- **Request module**: a small module exposing a single submit function that takes an app id, a request type and a payload, and delegates to a transport. The clipboard transport formats the request as human-readable prompt text. The module has no knowledge of Kata's screens or data and can be copied to other apps.
- The drawing-request prompt is built from a template that includes the exercise details, the canvas size and style rules (current-colour strokes, accent variables, simple schematic figure, consistent line weight) used by the existing drawings.
- SVG import sanitisation strips scripts, event handlers, external links and unknown elements before storing.

## Testing Decisions

- Tests assert observable behaviour at the data boundary and the request module's public interface.
- **Backup (data boundary seam):** export then wipe then import round-trips every store; invalid or truncated file is rejected with no data change; version field is present; a backup from an earlier version is accepted; nudge logic at 13, 14 and 15 days and with no backup.
- **Request module:** clipboard transport produces prompt text containing app id, type and payload fields; unknown transport is rejected; the module imports nothing from the app.
- **SVG sanitiser:** scripts, event handlers and external references are removed; valid drawings pass unchanged.
- Settings screens and the Owner gesture are verified manually.

## Out of Scope

- Cloud sync, automatic Drive backup, accounts.
- Merging imports (v1 is replace-all).
- The Raspberry Pi service and any network transport for requests.
- Generating drawings inside the app.
- Real access control for Owner mode.

## Further Notes

- The request module is intended to be reusable in the user's other small apps and for a future Pi intake service that accepts requests tagged with an app id. See the parked idea recorded in project memory.
