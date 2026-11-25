/**
 * Pure cue schedule: maps timer events to cue names, and cue names to tone descriptors.
 * No audio, no DOM. The thin player (audio.ts) turns descriptors into sound.
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

type EventLike = { type: string; phase?: { kind: string; round?: number; durationMs?: number }; secondsLeft?: number }

/**
 * Which cue (if any) fires for a timer event.
 * - beep: each of the last 5 seconds of work (not on the first tick of a phase, which coincides with phase start)
 * - go: work starts after a rest (not the very first work phase)
 * - rest: rest starts
 * - bell: finish
 * After a clock jump the timer emits only the latest tick, so this never replays missed beeps.
 */
export function cueFor(e: EventLike): CueName | null {
  if (e.type === 'finish') return 'bell'
  if (e.type === 'phase-start') {
    if (e.phase?.kind === 'rest') return 'rest'
    if (e.phase?.kind === 'work' && (e.phase.round ?? 1) > 1) return 'go'
    return null
  }
  if (e.type === 'tick' && e.phase?.kind === 'work') {
    const s = e.secondsLeft ?? 0
    const isFirstTick = e.phase.durationMs !== undefined && s * 1000 >= e.phase.durationMs
    if (s >= 1 && s <= BEEP_SECONDS && !isFirstTick) return 'beep'
  }
  return null
}
