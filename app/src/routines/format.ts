/** m:ss, or h:mm:ss from an hour up. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`
}

/** Header total: "~14:00" when reps steps make it an estimate. */
export function formatTotal(seconds: number, approximate: boolean): string {
  return `${approximate ? '~' : ''}${formatClock(seconds)}`
}

/** Card length: "~14 min", "5 min", "45 s". */
export function formatLength(seconds: number, approximate: boolean): string {
  const mark = approximate ? '~' : ''
  if (seconds <= 0) return '0 min'
  if (seconds < 60) return `${mark}${seconds} s`
  return `${mark}${Math.max(1, Math.round(seconds / 60))} min`
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/** "Today", "Yesterday", "Sun 22" within the last week, "Nov 12" before, "Not played yet". */
export function formatLast(ts: number | undefined, now: Date = new Date()): string {
  if (!ts) return 'Not played yet'
  const d = new Date(ts)
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${d.getDate()}`
  const base = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return d.getFullYear() === now.getFullYear() ? base : `${base}, ${d.getFullYear()}`
}
