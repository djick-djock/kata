import { addDays, currentStreak, dayKey, weekStrip, type DayEntry, type WeekDay } from './streak'

/** The slice of a stored session the history engine needs. */
export interface SessionLike {
  startedAt: number
  category: string
  stepsDone: number
}

export function sessionToEntry(s: SessionLike): DayEntry {
  return { startedAt: s.startedAt, kind: 'session', category: s.category, stepsDone: s.stepsDone }
}

/** Monday of the week containing the given day key (weeks run Monday to Sunday). */
export function weekStart(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7 // Mon = 0
  return addDays(key, -dow)
}

/** Colour token suffix for a day circle: meditation shares mobility's colour, logged activities use the gold run colour. */
export function weekColor(category: string | undefined): string | undefined {
  if (!category) return undefined
  if (category === 'activity') return 'var(--color-category-run)'
  return `var(--color-category-${category === 'meditation' ? 'mobility' : category})`
}

export interface HomeWeek {
  /** Monday to Sunday of the current week; days after today are empty. */
  days: WeekDay[]
  streak: number
}

export function homeWeek(entries: readonly DayEntry[], today: number | Date, timeZone?: string): HomeWeek {
  const todayKey = dayKey(today, timeZone)
  const sunday = addDays(weekStart(todayKey), 6)
  const days = weekStrip(entries, sunday, timeZone).map((d) => ({ ...d, isToday: d.date === todayKey }))
  return { days, streak: currentStreak(entries, todayKey, timeZone) }
}
