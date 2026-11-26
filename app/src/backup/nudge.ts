/** Last backup time is device-local (localStorage), deliberately NOT in the settings table: it is not part of a backup. */
const KEY = 'kata.lastBackupAt'
export const NUDGE_AFTER_DAYS = 14
const DAY = 86_400_000

export function getLastBackup(): number | null {
  try {
    const n = Number(localStorage.getItem(KEY))
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}
export function setLastBackup(at: number): void {
  try {
    localStorage.setItem(KEY, String(at))
    window.dispatchEvent(new Event('kata-backup'))
  } catch {
    /* storage unavailable: the nudge simply stays */
  }
}

/** Whole days since the last backup, or null if never. */
export function daysSince(last: number | null, now: number): number | null {
  return last === null ? null : Math.max(0, Math.floor((now - last) / DAY))
}

/** Pure: nudge when never backed up or strictly more than 14 days ago. */
export function shouldNudge(last: number | null, now: number): boolean {
  return last === null || now - last > NUDGE_AFTER_DAYS * DAY
}

export function lastBackupLabel(last: number | null, now: number): string {
  const d = daysSince(last, now)
  if (d === null) return 'Never'
  return d === 0 ? 'Today' : d === 1 ? '1 day ago' : `${d} days ago`
}
