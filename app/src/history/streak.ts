/**
 * Pure history engine: turns sessions and logged activities into active days, streak, month stats,
 * month markers and the Home week strip. No React, no Dexie, no clock: callers pass plain data and
 * "today". Days are local calendar days keyed "YYYY-MM-DD" in the given IANA time zone (default: the
 * device zone). Nothing is stored, so removing an entry from the input simply changes the result.
 */

/** Marker used in place of a routine category for logged activities. */
export const ACTIVITY_CATEGORY = 'activity'

export interface DayEntry {
  /** Start time, epoch ms. */
  startedAt: number
  kind: 'session' | 'activity'
  /** Routine category for sessions; ignored for activities (they use ACTIVITY_CATEGORY). */
  category?: string
  /** Sessions only: a session with zero steps done is not an active day. Activities ignore this. */
  stepsDone?: number
}

/** Anything with a time: a number (epoch ms), a Date, or an already-computed "YYYY-MM-DD" key. */
export type DayInput = number | Date | string

export interface MonthStats {
  /** Sessions with at least one step done that started in the month. */
  routines: number
  /** Logged activities in the month. */
  activities: number
  /** Distinct active days in the month. */
  activeDays: number
}

export interface DayMarker {
  /** "YYYY-MM-DD" */
  date: string
  /** Day of month, 1-based. */
  day: number
  routine: boolean
  logged: boolean
  /** Category of the most recent counted entry that day (ACTIVITY_CATEGORY for activities). */
  category?: string
}

export interface WeekDay {
  date: string
  isToday: boolean
  active: boolean
  category?: string
}

/** Whether an entry makes its day active. */
export function countsAsActive(e: DayEntry): boolean {
  return e.kind === 'activity' || (e.stepsDone ?? 0) > 0
}

const formatters = new Map<string, Intl.DateTimeFormat>()
function formatter(timeZone?: string): Intl.DateTimeFormat {
  const k = timeZone ?? ''
  let f = formatters.get(k)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hourCycle: 'h23' })
    formatters.set(k, f)
  }
  return f
}

const KEY = /^\d{4}-\d{2}-\d{2}$/
const pad = (n: number, w = 2) => String(n).padStart(w, '0')

/** Local calendar day of an instant in the given IANA zone (default: device zone), as "YYYY-MM-DD". */
export function dayKey(input: DayInput, timeZone?: string): string {
  if (typeof input === 'string') {
    if (!KEY.test(input)) throw new Error(`Invalid day key: ${input}`)
    return input
  }
  const parts = formatter(timeZone).formatToParts(input)
  const get = (t: string) => parts.find((p) => p.type === t)!.value
  return `${get('year').padStart(4, '0')}-${get('month')}-${get('day')}`
}

function parseKey(key: string): { y: number; m: number; d: number } {
  return { y: Number(key.slice(0, 4)), m: Number(key.slice(5, 7)), d: Number(key.slice(8, 10)) }
}

/** Calendar arithmetic on day keys (zone independent, immune to DST). */
export function addDays(key: string, n: number): string {
  const { y, m, d } = parseKey(key)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return `${pad(t.getUTCFullYear(), 4)}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

/** Number of days in a month (month is 1-12). */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/** Day keys of every day in the month (month is 1-12). */
export function monthDays(year: number, month: number): string[] {
  return Array.from({ length: daysInMonth(year, month) }, (_, i) => `${pad(year, 4)}-${pad(month)}-${pad(i + 1)}`)
}

/** Distinct active day keys. A day with several entries counts once. */
export function activeDays(entries: readonly DayEntry[], timeZone?: string): Set<string> {
  const out = new Set<string>()
  for (const e of entries) if (countsAsActive(e)) out.add(dayKey(e.startedAt, timeZone))
  return out
}

/**
 * Consecutive active days ending today, or ending yesterday when today has none yet (a rest day in
 * progress does not zero the streak). Zero when neither today nor yesterday is active.
 */
export function currentStreak(entries: readonly DayEntry[], today: DayInput, timeZone?: string): number {
  const days = activeDays(entries, timeZone)
  const todayKey = dayKey(today, timeZone)
  let cursor = days.has(todayKey) ? todayKey : addDays(todayKey, -1)
  let n = 0
  while (days.has(cursor)) {
    n++
    cursor = addDays(cursor, -1)
  }
  return n
}

function inMonth(key: string, year: number, month: number): boolean {
  const { y, m } = parseKey(key)
  return y === year && m === month
}

/** Routines, activities and active days in a month (month is 1-12). */
export function monthStats(entries: readonly DayEntry[], year: number, month: number, timeZone?: string): MonthStats {
  let routines = 0
  let activities = 0
  const days = new Set<string>()
  for (const e of entries) {
    if (!countsAsActive(e)) continue
    const k = dayKey(e.startedAt, timeZone)
    if (!inMonth(k, year, month)) continue
    days.add(k)
    if (e.kind === 'activity') activities++
    else routines++
  }
  return { routines, activities, activeDays: days.size }
}

function markerCategory(e: DayEntry): string | undefined {
  return e.kind === 'activity' ? ACTIVITY_CATEGORY : e.category
}

/** One marker per day of the month (month is 1-12), in day order, including empty days. */
export function monthMarkers(entries: readonly DayEntry[], year: number, month: number, timeZone?: string): DayMarker[] {
  const latest = new Map<string, number>()
  const markers = new Map<string, DayMarker>(
    monthDays(year, month).map((date) => [date, { date, day: Number(date.slice(8)), routine: false, logged: false }]),
  )
  for (const e of entries) {
    if (!countsAsActive(e)) continue
    const k = dayKey(e.startedAt, timeZone)
    const m = markers.get(k)
    if (!m) continue
    if (e.kind === 'activity') m.logged = true
    else m.routine = true
    if (e.startedAt >= (latest.get(k) ?? -Infinity)) {
      latest.set(k, e.startedAt)
      m.category = markerCategory(e)
    }
  }
  return [...markers.values()]
}

/** Seven days ending today (oldest first) with each day's most recent category and a today flag. */
export function weekStrip(entries: readonly DayEntry[], today: DayInput, timeZone?: string): WeekDay[] {
  const todayKey = dayKey(today, timeZone)
  const keys = Array.from({ length: 7 }, (_, i) => addDays(todayKey, i - 6))
  const latest = new Map<string, DayEntry>()
  for (const e of entries) {
    if (!countsAsActive(e)) continue
    const k = dayKey(e.startedAt, timeZone)
    const cur = latest.get(k)
    if (!cur || e.startedAt >= cur.startedAt) latest.set(k, e)
  }
  return keys.map((date) => {
    const e = latest.get(date)
    return { date, isToday: date === todayKey, active: !!e, category: e ? markerCategory(e) : undefined }
  })
}
