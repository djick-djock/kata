# Kata app

The real Kata app (Vite, React, TypeScript, Dexie, vite-plugin-pwa). The `spike/` folder is separate and nothing is imported across folders.

## Commands (run in `app/`)

- `npm install`
- `npm run dev` - dev server (served under `/kata/`)
- `npm test` - Vitest (jsdom for UI tests, in-memory IndexedDB via fake-indexeddb for data tests)
- `npm run build` - typecheck, then static output in `dist/`
- `npm run preview` - serve the build at `http://localhost:4173/kata/`

## Layout

`src/ui` shared components and CSS (tokens, theme), `src/screens` tab and pushed screens, `src/data` Dexie database, `src/engine` session engine (empty, later tickets), `src/audio` tone synthesis and cue player, `src/platform` wake lock, vibration, persistent storage, service worker registration.

## Base path

Served from a sub-path. Default `/kata/`; override with `VITE_BASE`, e.g. `VITE_BASE=/ npm run build`. The router and the service worker follow it.

## Theme

`src/ui/tokens.css` is a copy of `docs/design/tokens.css` (light). `src/ui/theme.css` adds the dark theme, which follows the device. The design docs only define light values, so the dark values are derived and need design sign-off. Phase colours are never overridden.

## Deploy

`.github/workflows/app-pages.yml` builds app and spike into one Pages artifact (app at `/<repo>/`, spike at `/<repo>/spike/`) and deploys with `actions/deploy-pages` (on push to `main` touching `app/` or `spike/`, or manually). It is not enabled until Pages is set to "GitHub Actions". The older `spike-pages.yml` also deploys to Pages (spike only, at the root), so a spike deploy would replace the app: disable or delete it once the app workflow is in use.

## Testing on the phone

Install and offline behaviour need HTTPS, so use the deployed URL. After the first load, turn on airplane mode and reopen the installed app.
