import { describe, expect, it } from 'vitest'
import { CUES, CUE_NAMES } from './tones'

describe('tones', () => {
  it('defines at least one valid tone per cue', () => {
    for (const name of CUE_NAMES) {
      expect(CUES[name].length).toBeGreaterThan(0)
      for (const t of CUES[name]) {
        expect(t.freq).toBeGreaterThan(0)
        expect(t.duration).toBeGreaterThan(0)
        expect(t.gain).toBeGreaterThan(0)
        expect(t.gain).toBeLessThanOrEqual(1)
      }
    }
  })
  it('rest is lower and softer than go', () => {
    expect(CUES.rest[0].freq).toBeLessThan(CUES.go[0].freq)
    expect(CUES.rest[0].gain).toBeLessThan(CUES.go[0].gain)
  })
})
