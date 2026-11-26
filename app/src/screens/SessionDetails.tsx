import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteSession, getSession, setSessionFeel, type Feel, type SessionRow } from '../data/sessions'
import { formatClock } from '../routines/format'
import { FeelChooser } from '../ui/FeelChooser'
import { BackIcon, TrashIcon } from '../ui/Icons'
import { Sheet } from '../ui/Sheet'
import './complete.css'
import './exercises.css'
import './history.css'

/** "Tuesday 24 November 2026 at 14:12", in local time. */
function formatStart(ms: number): string {
  const d = new Date(ms)
  const date = d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return `${date} at ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** One session from History: every recorded field, the feeling (changeable) and delete. */
export function SessionDetails() {
  const { sessionId = '' } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionRow | null | undefined>(undefined)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    let live = true
    getSession(sessionId).then((s) => live && setSession(s ?? null), () => live && setSession(null))
    return () => { live = false }
  }, [sessionId])

  if (session === undefined) return <div className="detail" />
  if (session === null) {
    return <div className="detail"><div className="detail__scroll"><p className="no-match">Session not found.</p><Link to="/history" className="btn" replace>History</Link></div></div>
  }

  async function pick(f: Feel) {
    if (!session) return
    const next = session.feel === f ? undefined : f
    setSession({ ...session, feel: next })
    await setSessionFeel(session.id, next)
  }

  async function remove() {
    if (!session) return
    await deleteSession(session.id)
    navigate('/history', { replace: true })
  }

  const partial = !session.completed
  return (
    <div className="detail">
      <div className="detail__scroll">
        <div className="detail__bar">
          <Link to="/history" className="icon-btn" aria-label="Back to history"><BackIcon /></Link>
        </div>
        <p className={`complete__status sdetail__status${partial ? ' complete__status--partial' : ''}`} data-testid="session-status">
          {partial ? `Stopped early · ${session.percent}% done` : 'Completed'}
        </p>
        <h1 className="sdetail__name">{session.routineName}</h1>
        <p className="sdetail__when" data-testid="session-when">{formatStart(session.startedAt)}</p>
        <dl className="complete__stats" data-testid="session-stats">
          <div><dd>{formatClock(session.durationSeconds)}</dd><dt>Duration</dt></div>
          <div><dd>{session.stepsDone} / {session.stepsTotal}</dd><dt>Steps done</dt></div>
          <div><dd>{partial ? `${session.roundsDone} / ${session.roundsTotal}` : session.roundsTotal}</dd><dt>Rounds</dt></div>
        </dl>
        <dl className="sdetail__rows">
          <div><dt>Result</dt><dd>{partial ? `Partial, ${session.percent}%` : 'Completed, 100%'}</dd></div>
          <div><dt>Mode</dt><dd>{session.mode === 'step-by-step' ? 'Step by step' : 'Play all'}</dd></div>
        </dl>
        <FeelChooser feel={session.feel} onPick={(f) => void pick(f)} />
        <button type="button" className="btn btn--danger sdetail__delete" onClick={() => setConfirming(true)}>
          <TrashIcon />Delete session
        </button>
      </div>
      {confirming && (
        <Sheet title="Delete this session?" onClose={() => setConfirming(false)} action={<span />}>
          <p className="sheet__hint">It is removed from your history and stats. This cannot be undone.</p>
          <button type="button" className="btn btn--danger btn--tall btn--block" onClick={() => void remove()}>Delete session</button>
          <button type="button" className="btn btn--secondary btn--tall btn--block" onClick={() => setConfirming(false)}>Keep it</button>
        </Sheet>
      )}
    </div>
  )
}
