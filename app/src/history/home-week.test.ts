import { describe, expect, it } from 'vitest'
import { homeWeek, weekColor, weekStart } from './home-week'
import type { DayEntry } from './streak'

const TZ = 'UTC'
const at = (iso: string) => Date.parse(iso)
const s = (iso: string, category = 'stretch', stepsDone = 3): DayEntry => ({ startedAt: at(iso), kind: 'session', category, stepsDone })

describe('homeWeek', () => {
  it('weekStart finds Monday', () => {
    expect(weekStart('2026-11-25')).toBe('2026-11-23')
    expect(weekStart('2026-11-29')).toBe('2026-11-23')
    expect(weekStart('2026-11-23')).toBe('2026-11-23')
  })
  it('lists Monday to Sunday with today flagged and later days empty', () => {
    const w = homeWeek([s('2026-11-23T08:00:00Z'), s('2026-11-25T08:00:00Z', 'hiit')], at('2026-11-25T12:00:00Z'), TZ)
    expect(w.days.map((d) => d.date)[0]).toBe('2026-11-23')
    expect(w.days).toHaveLength(7)
    expect(w.days.map((d) => d.isToday)).toEqual([false, false, true, false, false, false, false])
    expect(w.days.map((d) => d.category)).toEqual(['stretch', undefined, 'hiit', undefined, undefined, undefined, undefined])
    expect(w.streak).toBe(1)
  })
  it('uses the most recent category when a day has several', () => {
    const w = homeWeek([s('2026-11-25T07:00:00Z', 'stretch'), s('2026-11-25T18:00:00Z', 'hiit')], at('2026-11-25T20:00:00Z'), TZ)
    expect(w.days[2].category).toBe('hiit')
  })
  it('is empty with zero streak without sessions', () => {
    const w = homeWeek([], at('2026-11-25T12:00:00Z'), TZ)
    expect(w.days.every((d) => !d.active)).toBe(true)
    expect(w.streak).toBe(0)
  })
  it('streak crosses into the previous week and ignores zero-step sessions', () => {
    const w = homeWeek([s('2026-11-22T08:00:00Z'), s('2026-11-23T08:00:00Z'), s('2026-11-24T08:00:00Z', 'run', 0)], at('2026-11-24T12:00:00Z'), TZ)
    expect(w.streak).toBe(2)
  })
  it('maps colours', () => {
    expect(weekColor(undefined)).toBeUndefined()
    expect(weekColor('meditation')).toBe('var(--color-category-mobility)')
    expect(weekColor('activity')).toBe('var(--color-category-run)')
    expect(weekColor('hiit')).toBe('var(--color-category-hiit)')
  })
})
