import { CUES, type CueName } from './tones'

/**
 * Thin Web Audio player. Tones are scheduled against the AudioContext clock (start/stop at
 * absolute context times), not against timer callbacks. The context is created/resumed only
 * from unlock(), which must be called inside a user gesture.
 */
export function createCuePlayer() {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let enabled = true
  let volume = 0.7

  const apply = () => {
    if (master) master.gain.value = enabled ? volume : 0
  }

  return {
    get state(): string {
      return ctx ? ctx.state : 'not started'
    },
    /** Call from a click/touch handler. Safe to call repeatedly. */
    unlock() {
      try {
        if (!ctx) {
          const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
          if (!AC) return
          ctx = new AC()
          master = ctx.createGain()
          master.connect(ctx.destination)
          apply()
        }
        if (ctx.state === 'suspended') void ctx.resume()
      } catch {
        /* audio unavailable; cues degrade to vibration + pulse */
      }
    },
    setEnabled(v: boolean) {
      enabled = v
      apply()
    },
    setVolume(v: number) {
      volume = Math.min(1, Math.max(0, v))
      apply()
    },
    /** Schedule a cue on the audio clock. No-op when sound is off or audio is not unlocked. */
    play(name: CueName) {
      if (!enabled || !ctx || !master || ctx.state !== 'running') return
      const t0 = ctx.currentTime + 0.02
      for (const tone of CUES[name]) {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        const start = t0 + tone.offset
        const end = start + tone.duration
        osc.type = tone.wave
        osc.frequency.setValueAtTime(tone.freq, start)
        g.gain.setValueAtTime(0.0001, start)
        g.gain.linearRampToValueAtTime(tone.gain, start + 0.01)
        g.gain.exponentialRampToValueAtTime(0.0001, end)
        osc.connect(g).connect(master)
        osc.start(start)
        osc.stop(end + 0.05)
      }
    },
  }
}
export type CuePlayer = ReturnType<typeof createCuePlayer>
