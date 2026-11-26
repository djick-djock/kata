import { Link } from 'react-router-dom'
import { useBackupStatus } from './useLastBackup'

/** Gentle reminder; renders nothing when a backup is recent. Link is omitted inside Settings. */
export function BackupNudge({ inSettings = false }: { inSettings?: boolean }) {
  const { last, nudge } = useBackupStatus()
  if (!nudge) return null
  return (
    <div className="nudge" role="status">
      <span>{last === null ? "You haven't backed up yet." : "It's been over two weeks since your last backup."}</span>
      {!inSettings && <Link to="/settings" className="text-btn">Back up</Link>}
    </div>
  )
}
