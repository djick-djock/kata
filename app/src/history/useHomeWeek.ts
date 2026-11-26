import { useEffect, useState } from 'react'
import { listSessions } from '../data/sessions'
import { listActivities } from '../data/activities'
import { toEntries } from './calendar'
import { homeWeek, type HomeWeek } from './home-week'
import type { DayEntry } from './streak'

/**
 * Loads the history entries (sessions and logged activities) behind Home's week strip and streak.
 */
async function load(): Promise<DayEntry[]> {
  const [sessions, activities] = await Promise.all([listSessions(), listActivities()])
  return toEntries(sessions, activities)
}

export function useHomeWeek(now: Date): HomeWeek | null {
  const [entries, setEntries] = useState<DayEntry[] | null>(null)
  useEffect(() => {
    let live = true
    void load().then((e) => live && setEntries(e), () => live && setEntries([]))
    return () => { live = false }
  }, [])
  return entries && homeWeek(entries, now)
}
