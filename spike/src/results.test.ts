import { describe, expect, it } from 'vitest'
import { CHECKS, STORAGE_KEY, emptyResults, loadResults, parseResults, resultsToText, saveResults } from './results'

describe('results', () => {
  it('defaults to untested', () => {
    const r = emptyResults()
    expect(CHECKS.every((c) => r.checks[c.id] === 'untested')).toBe(true)
  })
  it('round-trips through storage and tolerates garbage', () => {
    const mem: Record<string, string> = {}
    const store = { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => void (mem[k] = v) }
    const r = emptyResults()
    r.checks.audio = 'fail'
    r.phone = 'Pixel 8'
    expect(saveResults(r, store)).toBe(true)
    expect(loadResults(store)).toEqual(r)
    mem[STORAGE_KEY] = '{not json'
    expect(loadResults(store)).toEqual(emptyResults())
    expect(parseResults('{"checks":{"audio":"bogus"},"phone":5}')).toEqual(emptyResults())
  })
  it('does not throw when storage is missing or throws', () => {
    expect(saveResults(emptyResults(), null)).toBe(false)
    expect(saveResults(emptyResults(), { setItem: () => { throw new Error('x') } })).toBe(false)
    expect(loadResults({ getItem: () => { throw new Error('x') } })).toEqual(emptyResults())
  })
  it('formats text with entries', () => {
    const r = emptyResults()
    r.checks.vibration = 'pass'
    r.music = 'Spotify'
    const t = resultsToText(r)
    expect(t).toContain('Music app: Spotify')
    expect(t).toContain('Vibration works: PASS')
    expect(t).toContain('Works offline after first load: UNTESTED')
  })
})
