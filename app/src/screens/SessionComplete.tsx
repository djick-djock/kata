import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { drawingFor, type Category } from '../catalog'
import type { KataRoutine } from '../data/routine-types'
import { loadRoutine } from '../data/routines'
import { getSession, setSessionFeel, type Feel, type SessionRow } from '../data/sessions'
import { formatClock } from '../routines/format'
import { firstExerciseRef } from '../routines/model'
import { FeelChooser } from '../ui/FeelChooser'
import { Drawing } from '../ui/Drawing'
import './complete.css'
import './exercises.css'

/** Router state for this screen: the saved session (the player screen saves it before navigating here). */
export interface CompleteState {
  sessionId: string
}

/** Shown after a session ends. Reads the stored session, so it never saves anything itself. */
export function SessionComplete() {
  const state = useLocation().state as CompleteState | null
  const sessionId = state?.sessionId
  const [session, setSession] = useState<SessionRow | null | undefined>(undefined)
  const [routine, setRoutine] = useState<KataRoutine | null>(null)

  useEffect(() => {
    let live = true
    if (!sessionId) return
    getSession(sessionId).then(
      async (s) => {
        if (!live) return
        setSession(s ?? null)
        const r = s?.routineId ? await loadRoutine(s.routineId) : undefined
        if (live) setRoutine(r ?? null)
      },
      () => live && setSession(null),
    )
    return () => { live = false }
  }, [sessionId])

  if (!sessionId || session === null) {
    return <div className="detail"><div className="detail__scroll"><p className="no-match">No session to show.</p><Link to="/" className="btn">Home</Link></div></div>
  }
  if (session === undefined) return <div className="detail" />

  async function pick(f: Feel) {
    if (!session) return
    const next = session.feel === f ? undefined : f
    setSession({ ...session, feel: next })
    await setSessionFeel(session.id, next)
  }

  const ref = routine ? firstExerciseRef(routine) : undefined
  const category = (session.category || 'strength') as Category
  const partial = !session.completed
  return (
    <div className="detail complete">
      <div className="detail__scroll complete__scroll">
        <div className="complete__art">
          <Drawing svg={ref ? drawingFor(ref.exerciseId, ref.variantId) : undefined} exerciseId={ref?.exerciseId} variantId={ref?.variantId} category={category} label={session.routineName} />
        </div>
        <p className={`complete__status${partial ? ' complete__status--partial' : ''}`} data-testid="complete-title">
          {partial ? `Stopped early · ${session.percent}% done · saved to history` : 'Session complete · saved to history'}
        </p>
        <h1 className="complete__name">{session.routineName}</h1>
        <dl className="complete__stats" data-testid="complete-stats">
          <div><dd>{formatClock(session.durationSeconds)}</dd><dt>Duration</dt></div>
          <div><dd>{session.stepsDone} / {session.stepsTotal}</dd><dt>Steps done</dt></div>
          <div><dd>{partial ? `${session.roundsDone} / ${session.roundsTotal}` : session.roundsTotal}</dd><dt>Rounds</dt></div>
        </dl>
        <FeelChooser feel={session.feel} onPick={(f) => void pick(f)} />
      </div>
      <div className="complete__cta">
        <Link to="/history" className="btn btn--primary btn--block btn--tall" replace>See history</Link>
        <Link to={session.routineId && routine ? `/routines/${session.routineId}` : '/routines'} className="complete__back" replace>Back to routine</Link>
      </div>
    </div>
  )
}
