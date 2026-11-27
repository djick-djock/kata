import { useEffect, useMemo, useRef, useState } from 'react'
import { findExercise, drawingFor, type Category } from '../catalog'
import { DEFAULT_SETTINGS, type PlayerSettings } from '../data/settings'
import type { CuePlayer } from '../audio/cue-player'
import { createSession, type Routine, type SessionMode, type SessionResult, type SessionState } from '../engine'
import { createWakeLock } from '../platform/wake-lock'
import { vibrate } from '../platform/vibration'
import { Drawing } from '../ui/Drawing'
import { Sheet } from '../ui/Sheet'
import { blockCountText, overallPercent, doneLabel, elapsedText, nextCardText, phaseLabel, pulseFor, ringFraction, timeLeftText, toneFor, vibrationFor, type Pulse } from './logic'
import './player.css'

export interface FinishedSession {
  result: SessionResult
  routineId?: string
  routineName: string
  mode: SessionMode
  startedAt: number
  finishedAt: number
}

/** Interval between engine updates; timing itself derives from the clock, never from this. */
export const UPDATE_INTERVAL_MS = 200

interface Props {
  routine: Routine
  mode: SessionMode
  settings: PlayerSettings
  cuePlayer: CuePlayer
  /** Seam for ticket 06: called once when the session finishes or is stopped early. */
  onFinished: (done: FinishedSession) => void
  /** Injected clock in ms (default Date.now). */
  now?: () => number
}

const Close = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
)
const Prev = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 6v12" /><path d="M18 6.5v11a.8.8 0 0 1-1.2.7l-8-5.5a.8.8 0 0 1 0-1.4l8-5.5a.8.8 0 0 1 1.2.7z" /></svg>
)
const Next = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6v12" /><path d="M6 6.5v11a.8.8 0 0 0 1.2.7l8-5.5a.8.8 0 0 0 0-1.4l-8-5.5A.8.8 0 0 0 6 6.5z" /></svg>
)
const PauseGlyph = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1.2" /><rect x="14" y="4.5" width="4" height="15" rx="1.2" /></svg>
)
const PlayGlyph = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
)
const Check = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)

const RING = 250
const STROKE = 7
const R = (RING - STROKE) / 2

function Ring({ fraction }: { fraction: number }) {
  return (
    <svg className="pl__ringsvg" viewBox={`0 0 ${RING} ${RING}`} aria-hidden="true">
      <circle cx={RING / 2} cy={RING / 2} r={R} fill="none" strokeWidth={STROKE} className="pl__track" />
      {fraction > 0 && (
        <circle
          cx={RING / 2} cy={RING / 2} r={R} fill="none" strokeWidth={STROKE} strokeLinecap="round" className="pl__arc"
          pathLength={1} strokeDasharray={`${fraction} 1`} transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
        />
      )}
    </svg>
  )
}

export function PlayerRun({ routine, mode, settings, cuePlayer, onFinished, now = Date.now }: Props) {
  const session = useMemo(
    () => createSession({ routine, mode, settings: { switchPauseSeconds: settings.switchPauseSeconds ?? DEFAULT_SETTINGS.switchPauseSeconds }, now }),
    // One session per mount: later settings changes must not reset a running session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const [view, setView] = useState<SessionState>(() => session.getState())
  const [pulse, setPulse] = useState<(Pulse & { id: number }) | null>(null)
  const [confirming, setConfirming] = useState(false)
  const pausedByConfirm = useRef(false)
  const settingsRef = useRef(settings)
  const finishedRef = useRef(onFinished)
  const reported = useRef(false)
  const startedAt = useRef(now())
  const pulseId = useRef(0)
  useEffect(() => {
    settingsRef.current = settings
    finishedRef.current = onFinished
  })

  useEffect(() => {
    const unsubscribe = session.subscribe((u) => {
      setView(u.state)
      if (u.cues.length) {
        const s = settingsRef.current
        cuePlayer.setEnabled(s.sound)
        cuePlayer.setVolume(s.volume)
        for (const cue of u.cues) {
          if (s.sound) cuePlayer.play(cue.kind)
          if (s.vibration) vibrate(vibrationFor(cue))
        }
        const last = u.cues[u.cues.length - 1]
        if (s.pulse !== false) setPulse({ ...pulseFor(last), id: ++pulseId.current })
      }
      if ((u.state.status === 'finished' || u.state.status === 'stopped') && u.state.result && !reported.current) {
        reported.current = true
        finishedRef.current({ result: u.state.result, routineId: routine.id, routineName: routine.name, mode, startedAt: startedAt.current, finishedAt: now() })
      }
    })
    session.start()
    const timer = window.setInterval(() => session.update(), UPDATE_INTERVAL_MS)
    const onVisible = () => session.update()
    document.addEventListener('visibilitychange', onVisible)
    const wakeLock = createWakeLock(() => {})
    void wakeLock.request()
    return () => {
      unsubscribe()
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      void wakeLock.dispose()
    }
  }, [session, cuePlayer, routine.id, routine.name, mode])

  const items = session.plan.items
  const item = view.current
  if (!item || view.status === 'finished' || view.status === 'stopped') {
    return <div className="pl pl--dark"><p className="pl__final">Finishing…</p></div>
  }

  const tone = toneFor(view)
  const waiting = view.status === 'waiting'
  const paused = view.status === 'paused'
  const isReps = item.phase === 'reps'
  const resting = item.phase === 'rest' || item.phase === 'switch'
  const shown = item.phase === 'rest' ? view.next : item
  const exercise = shown?.ref?.type === 'exercise' ? findExercise(shown.ref.exerciseId) : undefined
  const category: Category = exercise?.category ?? 'strength'
  const svg = shown?.ref?.type === 'exercise' ? drawingFor(shown.ref.exerciseId, shown.ref.variantId) : undefined
  const block = view.block
  const roundText = block && block.rounds > 1 ? ` · Round ${block.round} of ${block.rounds}` : ''
  const sideSuffix = shown?.side ? ` (${shown.side})` : ''
  const name = resting && shown ? `Up next: ${shown.name}${sideSuffix}` : item.name
  const fraction = ringFraction(view.stepRemainingMs, item)
  const stepNo = Math.min(session.plan.stepCount, item.stepSeq + 1)
  const meta2 = isReps && !waiting ? `Step ${stepNo} of ${session.plan.stepCount}` : timeLeftText(view.routineRemainingMs, view.approximate)
  const bigPanel = isReps || waiting // dark layout without a ring

  const askStop = () => {
    pausedByConfirm.current = view.status === 'running' && !isReps
    if (pausedByConfirm.current) session.pause()
    setConfirming(true)
  }
  const keepGoing = () => {
    setConfirming(false)
    if (pausedByConfirm.current) session.resume()
    pausedByConfirm.current = false
  }

  return (
    <div className={`pl pl--${tone}`} data-phase={item.phase} data-status={view.status}>
      {pulse && <div key={pulse.id} className={`pl__pulse pl__pulse--${pulse.kind}`} style={{ animationDuration: `${pulse.ms}ms` }} data-testid="pulse" aria-hidden="true" />}
      <header className="pl__top">
        <button type="button" className="pl__close" aria-label="Stop session" onClick={askStop}><Close /></button>
        <div className="pl__meta">
          <span>{blockCountText(view.blockNumber, view.blockCount)} · {block?.name ?? ''}{roundText}</span>
          <strong data-testid="time-left">{meta2}</strong>
        </div>
      </header>
      <div className="pl__overall" role="progressbar" aria-label="Routine progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overallPercent(view.overallFraction)} data-testid="overall">
        <i style={{ width: `${overallPercent(view.overallFraction)}%` }} />
      </div>
      <div className="pl__segments" role="img" aria-label={`Step ${(block?.segments.findIndex((s) => s.status === 'current') ?? 0) + 1} of ${block?.segments.length ?? 0} in this block`}>
        {block?.segments.map((s) => (
          <span key={s.stepInBlock} className={`pl__seg pl__seg--${s.status}`}>
            <i style={{ width: `${Math.round((s.status === 'done' ? 1 : s.status === 'current' ? s.fraction : 0) * 100)}%` }} />
          </span>
        ))}
      </div>

      <div className="pl__art"><Drawing svg={svg} category={category} label={shown?.name ?? item.name} /></div>

      <div className="pl__label" data-testid="phase-label">{phaseLabel(item, view.status)}</div>
      <h1 className="pl__name" data-testid="name">{name}</h1>

      {bigPanel ? (
        <div className="pl__big">
          {isReps ? (
            <div className="pl__count" data-testid="reps">×{item.reps}</div>
          ) : (
            <div className="pl__count" data-testid="ready-time">{elapsedText(item.durationMs ?? 0)}</div>
          )}
          <p className="pl__sub">
            {waiting ? (isReps ? 'Start when you are ready' : 'Start when you are ready') : <>No countdown · <b data-testid="elapsed">{elapsedText(view.stepElapsedMs)}</b> elapsed</>}
          </p>
        </div>
      ) : (
        <div className="pl__ring">
          <Ring fraction={fraction ?? 0} />
          <div className="pl__ringtext">
            <div className="pl__time" data-testid="step-time">{elapsedText((view.stepSecondsLeft ?? 0) * 1000)}</div>
            <div className="pl__of">of {elapsedText(item.durationMs ?? 0)}</div>
          </div>
        </div>
      )}

      {bigPanel ? (
        <div className="pl__bottom">
          {waiting ? (
            <button type="button" className="pl__cta" onClick={() => session.start()}>Start</button>
          ) : (
            <button type="button" className="pl__cta" onClick={() => session.repsDone()}><Check /> {doneLabel(items, item.index)}</button>
          )}
          <div className="pl__links">
            <button type="button" className="pl__link" onClick={() => session.previous()}>‹ Back</button>
            <button type="button" className="pl__link" onClick={() => session.skip()}>Skip ›</button>
          </div>
        </div>
      ) : (
        <>
          <div className="pl__next" data-testid="next"><span>Next</span><b>{nextCardText(items, item.index)}</b></div>
          <div className="pl__controls">
            <button type="button" className="pl__round" aria-label="Previous" onClick={() => session.previous()}><Prev /></button>
            <button type="button" className="pl__main" aria-label={paused ? 'Resume' : 'Pause'} onClick={() => (paused ? session.resume() : session.pause())}>
              {paused ? <PlayGlyph /> : <PauseGlyph />}
            </button>
            <button type="button" className="pl__round" aria-label="Skip" onClick={() => session.skip()}><Next /></button>
          </div>
        </>
      )}

      {confirming && (
        <Sheet title="Stop this session?" onClose={keepGoing} action={<span />}>
          <p className="sheet__hint">What you have done so far is kept as a partial session.</p>
          <button type="button" className="btn btn--danger btn--tall btn--block" onClick={() => { setConfirming(false); session.stop() }}>Stop session</button>
          <button type="button" className="btn btn--secondary btn--tall btn--block" onClick={keepGoing}>Keep going</button>
        </Sheet>
      )}
    </div>
  )
}
