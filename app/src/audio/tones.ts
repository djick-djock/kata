/**
 * Tone descriptors for each synthesized cue (copied from the spike). No audio, no DOM.
 * The thin player (cue-player.ts) turns descriptors into sound. Which cue fires when belongs to the engine.
 */

export type CueName = 'beep' | 'go' | 'rest' | 'bell'

export interface Tone {
  freq: number // Hz
  /** seconds after the cue's start */
  offset: number
  duration: number
  /** peak gain 0..1 before master volume */
  gain: number
  wave: OscillatorType
}

export const CUE_NAMES: CueName[] = ['beep', 'go', 'rest', 'bell']
export const CUE_LABELS: Record<CueName, string> = { beep: 'Beep', go: 'Go', rest: 'Rest', bell: 'Bell' }
export const BEEP_SECONDS = 5

export const CUES: Record<CueName, Tone[]> = {
  beep: [{ freq: 880, offset: 0, duration: 0.12, gain: 0.6, wave: 'sine' }],
  go: [
    { freq: 784, offset: 0, duration: 0.14, gain: 0.7, wave: 'triangle' },
    { freq: 1175, offset: 0.16, duration: 0.3, gain: 0.7, wave: 'triangle' },
  ],
  rest: [{ freq: 330, offset: 0, duration: 0.45, gain: 0.35, wave: 'sine' }],
  bell: [
    { freq: 523, offset: 0, duration: 2.5, gain: 0.4, wave: 'sine' },
    { freq: 1047, offset: 0, duration: 1.6, gain: 0.15, wave: 'sine' },
    { freq: 1568, offset: 0, duration: 0.9, gain: 0.08, wave: 'sine' },
  ],
}
