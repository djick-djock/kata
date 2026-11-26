export const vibrationSupported = (): boolean => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

/** Feature-detected vibrate; returns whether a pattern was dispatched. */
export function vibrate(pattern: number | number[]): boolean {
  if (!vibrationSupported()) return false
  try {
    return navigator.vibrate(pattern)
  } catch {
    return false
  }
}

export const PHASE_CHANGE_PATTERN = [200, 80, 200]
export const COUNTDOWN_PATTERN = 80
export const COUNTDOWN_SECONDS = 5

/** Pure mapping from a timer event to a vibration pattern (or null); easy to unit test. */
export function patternFor(e: { type: string; phase?: { kind: string }; secondsLeft?: number }): number | number[] | null {
  if (e.type === 'phase-start' || e.type === 'finish') return PHASE_CHANGE_PATTERN
  if (e.type === 'tick' && e.phase?.kind === 'work' && e.secondsLeft! >= 1 && e.secondsLeft! <= COUNTDOWN_SECONDS) return COUNTDOWN_PATTERN
  return null
}
