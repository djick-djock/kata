import { useEffect, useState } from 'react'
import { listSessions } from '../data/sessions'
import { homeWeek, sessionToEntry, type HomeWeek } from './home-week'
import type { DayEntry } from './streak'

/**
 * Loads the history entries behind Home's week strip and streak. Extend `load` to merge logged
 * activities (kind 'activity') into the same entry list.
 */
async function load(): Promise<DayEntry[]> {
  const sessions = await listSessions()
  return sessions.map(sessionToEntry)
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
