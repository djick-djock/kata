import { Link, useLocation } from 'react-router-dom'
import type { FinishedSession } from '../player/PlayerRun'
import { formatClock } from '../routines/format'
import '../screens/exercises.css'

/** Placeholder: ticket 06 replaces this with the real completion screen and saves the session. */
export function SessionComplete() {
  const done = useLocation().state as FinishedSession | null
  if (!done) return <div className="detail"><div className="detail__scroll"><p className="no-match">No session to show.</p><Link to="/routines" className="btn">Routines</Link></div></div>
  const r = done.result
  return (
    <div className="detail">
      <div className="detail__scroll">
        <h1 className="detail__title" data-testid="complete-title">{r.completed ? 'Session complete' : `Stopped at ${r.percent}%`}</h1>
        <p className="no-match" data-testid="complete-stats">
          {done.routineName} · {formatClock(r.elapsedMs / 1000)} · {r.stepsDone} / {r.stepsTotal} steps · {r.roundsDone} / {r.roundsTotal} rounds
        </p>
        <Link to={done.routineId ? `/routines/${done.routineId}` : '/routines'} className="btn btn--primary">Back to routine</Link>
      </div>
    </div>
  )
}
