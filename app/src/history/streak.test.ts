import { describe, expect, it } from 'vitest'
import {
  ACTIVITY_CATEGORY,
  activeDays,
  addDays,
  currentStreak,
  dayKey,
  daysInMonth,
  monthMarkers,
  monthStats,
  weekStrip,
  type DayEntry,
} from './streak'

const UTC = 'UTC'
const at = (y: number, mo: number, d: number, h = 12, mi = 0) => Date.UTC(y, mo - 1, d, h, mi)
const session = (ts: number, stepsDone = 3, category = 'workout'): DayEntry => ({ startedAt: ts, kind: 'session', stepsDone, category })
const activity = (ts: number): DayEntry => ({ startedAt: ts, kind: 'activity' })
const TODAY = at(2026, 11, 25)

describe('dayKey', () => {
  it('uses local components in the device zone by default', () => {
    expect(dayKey(new Date(2026, 10, 25, 23, 59, 59).getTime())).toBe('2026-11-25')
    expect(dayKey(new Date(2026, 10, 26, 0, 0, 0).getTime())).toBe('2026-11-26')
  })
  it('splits a day exactly at local midnight in a given zone', () => {
    expect(dayKey(at(2026, 11, 25, 23, 59), UTC)).toBe('2026-11-25')
    expect(dayKey(at(2026, 11, 26, 0, 0), UTC)).toBe('2026-11-26')
  })
  it('puts the same instant on different days in different zones', () => {
    const t = at(2026, 11, 25, 3, 30) // 03:30 UTC
    expect(dayKey(t, 'UTC')).toBe('2026-11-25')
    expect(dayKey(t, 'America/Toronto')).toBe('2026-11-24') // 22:30 local
    expect(dayKey(t, 'Asia/Tokyo')).toBe('2026-11-25') // 12:30 local
    expect(dayKey(t, 'Pacific/Kiritimati')).toBe('2026-11-25') // UTC+14
  })
  it('handles DST transitions in a zone', () => {
    // Toronto spring forward 2026-03-08 02:00 -> 03:00, fall back 2026-11-01 02:00 -> 01:00
    expect(dayKey(at(2026, 3, 9, 3, 59), 'America/Toronto')).toBe('2026-03-08') // 23:59 EDT
    expect(dayKey(at(2026, 3, 9, 4, 0), 'America/Toronto')).toBe('2026-03-09') // 00:00 EDT
    expect(dayKey(at(2026, 11, 2, 4, 59), 'America/Toronto')).toBe('2026-11-01') // 23:59 EST
    expect(dayKey(at(2026, 11, 2, 5, 0), 'America/Toronto')).toBe('2026-11-02')
  })
  it('accepts Date and passes through day keys, rejecting bad ones', () => {
    expect(dayKey(new Date(at(2026, 1, 2)), UTC)).toBe('2026-01-02')
    expect(dayKey('2026-01-02')).toBe('2026-01-02')
    expect(() => dayKey('nope')).toThrow()
  })
})

describe('calendar helpers', () => {
  it('adds days across month, year and leap boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(daysInMonth(2026, 2)).toBe(28)
    expect(daysInMonth(2028, 2)).toBe(29)
  })
})

describe('activeDays', () => {
  it('counts partial sessions and ignores zero-step sessions', () => {
    const d = activeDays([session(at(2026, 11, 24), 1), session(at(2026, 11, 23), 0)], UTC)
    expect([...d]).toEqual(['2026-11-24'])
  })
  it('counts an activity regardless of steps', () => {
    expect(activeDays([{ startedAt: at(2026, 11, 20), kind: 'activity', stepsDone: 0 }], UTC).has('2026-11-20')).toBe(true)
  })
  it('counts a day with several sessions and an activity once', () => {
    const d = activeDays([session(at(2026, 11, 24, 8)), session(at(2026, 11, 24, 18)), activity(at(2026, 11, 24, 20))], UTC)
    expect(d.size).toBe(1)
  })
  it('lands a session just before and just after midnight on the right days', () => {
    const d = activeDays([session(at(2026, 11, 24, 23, 59)), session(at(2026, 11, 25, 0, 1))], UTC)
    expect([...d].sort()).toEqual(['2026-11-24', '2026-11-25'])
  })
  it('groups by the zone: same instant, different day', () => {
    const e = [session(at(2026, 11, 25, 3, 30))]
    expect([...activeDays(e, 'UTC')]).toEqual(['2026-11-25'])
    expect([...activeDays(e, 'America/Toronto')]).toEqual(['2026-11-24'])
  })
  it('a zone change moves late sessions across the boundary and changes the streak', () => {
    const e = [session(at(2026, 11, 24, 2, 0)), session(at(2026, 11, 25, 2, 0))] // 02:00 UTC each
    expect(currentStreak(e, TODAY, 'UTC')).toBe(2)
    // In Toronto they are Nov 23 and Nov 24 evenings; today (12:00 UTC = Nov 25 07:00) -> yesterday ends streak
    expect(currentStreak(e, TODAY, 'America/Toronto')).toBe(2)
    expect(currentStreak(e, at(2026, 11, 26, 12), 'America/Toronto')).toBe(0)
    expect(currentStreak(e, at(2026, 11, 26, 12), 'UTC')).toBe(2)
  })
})

describe('currentStreak', () => {
  it('is zero with nothing', () => {
    expect(currentStreak([], TODAY, UTC)).toBe(0)
  })
  it('counts consecutive days ending today', () => {
    const e = [at(2026, 11, 25), at(2026, 11, 24), at(2026, 11, 23)].map((t) => session(t))
    expect(currentStreak(e, TODAY, UTC)).toBe(3)
  })
  it('still counts when the streak ends yesterday', () => {
    const e = [at(2026, 11, 24), at(2026, 11, 23)].map((t) => session(t))
    expect(currentStreak(e, TODAY, UTC)).toBe(2)
  })
  it('resets when the last active day is two days ago', () => {
    const e = [at(2026, 11, 23), at(2026, 11, 22)].map((t) => session(t))
    expect(currentStreak(e, TODAY, UTC)).toBe(0)
  })
  it('stops at a gap', () => {
    const e = [at(2026, 11, 25), at(2026, 11, 24), at(2026, 11, 22)].map((t) => session(t))
    expect(currentStreak(e, TODAY, UTC)).toBe(2)
  })
  it('counts a partial session and not a zero-step one', () => {
    expect(currentStreak([session(TODAY, 1)], TODAY, UTC)).toBe(1)
    expect(currentStreak([session(TODAY, 0)], TODAY, UTC)).toBe(0)
    expect(currentStreak([session(at(2026, 11, 24), 2), session(TODAY, 0)], TODAY, UTC)).toBe(1)
  })
  it('counts several sessions on a day once', () => {
    const e = [session(at(2026, 11, 25, 7)), session(at(2026, 11, 25, 9)), session(at(2026, 11, 25, 21))]
    expect(currentStreak(e, TODAY, UTC)).toBe(1)
  })
  it('bridges days with activity-only entries', () => {
    const e = [session(at(2026, 11, 25)), activity(at(2026, 11, 24)), session(at(2026, 11, 23))]
    expect(currentStreak(e, TODAY, UTC)).toBe(3)
  })
  it('crosses month and year boundaries', () => {
    const e = [at(2026, 1, 1), at(2025, 12, 31), at(2025, 12, 30)].map((t) => session(t))
    expect(currentStreak(e, at(2026, 1, 1), UTC)).toBe(3)
  })
  it('takes today as a Date, timestamp or day key', () => {
    const e = [session(TODAY)]
    expect(currentStreak(e, new Date(TODAY), UTC)).toBe(1)
    expect(currentStreak(e, '2026-11-25', UTC)).toBe(1)
  })
  it('changes when a session is deleted', () => {
    const a = session(at(2026, 11, 25))
    const b = session(at(2026, 11, 24))
    const c = session(at(2026, 11, 23))
    const all = [a, b, c]
    expect(currentStreak(all, TODAY, UTC)).toBe(3)
    expect(currentStreak(all.filter((x) => x !== b), TODAY, UTC)).toBe(1)
    expect(currentStreak(all.filter((x) => x !== a), TODAY, UTC)).toBe(2)
  })
  it('works in the device zone with local-built timestamps', () => {
    const local = (d: number, h: number) => new Date(2026, 10, d, h, 0).getTime()
    const e = [session(local(25, 0)), session(local(24, 23)), session(local(23, 12))]
    expect(currentStreak(e, local(25, 15))).toBe(3)
  })
})

describe('monthStats', () => {
  const entries = [
    session(at(2026, 11, 1, 0, 0)),
    session(at(2026, 11, 1, 18)),
    session(at(2026, 11, 5), 0),
    activity(at(2026, 11, 5, 8)),
    activity(at(2026, 11, 30, 23, 59)),
    session(at(2026, 10, 31, 23, 59)),
    session(at(2026, 12, 1, 0, 0)),
  ]
  it('counts routines, activities and distinct active days in the month', () => {
    expect(monthStats(entries, 2026, 11, UTC)).toEqual({ routines: 2, activities: 2, activeDays: 3 })
  })
  it('respects month boundaries in the chosen zone', () => {
    expect(monthStats(entries, 2026, 10, UTC)).toEqual({ routines: 1, activities: 0, activeDays: 1 })
    // 2026-12-01 00:00 UTC is still Nov 30 in Toronto
    expect(monthStats(entries, 2026, 11, 'America/Toronto').routines).toBe(2) // Nov 1 00:00 UTC drops out, Dec 1 00:00 UTC comes in
  })
  it('is all zero for an empty month', () => {
    expect(monthStats(entries, 2026, 9, UTC)).toEqual({ routines: 0, activities: 0, activeDays: 0 })
  })
})

describe('monthMarkers', () => {
  const entries = [
    session(at(2026, 11, 3, 8), 3, 'stretch'),
    session(at(2026, 11, 3, 19), 3, 'workout'),
    activity(at(2026, 11, 3, 12)),
    activity(at(2026, 11, 10, 7)),
    session(at(2026, 11, 12), 0, 'workout'),
    session(at(2026, 11, 15, 9), 2, 'meditation'),
  ]
  const m = monthMarkers(entries, 2026, 11, UTC)
  it('has one marker per day in order', () => {
    expect(m).toHaveLength(30)
    expect(m[0].date).toBe('2026-11-01')
    expect(m[29]).toMatchObject({ date: '2026-11-30', day: 30 })
  })
  it('flags kinds and takes the most recent category', () => {
    expect(m[2]).toMatchObject({ routine: true, logged: true, category: 'workout' })
    expect(m[9]).toMatchObject({ routine: false, logged: true, category: ACTIVITY_CATEGORY })
    expect(m[14]).toMatchObject({ routine: true, logged: false, category: 'meditation' })
  })
  it('ignores zero-step sessions and leaves empty days blank', () => {
    expect(m[11]).toEqual({ date: '2026-11-12', day: 12, routine: false, logged: false })
  })
  it('uses an activity as the category when it is the latest', () => {
    const x = monthMarkers([session(at(2026, 11, 3, 8), 3, 'stretch'), activity(at(2026, 11, 3, 20))], 2026, 11, UTC)
    expect(x[2].category).toBe(ACTIVITY_CATEGORY)
  })
  it('is order independent', () => {
    const x = monthMarkers([...entries].reverse(), 2026, 11, UTC)
    expect(x[2].category).toBe('workout')
  })
  it('sizes February correctly', () => {
    expect(monthMarkers([], 2028, 2, UTC)).toHaveLength(29)
  })
})

describe('weekStrip', () => {
  const entries = [
    session(at(2026, 11, 25, 7), 3, 'stretch'),
    session(at(2026, 11, 25, 18), 3, 'workout'),
    activity(at(2026, 11, 23)),
    session(at(2026, 11, 21), 0, 'workout'),
    session(at(2026, 11, 19), 3, 'mobility'),
    session(at(2026, 11, 18), 3, 'old'),
  ]
  const w = weekStrip(entries, TODAY, UTC)
  it('returns seven days ending today, oldest first, with a today marker', () => {
    expect(w.map((d) => d.date)).toEqual(['2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23', '2026-11-24', '2026-11-25'])
    expect(w.filter((d) => d.isToday).map((d) => d.date)).toEqual(['2026-11-25'])
  })
  it('gives each day its most recent category, activities as the activity marker', () => {
    expect(w[6]).toMatchObject({ active: true, category: 'workout' })
    expect(w[4]).toMatchObject({ active: true, category: ACTIVITY_CATEGORY })
    expect(w[0]).toMatchObject({ active: true, category: 'mobility' })
  })
  it('leaves inactive and zero-step days empty and excludes older days', () => {
    expect(w[2]).toMatchObject({ active: false, category: undefined })
    expect(w[1].active).toBe(false)
    expect(w.some((d) => d.category === 'old')).toBe(false)
  })
  it('keeps today marked when nothing was done', () => {
    const e = weekStrip([], TODAY, UTC)
    expect(e[6]).toMatchObject({ isToday: true, active: false })
  })
})
