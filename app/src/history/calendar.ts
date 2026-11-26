import { dayKey, daysInMonth, type DayEntry } from './streak'
import type { ActivityRow, SessionRow } from '../data/db'
import { activityLabel, activityPace, formatPace } from '../data/activities'

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

/** Anything with a start time can be a logged activity for the engine. */
export function activityToEntry(a: Pick<ActivityRow, 'startedAt'>): DayEntry {
  return { startedAt: a.startedAt, kind: 'activity' }
}

/** The one place sessions and logged activities become engine input. */
export function toEntries(sessions: readonly SessionRow[], activities: readonly Pick<ActivityRow, 'startedAt'>[] = []): DayEntry[] {
  return [
    ...sessions.map((s): DayEntry => ({ startedAt: s.startedAt, kind: 'session', category: s.category, stepsDone: s.stepsDone })),
    ...activities.map(activityToEntry),
  ]
}

export interface ActivityMonthTotals {
  /** Kilometres summed over all activities with a distance in the month. */
  distanceKm: number
  /** Activities of type 'run' in the month. */
  runs: number
}

/** Distance (all types) and run count for a month (month is 1-12), in local days of the given zone. */
export function activityMonthTotals(activities: readonly Pick<ActivityRow, 'startedAt' | 'type' | 'distanceKm'>[], year: number, month: number, timeZone?: string): ActivityMonthTotals {
  let distanceKm = 0
  let runs = 0
  for (const a of activities) {
    const k = dayKey(a.startedAt, timeZone)
    if (Number(k.slice(0, 4)) !== year || Number(k.slice(5, 7)) !== month) continue
    if (a.distanceKm !== undefined && Number.isFinite(a.distanceKm) && a.distanceKm > 0) distanceKm += a.distanceKm
    if (a.type === 'run') runs++
  }
  return { distanceKm: Math.round(distanceKm * 100) / 100, runs }
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
  kind: 'session' | 'activity'
  id: string
  /** Where the row opens. */
  to: string
  name: string
  category: string
  when: string
  /** Activity rows: "28:40 · 5:31 /km" after the time. */
  detail?: string
  /** "Done", "72%" or "Logged". */
  status: string
  partial: boolean
  startedAt: number
}

/** "28:40" or "1:05:10". */
export function formatDuration(totalSeconds: number): string {
  const t = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** "5.2" (at most two decimals, no trailing zeros). */
export const formatDistance = (km: number): string => String(Math.round(km * 100) / 100)

/** Activity row text: "Run · 5.2 km", and "28:40 · 5:31 /km" (distance and pace only when known). */
export function activityRowText(a: Pick<ActivityRow, 'type' | 'durationSeconds' | 'distanceKm'>): { name: string; detail: string } {
  const hasDistance = a.distanceKm !== undefined && a.distanceKm > 0
  const pace = activityPace(a)
  return {
    name: hasDistance ? `${activityLabel(a.type)} · ${formatDistance(a.distanceKm!)} km` : activityLabel(a.type),
    detail: [formatDuration(a.durationSeconds), pace !== undefined ? `${formatPace(pace)} /km` : ''].filter(Boolean).join(' · '),
  }
}

/** Sessions and logged activities in one list, newest first. */
export function recentItems(sessions: readonly SessionRow[], now: number, limit = 20, timeZone?: string, activities: readonly ActivityRow[] = []): RecentItem[] {
  const items: RecentItem[] = [
    ...sessions.map((s): RecentItem => ({
      kind: 'session',
      id: s.id,
      to: `/history/${s.id}`,
      name: s.routineName,
      category: s.category,
      when: formatWhen(s.startedAt, now, timeZone),
      status: s.completed ? 'Done' : `${Math.round(s.percent)}%`,
      partial: !s.completed,
      startedAt: s.startedAt,
    })),
    ...activities.map((a): RecentItem => ({
      kind: 'activity',
      id: a.id,
      to: `/log/${a.id}`,
      ...activityRowText(a),
      category: 'run',
      when: formatWhen(a.startedAt, now, timeZone),
      status: 'Logged',
      partial: false,
      startedAt: a.startedAt,
    })),
  ]
  return items.sort((a, b) => b.startedAt - a.startedAt).slice(0, limit)
}
