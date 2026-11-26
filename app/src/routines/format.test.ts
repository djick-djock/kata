import { describe, expect, it } from 'vitest'
import { formatClock, formatLast, formatLength, formatTotal } from './format'

describe('routine formatting', () => {
  it('formats totals and lengths', () => {
    expect(formatClock(840)).toBe('14:00')
    expect(formatClock(3725)).toBe('1:02:05')
    expect(formatTotal(840, true)).toBe('~14:00')
    expect(formatLength(840, true)).toBe('~14 min')
    expect(formatLength(300, false)).toBe('5 min')
    expect(formatLength(45, false)).toBe('45 s')
  })
  it('formats the last-done label', () => {
    const now = new Date(2026, 10, 25, 12)
    expect(formatLast(undefined, now)).toBe('Not played yet')
    expect(formatLast(new Date(2026, 10, 25, 7).getTime(), now)).toBe('Today')
    expect(formatLast(new Date(2026, 10, 24, 22).getTime(), now)).toBe('Yesterday')
    expect(formatLast(new Date(2026, 10, 22).getTime(), now)).toBe('Sun 22')
    expect(formatLast(new Date(2026, 10, 12).getTime(), now)).toBe('Nov 12')
  })
})
