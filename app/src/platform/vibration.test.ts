import { afterEach, describe, expect, it, vi } from 'vitest'
import { patternFor, vibrate, vibrationSupported, PHASE_CHANGE_PATTERN, COUNTDOWN_PATTERN } from './vibration'

const work = { kind: 'work' }
const rest = { kind: 'rest' }

describe('patternFor', () => {
  it('vibrates on phase start and finish', () => {
    expect(patternFor({ type: 'phase-start', phase: rest })).toEqual(PHASE_CHANGE_PATTERN)
    expect(patternFor({ type: 'finish' })).toEqual(PHASE_CHANGE_PATTERN)
  })
  it('vibrates on the last 5 seconds of work only', () => {
    for (const s of [5, 4, 3, 2, 1]) expect(patternFor({ type: 'tick', phase: work, secondsLeft: s })).toBe(COUNTDOWN_PATTERN)
    expect(patternFor({ type: 'tick', phase: work, secondsLeft: 6 })).toBeNull()
    expect(patternFor({ type: 'tick', phase: rest, secondsLeft: 3 })).toBeNull()
    expect(patternFor({ type: 'phase-end', phase: work })).toBeNull()
  })
})

describe('feature detection', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('is a no-op without navigator.vibrate', () => {
    vi.stubGlobal('navigator', {})
    expect(vibrationSupported()).toBe(false)
    expect(vibrate(100)).toBe(false)
  })
  it('calls navigator.vibrate when present', () => {
    const fn = vi.fn(() => true)
    vi.stubGlobal('navigator', { vibrate: fn })
    expect(vibrate([1, 2])).toBe(true)
    expect(fn).toHaveBeenCalledWith([1, 2])
  })
})
