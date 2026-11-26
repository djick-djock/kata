import { useEffect, useState } from 'react'
import { getLastBackup, shouldNudge } from './nudge'

/** Last backup time (live) and whether to nudge. */
export function useBackupStatus(): { last: number | null; nudge: boolean } {
  const [last, setLast] = useState(getLastBackup)
  useEffect(() => {
    const update = () => setLast(getLastBackup())
    window.addEventListener('kata-backup', update)
    return () => window.removeEventListener('kata-backup', update)
  }, [])
  return { last, nudge: shouldNudge(last, Date.now()) }
}
