# 01: Scaffold the real Kata app

**What to build:** The real Kata app, in its own folder separate from the spike, that I can install on my phone and open offline. It uses Vite, React, TypeScript, Dexie and the PWA plugin, with Vitest and an in-memory IndexedDB for tests. It follows the design system: tokens, light and dark themes (following the device, phase colours unchanged), fonts and the logo. It has the four-tab bottom bar (Home, Routines, Exercises, History) with simple empty screens, and a Settings entry point. A GitHub Actions workflow deploys it to GitHub Pages under a sub-path (the spike workflow stays as is, and the spike URL keeps working). The reusable pieces proven by the spike (wake lock helper, vibration helper, synthesized tones, persistent-storage request) are brought across so later tickets can use them.

**Blocked by:** None (can start immediately)

Status: done

- [x] The app has its own package manifest; the spike folder is untouched and still builds — app/package.json, spike untouched (git status clean there), spike tests and build pass
- [x] Production build succeeds, static files only, works under a sub-path — `npm run build` ok; checked with vite preview under /kata/ (deep links work)
- [x] Web manifest and service worker precache everything; verified offline by serving the build and reloading with the network off — manifest + 23-entry precache (incl. fonts); Playwright: reload and deep link load with network off
- [x] Design tokens from the design docs are used (no hard-coded colours); light and dark themes work and follow the device — tokens.css copied from docs; dark theme in src/ui/theme.css follows prefers-color-scheme (dark values derived, need design sign-off); checked both in Playwright
- [x] Four-tab bottom bar navigates between four placeholder screens; layout fine at 400 px wide — Home/Routines/Exercises/History via NavLink, no horizontal overflow at 400 px; Settings icon on each screen opens /settings; unit test covers navigation
- [x] Tests run with Vitest, and a Dexie database can be opened in tests over in-memory IndexedDB (one sample test proves it) — src/data/db.test.ts opens KataDB over fake-indexeddb
- [x] Persistent storage is requested at startup — requestPersistentStorage() called in main.tsx (device test pending for the granted result)
- [x] Wake lock, vibration and tone helpers from the spike are available as modules (copied, not imported across folders) — src/platform/{wake-lock,vibration,persist}.ts, src/audio/{tones,cue-player}.ts copied (with tests); spike's cueFor left out, it belongs to the engine
- [x] Deploy workflow written for the new app; NOT triggered by this ticket — `.github/workflows/app-pages.yml` builds app at /<repo>/ and spike at /<repo>/spike/; not triggered. spike-pages.yml untouched but must be disabled once this is used
- [x] Short README in the app folder: build, test, serve, deploy — app/README.md
- [x] Build and tests pass — app: 8 tests pass, build passes
