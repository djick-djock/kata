import { dayKey, daysInMonth, type DayEntry } from './streak'
import type { SessionRow } from '../data/db'

export interface YearMonth {
  year: number
  /** 1-12 */
  month: number
}

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const monthLabel = ({ year, month }: YearMonth) => `${MONTH_NAMES[month - 1]} ${year}`

export function monthOf(key: string): YearMonth {
  return { year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) }
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const i = year * 12 + (month - 1) + delta
  return { year: Math.floor(i / 12), month: (i % 12) + 1 }
}

/** Months are never offered beyond the current one. */
export function canGoNext(shown: YearMonth, current: YearMonth): boolean {
  return shown.year * 12 + shown.month < current.year * 12 + current.month
}

/** Monday-first grid cells: null for the blanks before the 1st, then day numbers 1..N. */
export function monthGrid({ year, month }: YearMonth): (number | null)[] {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay() // 0 = Sunday
  const blanks = (first + 6) % 7
  return [...Array<null>(blanks).fill(null), ...Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1)]
}

/** The one place sessions become engine input; activities become a second kind here later. */
export function toEntries(sessions: readonly SessionRow[]): DayEntry[] {
  return sessions.map((s) => ({ startedAt: s.startedAt, kind: 'session', category: s.category, stepsDone: s.stepsDone }))
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function clock(ms: number): string {
  const d = new Date(ms)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** "Today 14:12", "Yesterday 7:30", "Sat 21 6:10"; the day follows local time. */
export function formatWhen(startedAt: number, now: number, timeZone?: string): string {
  const key = dayKey(startedAt, timeZone)
  const today = dayKey(now, timeZone)
  const yesterday = dayKey(now - 24 * 3600 * 1000, timeZone)
  const d = new Date(startedAt)
  const day = key === today ? 'Today' : key === yesterday ? 'Yesterday' : `${WEEKDAYS[d.getDay()]} ${Number(key.slice(8))}${key.slice(0, 7) === today.slice(0, 7) ? '' : ` ${MONTH_NAMES[Number(key.slice(5, 7)) - 1].slice(0, 3)}`}`
  return `${day} · ${clock(startedAt)}`
}

export interface RecentItem {
  id: string
  name: string
  category: string
  when: string
  /** "Done" or "72%". */
  status: string
  partial: boolean
}

export function recentItems(sessions: readonly SessionRow[], now: number, limit = 20, timeZone?: string): RecentItem[] {
  return [...sessions]
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, limit)
    .map((s) => ({
      id: s.id,
      name: s.routineName,
      category: s.category,
      when: formatWhen(s.startedAt, now, timeZone),
      status: s.completed ? 'Done' : `${Math.round(s.percent)}%`,
      partial: !s.completed,
    }))
}
