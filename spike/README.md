# Kata spike (throwaway)

Installable, offline-capable PWA used to test audio, screen-awake and timer behaviour on a real phone. Disposable; nothing here is imported by the future Kata app. It collects and sends no data.

Stack: Vite, TypeScript, vite-plugin-pwa, Vitest.

## Commands (run in `spike/`)

- `npm install`
- `npm run dev` - dev server
- `npm test` - unit tests
- `npm run build` - static output in `dist/`
- `npm run preview` - serve the build locally at `http://localhost:4173/kata/`

## Base path

The app is served from a sub-path. Default is `/kata/`; override with `VITE_BASE`, e.g. `VITE_BASE=/ npm run build`. The workflow sets it to `/<repo-name>/`.

## Deploy

`.github/workflows/spike-pages.yml` builds and publishes `dist/` to GitHub Pages (on push to `main` touching `spike/`, or manually). It is not enabled until Pages is set to "GitHub Actions" in the repo settings.

## Testing on the phone

Service workers, install, wake lock and audio need a secure context. `http://<LAN-ip>:port` is NOT secure on the phone, so use the deployed HTTPS URL for real testing (`localhost` is only secure on the same machine).

## How to run the device test

Open the deployed HTTPS URL on the phone, install it, and start your music (Spotify, then YouTube Music; repeat with headphones). In order:

1. Timer screen: note "Persistent storage" and "Vibration" status. Tap each Test button (beep, go, rest, bell) over the music; judge whether they are distinguishable and whether the music paused or ducked.
2. Turn "Sound on" off, tap the tests again: vibration and the colour pulse should still work.
3. Set work 20 / rest 10 / rounds 11 (default, ~5 min) and tap Start. Leave the screen untouched for 5 minutes: does it stay on (Wake lock: HELD)?
4. During the run, listen for beeps in the last 5 s of work, the go tone after rest, the lower rest tone, and the bell at the end. Does the music keep playing?
5. Mid-run, switch to another app for about 20 s and come back: is the time right and is the wake lock held again?
6. Turn on airplane mode, close and reopen the installed app: does it load and run?
7. Open the Results tab: set pass / fail for each check, fill phone model, Android version and music app, tap "Copy results as text" and paste it back.
