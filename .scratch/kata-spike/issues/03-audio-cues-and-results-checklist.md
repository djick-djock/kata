# 03: Audio cues, visual pulse and the results checklist

**What to build:** While the timer runs, the spike plays synthesized cues (no audio files): a short beep on each of the last 5 seconds of work, a distinct go tone when work starts after a rest, a softer lower tone when rest starts, and a soft bell at the end. Each cue also triggers a visible flash or colour pulse. Controls let me switch sound off (vibration only), set the volume, and trigger each cue by hand with a test button, so I can judge them over my music. Cues are scheduled against the audio clock so they land on time. A results screen lists each pass or fail check from the spike spec (screen stays on for 5 minutes, beeps audible without pausing music, vibration works, timer accurate after switching apps, offline works) with pass/fail/untested choices, plus fields for phone model, Android version and which music app was playing. The results can be copied as text so I can paste them back, and are remembered between visits on the device.

**Blocked by:** 02

Status: done

- [x] Beeps play on each of the last 5 seconds of work; a go tone on work start after rest; a lower rest tone on rest start; a soft bell on finish - cue schedule unit-tested; headless run produced 5 beeps + rest tone per work phase; audible output: device test pending
- [x] All cues are generated tones; no audio files are loaded - Web Audio oscillators only, no audio files
- [x] Cues are scheduled with the audio clock, not by timer callbacks, and audio starts only after a user gesture - tones start at AudioContext.currentTime offsets (src/audio.ts); AudioContext created only in Start/test/switch click handlers (verified: none before gesture); real timing: device test pending
- [x] Each cue also triggers a visible pulse - verified headless (pulse overlay toggles per cue; reduced-motion keeps a brief colour change); visual check on device pending
- [x] A sound on/off switch and a volume control exist; with sound off, vibration and the pulse still work - verified headless: with sound off no oscillators are created, pulse still fires, vibration unchanged
- [x] A test button for each cue plays it on demand - four buttons verified headless to run without errors; audible result: device test pending
- [x] A results screen records pass, fail or untested for each check, plus phone model, Android version and music app
- [x] Results persist locally and can be copied as plain text - verified headless across reload; copy via clipboard and select-text fallback both checked
- [x] A note on screen reminds me to check whether music paused or ducked when a beep played
- [x] Unit tests cover the cue schedule (which cues fire at which seconds) without producing sound
- [x] Build and tests pass
