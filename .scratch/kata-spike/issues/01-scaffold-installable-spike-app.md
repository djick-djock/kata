# 01: Scaffold the installable, offline spike app

**What to build:** A minimal, throwaway web app in its own self-contained folder (separate from the future Kata app) that I can install on my Android phone as an app and open with no network after the first load. It shows a placeholder start screen. It is built with the same tooling intended for Kata (Vite, TypeScript, a PWA plugin) and has a GitHub Actions workflow ready to publish it as a static site, so the deployment path is proven. It builds to static files that work under a sub-path URL (GitHub Pages style).

**Blocked by:** None (can start immediately)

Status: done

- [x] The spike lives in its own folder with its own package manifest; nothing from the future Kata app is imported or required
- [x] A production build succeeds and its output is static files only
- [x] The built app works when served from a sub-path, not only from the root
- [x] The app has a web manifest (name, icons, standalone display) and a service worker that precaches everything, so it loads offline after first visit (verified by building, serving the build, going offline in a headless browser and reloading)
- [x] A placeholder start screen renders, with a visible "Spike" title and version
- [x] A GitHub Actions workflow builds the spike and deploys it to GitHub Pages; it is written but NOT enabled or triggered by this ticket
- [x] A short readme in the spike folder says how to build, serve locally and deploy, and notes that local HTTP over a LAN address will not be a secure context on the phone (so a deployed HTTPS URL is needed for real testing)
- [x] Nothing in the spike collects or sends data anywhere
