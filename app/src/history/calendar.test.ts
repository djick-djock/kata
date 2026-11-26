import { describe, expect, it } from 'vitest'
import type { SessionRow } from '../data/db'
import { canGoNext, formatWhen, monthGrid, monthLabel, recentItems, shiftMonth, toEntries } from './calendar'

const row = (o: Partial<SessionRow>): SessionRow => ({
  id: 'a', startedAt: 0, finishedAt: 0, routineName: 'Hip flow', category: 'mobility', mode: 'play-all', durationSeconds: 60,
  stepsDone: 3, stepsTotal: 3, roundsDone: 1, roundsTotal: 1, percent: 100, completed: true, ...o,
})

describe('monthGrid', () => {
  it('starts Mondays: November 2026 begins on a Sunday (6 blanks)', () => {
    const g = monthGrid({ year: 2026, month: 11 })
    expect(g.slice(0, 7)).toEqual([null, null, null, null, null, null, 1])
    expect(g.filter(Boolean)).toHaveLength(30)
  })
  it('has no blanks when the 1st is a Monday (June 2026)', () => {
    expect(monthGrid({ year: 2026, month: 6 })[0]).toBe(1)
  })
})

describe('month navigation', () => {
  it('shifts across year ends', () => {
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 })
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 })
  })
  it('offers no future months', () => {
    const cur = { year: 2026, month: 11 }
    expect(canGoNext(cur, cur)).toBe(false)
    expect(canGoNext({ year: 2026, month: 10 }, cur)).toBe(true)
    expect(monthLabel(cur)).toBe('November 2026')
  })
})

describe('recent list', () => {
  const now = new Date(2026, 10, 24, 15, 0).getTime()
  it('labels Done and partial percent, newest first', () => {
    const items = recentItems([
      row({ id: 'old', startedAt: new Date(2026, 10, 21, 6, 10).getTime(), completed: false, percent: 71.6 }),
      row({ id: 'new', startedAt: new Date(2026, 10, 24, 14, 12).getTime() }),
    ], now)
    expect(items.map((i) => i.id)).toEqual(['new', 'old'])
    expect(items[0]).toMatchObject({ status: 'Done', partial: false, when: 'Today · 14:12' })
    expect(items[1]).toMatchObject({ status: '72%', partial: true, when: 'Sat 21 · 6:10' })
  })
  it('formats a late-evening session on its local day', () => {
    expect(formatWhen(new Date(2026, 10, 23, 23, 50).getTime(), now)).toBe('Yesterday · 23:50')
  })
  it('maps sessions to engine entries', () => {
    expect(toEntries([row({ startedAt: 5, stepsDone: 0 })])).toEqual([{ startedAt: 5, kind: 'session', category: 'mobility', stepsDone: 0 }])
  })
})
