Status: ready-for-agent

# Kata spike — audio, screen-awake and timer on a real Android phone

## Problem Statement

The whole app depends on a phone lying on the floor showing a timer while my music plays in another app. Web apps on Android may pause my music when they play a beep, may let the screen go dark, or may freeze the timer when I switch apps. I can't know this without testing on my phone, and I don't want to build the full app on an assumption that fails.

## Solution

A tiny throwaway installable web app, deployed to a private test URL, that runs a 5-minute interval timer with beeps and vibration. I install it on my phone, play Spotify or YouTube Music, and see whether it behaves. The result decides whether Kata is built as a PWA or wrapped in a native shell.

## User Stories

1. As the owner, I want to install the spike on my Android phone from a link, so that I test it the way I'd really use Kata.
2. As the owner, I want a timer that counts a repeating work and rest cycle for at least 5 minutes, so that I can see how long the screen stays on.
3. As the owner, I want the screen to stay awake while the timer runs, so that I can read it from the floor.
4. As the owner, I want the screen to stay awake again after I switch to another app and come back, so that a quick music change doesn't break the session.
5. As the owner, I want short beeps in the last 5 seconds of each work phase, so that I can test the cue sound.
6. As the owner, I want a distinct "go" tone and a softer "rest" tone, so that I can judge whether they are distinguishable over music.
7. As the owner, I want a soft bell, so that I can judge the meditation end cue.
8. As the owner, I want vibration on each cue, so that I can check it works.
9. As the owner, I want a switch that turns sound off and uses vibration only, so that I can test the fallback.
10. As the owner, I want a visible flash or colour pulse on each cue, so that I can test the visual fallback.
11. As the owner, I want to see whether my music kept playing, paused or got quieter when a beep plays, so that I can record the audio-focus result.
12. As the owner, I want the timer to stay accurate when I background the app for 20 seconds and return, so that I know it uses real elapsed time.
13. As the owner, I want a results screen with pass or fail checkboxes for each check, so that I can record the outcome in one place.
14. As the owner, I want the spike to work offline after the first load, so that I confirm the offline install works.
15. As the owner, I want the spike to ask for persistent storage and show whether it was granted, so that I know my data is likely to survive.
16. As the owner, I want to test on both my phone and my tablet, so that I know both behave the same.
17. As the owner, I want the spike code to be disposable, so that I'm not tempted to build on throwaway work.

## Implementation Decisions

- The spike is a separate minimal app, not part of the Kata codebase, though it uses the same build tooling so the deployment path is proven too.
- The timer computes remaining time from timestamps, never from counting ticks.
- Cues are scheduled against the audio clock so they fire accurately. Sound generation is synthesized tones, no audio files, so nothing needs to be downloaded.
- Screen wake is requested on start and re-requested whenever the page becomes visible again. Failure to acquire it is shown on screen.
- Vibration is feature-detected; the result screen reports whether it exists.
- Deployment uses the same hosting route intended for Kata (static site on GitHub Pages) so HTTPS and installability are proven. The repository is private; if Pages is unavailable for a private repo on the user's plan, deploy the spike to a temporary public location instead and tell the user.
- The pass criteria are: screen stays on for 5 minutes; beeps are audible without pausing the music; vibration works; timer stays accurate after switching apps and returning.
- Decision rule: if all pass, Kata continues as a PWA. If only the beeps pause the music, try vibration plus visual cue first, and test wrapping in a native shell only if that is not good enough. Record the result in the spike directory as a short results note.

## Testing Decisions

- This slice is verified by manual device testing; automated tests are not valuable here.
- The timer's use of timestamps may be covered by a single small unit test on the elapsed-time helper if it is extracted.
- The deliverable is the results note with each pass criterion marked, the phone and Android version used, and which music app was playing.

## Out of Scope

- Any real Kata feature, data, routines, or design.
- iPhone testing (not a requirement; vibration is known unsupported there).
- Native wrapper work, unless the decision rule triggers it.

## Further Notes

- Test with both Spotify and YouTube Music if the user has both.
- Also try with headphones connected, since audio routing can change behaviour.
