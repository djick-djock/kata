import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { createCuePlayer, type CuePlayer } from '../audio/cue-player'
import { loadRoutine } from '../data/routines'
import { saveSession } from '../data/sessions'
import type { KataRoutine } from '../data/routine-types'
import { useSettings } from '../data/settings'
import type { SessionMode } from '../engine'
import { PlayerRun, type FinishedSession } from '../player/PlayerRun'
import { formatLength } from '../routines/format'
import { routineTotal, stepCount, uid } from '../routines/model'
import '../player/player.css'
import '../screens/exercises.css'
import '../screens/routines.css'

/** Where a finished or stopped session goes (it is saved first; the screen only reads it). */
export const SESSION_COMPLETE_PATH = '/session-complete'

/** Player route: a ready screen (mode choice, and the user gesture that unlocks audio), then the session. */
export function Play() {
  const { routineId = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const settings = useSettings()
  const [routine, setRoutine] = useState<KataRoutine | null | undefined>(undefined)
  const [mode, setMode] = useState<SessionMode>(params.get('mode') === 'step' ? 'step-by-step' : 'play-all')
  const [started, setStarted] = useState(false)
  const cuePlayer = useRef<CuePlayer | null>(null)

  useEffect(() => {
    let live = true
    loadRoutine(routineId).then((r) => live && setRoutine(r ?? null), () => live && setRoutine(null))
    return () => { live = false }
  }, [routineId])

  const back = `/routines/${routineId}`
  if (routine === undefined || !settings) return <div className="pl pl--dark" />
  if (routine === null) {
    return (
      <div className="pl pl--dark">
        <div className="pl__ready"><h1 className="pl__title">Routine not found</h1><Link to="/routines" className="pl__link">‹ Routines</Link></div>
      </div>
    )
  }

  const total = routineTotal(routine)
  const steps = stepCount(routine)

  if (!started) {
    const start = () => {
      // Audio is created only here, inside the user's tap.
      cuePlayer.current ??= createCuePlayer()
      cuePlayer.current.unlock()
      setStarted(true)
    }
    return (
      <div className="pl pl--dark">
        <header className="pl__top"><Link to={back} className="pl__close" aria-label="Close"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></Link></header>
        <div className="pl__ready">
          <h1 className="pl__title">{routine.name}</h1>
          <p className="pl__summary">{steps} {steps === 1 ? 'step' : 'steps'} · {formatLength(total.seconds, total.approximate)}</p>
          <div className="pl__modes" role="radiogroup" aria-label="Mode">
            <button type="button" role="radio" aria-checked={mode === 'play-all'} className="pl__mode" onClick={() => setMode('play-all')}><strong>Play all</strong><span>Moves on by itself</span></button>
            <button type="button" role="radio" aria-checked={mode === 'step-by-step'} className="pl__mode" onClick={() => setMode('step-by-step')}><strong>Step by step</strong><span>You start each step</span></button>
          </div>
        </div>
        <div className="pl__bottom">
          <button type="button" className="pl__cta" disabled={steps === 0} onClick={start}>Start</button>
        </div>
      </div>
    )
  }

  const onFinished = (done: FinishedSession) => {
    // The id is fixed before saving, and saving the same id twice is a no-op, so this is written exactly once.
    const sessionId = uid()
    const go = () => navigate(SESSION_COMPLETE_PATH, { replace: true, state: { sessionId } })
    void saveSession({ ...done, id: sessionId, category: routine.category }).then(go, go)
  }
  return <PlayerRun routine={routine} mode={mode} settings={settings} cuePlayer={cuePlayer.current!} onFinished={onFinished} />
}
