import { describe, expect, it } from 'vitest'
import type { SessionRow } from '../data/db'
import type { ActivityRow } from '../data/db'
import { activityMonthTotals, activityRowText, canGoNext, formatDuration, formatWhen, monthGrid, monthLabel, recentItems, shiftMonth, toEntries } from './calendar'

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

describe('activity rows', () => {
  const now = new Date(2026, 10, 24, 15, 0).getTime()
  const act = (o: Partial<ActivityRow>): ActivityRow => ({ id: 'x', type: 'run', startedAt: 0, durationSeconds: 1720, distanceKm: 5.2, source: 'manual', ...o })
  it('formats durations', () => {
    expect(formatDuration(1720)).toBe('28:40')
    expect(formatDuration(3910)).toBe('1:05:10')
  })
  it('shows type, distance, duration and pace', () => {
    expect(activityRowText(act({}))).toEqual({ name: 'Run · 5.2 km', detail: '28:40 · 5:31 /km' })
  })
  it('omits distance and pace when there is no distance', () => {
    expect(activityRowText(act({ type: 'swim', distanceKm: undefined, durationSeconds: 1800 }))).toEqual({ name: 'Swim', detail: '30:00' })
    expect(activityRowText(act({ distanceKm: 0 }))).toEqual({ name: 'Run', detail: '28:40' })
  })
  it('merges with sessions newest first and marks Logged', () => {
    const items = recentItems(
      [row({ id: 's1', startedAt: new Date(2026, 10, 24, 14, 12).getTime() }), row({ id: 's2', startedAt: new Date(2026, 10, 21, 6, 10).getTime() })],
      now, 20, undefined,
      [act({ id: 'a1', startedAt: new Date(2026, 10, 24, 7, 15).getTime() }), act({ id: 'a2', startedAt: new Date(2026, 10, 23, 18, 0).getTime() })],
    )
    expect(items.map((i) => i.id)).toEqual(['s1', 'a1', 'a2', 's2'])
    expect(items[1]).toMatchObject({ kind: 'activity', status: 'Logged', to: '/log/a1', when: 'Today · 7:15' })
    expect(items[0]).toMatchObject({ kind: 'session', to: '/history/s1' })
  })
})

describe('activityMonthTotals', () => {
  const a = (o: Partial<ActivityRow>) => ({ type: 'run' as const, startedAt: Date.UTC(2026, 10, 10, 12), distanceKm: 5, ...o })
  it('sums distance and counts runs in the month only', () => {
    const t = activityMonthTotals([a({}), a({ distanceKm: 5.26 }), a({ type: 'bike', distanceKm: 20 }), a({ startedAt: Date.UTC(2026, 9, 31, 12), distanceKm: 100 })], 2026, 11, 'UTC')
    expect(t).toEqual({ distanceKm: 30.26, runs: 2 })
  })
  it('counts runs without distance and ignores missing or negative distance', () => {
    expect(activityMonthTotals([a({ distanceKm: undefined }), a({ distanceKm: -3 })], 2026, 11, 'UTC')).toEqual({ distanceKm: 0, runs: 2 })
  })
  it('is zero for an empty month and follows the local day at the month edge', () => {
    expect(activityMonthTotals([], 2026, 11, 'UTC')).toEqual({ distanceKm: 0, runs: 0 })
    const late = a({ startedAt: Date.UTC(2026, 10, 1, 2) }) // 2026-10-31 22:00 in New York
    expect(activityMonthTotals([late], 2026, 11, 'America/New_York').runs).toBe(0)
    expect(activityMonthTotals([late], 2026, 10, 'America/New_York').runs).toBe(1)
  })
  it('toEntries merges activities as active-day entries', () => {
    expect(toEntries([], [{ startedAt: 7 }])).toEqual([{ startedAt: 7, kind: 'activity' }])
  })
})
