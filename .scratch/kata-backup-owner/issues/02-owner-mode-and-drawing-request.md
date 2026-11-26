# 02: Owner mode and drawing request

**What to build:** A hidden Owner mode. A long press on the version number in Settings toggles it on or off; it stays on until I turn it off, and it is a local flag that is not part of anyone else's experience. Regular users see nothing of it. With Owner mode on, each exercise's detail screen has a "Request drawing" action that copies a ready-made prompt to the clipboard: it contains the exercise name, how-to steps, per-side or measure information and the drawing style rules (simple schematic figure, current-colour strokes, accent variables, the standard canvas size, consistent line weight) so I can paste it straight into Claude. The request goes through one small reusable request module: a single submit function taking an app id, a request type and a payload and delegating to a transport. The only transport in v1 is the clipboard, which formats the request as human-readable prompt text; an unknown transport is rejected. The module knows nothing about Kata's screens or data and imports nothing from the app, so it can be copied to other apps later.

**Blocked by:** 01 (both edit Settings)

Status: ready-for-agent

- [ ] Long press on the version number toggles Owner mode; the flag persists locally and survives reloads; a short toast confirms the change
- [ ] With Owner mode off, no owner control is visible anywhere (checked on Settings and exercise detail)
- [ ] "Request drawing" appears on exercise detail only in Owner mode and copies the prompt (clipboard fallback: show the text to select and copy)
- [ ] The prompt contains exercise name, how-to steps, per-side or measure info and the style rules, matching the look of the existing drawings (canvas size, line weight, current-colour and accent-variable rules taken from the real files)
- [ ] Request module: submit(appId, type, payload) with a clipboard transport producing prompt text containing app id, type and payload fields; unknown transport rejected; the module imports nothing from the app (tested, including the no-imports property)
- [ ] The Owner flag is included in backups or deliberately excluded, with the choice noted in the ticket
- [ ] Layout checked headless at 400 px wide in light and dark
- [ ] Build and tests pass
