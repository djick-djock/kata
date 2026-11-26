import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { drawingFor, type Category } from '../catalog'
import type { KataRoutine } from '../data/routine-types'
import { listRoutines } from '../data/routines'
import { formatLength } from '../routines/format'
import { firstExerciseRef, routineTotal, stepCount } from '../routines/model'
import { Drawing } from '../ui/Drawing'
import { PlayIcon, SettingsIcon } from '../ui/Icons'
import { KataMark } from '../ui/KataMark'
import { CATEGORY_LABEL } from './exercise-format'
import './exercises.css'
import './home.css'

function greeting(d: Date) {
  const h = d.getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

const catColor = (c: Category) => `var(--color-category-${c === 'meditation' ? 'mobility' : c})`
const art = (r: KataRoutine) => {
  const ref = firstExerciseRef(r)
  return <Drawing svg={ref ? drawingFor(ref.exerciseId, ref.variantId) : undefined} category={r.category} label={r.name} />
}

export function Home() {
  const now = new Date()
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const [routines, setRoutines] = useState<KataRoutine[] | null>(null)
  useEffect(() => {
    let live = true
    void listRoutines().then((r) => live && setRoutines(r), () => live && setRoutines([]))
    return () => { live = false }
  }, [])

  const pinned = routines?.find((r) => r.pinned)
  const others = (routines ?? []).filter((r) => !r.pinned && stepCount(r) > 0)
  const pinnedTotal = pinned && routineTotal(pinned)
  const moves = pinned ? stepCount(pinned) : 0

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <KataMark />
          <span>Kata</span>
        </div>
        <Link to="/settings" className="icon-btn" aria-label="Settings">
          <SettingsIcon />
        </Link>
      </div>
      <p className="screen-sub">{date}</p>
      <h1 className="screen-title">{greeting(now)}</h1>

      {routines === null ? null : pinned && pinnedTotal ? (
        <Link to={`/play/${pinned.id}`} className="pinned" aria-label={`Start ${pinned.name}`} data-testid="pinned">
          <div className="pinned__art">{art(pinned)}</div>
          <div className="pinned__text">
            <span className="pinned__kicker">Pinned</span>
            <span className="pinned__name">{pinned.name}</span>
            <span className="pinned__meta">{moves} {moves === 1 ? 'move' : 'moves'} · {formatLength(pinnedTotal.seconds, pinnedTotal.approximate)}</span>
          </div>
          <span className="pinned__go" aria-hidden="true"><PlayIcon size={26} /></span>
        </Link>
      ) : (
        <div className="home__none">
          <strong>Nothing pinned yet</strong>
          Pin a routine from its screen to start it here in one tap.
        </div>
      )}

      {routines !== null && (
        <>
          <div className="home__head">
            <h2 className="home__h">Quick start</h2>
            <Link to="/routines" className="home__all">All routines</Link>
          </div>
          {others.length === 0 ? (
            <p className="no-match">{routines.length === 0 ? 'No routines yet. Build one in Routines.' : 'No other routines to start.'}</p>
          ) : (
            <ul className="qlist" data-testid="quick-start">
              {others.map((r) => {
                const d = routineTotal(r)
                return (
                  <li key={r.id}>
                    <Link to={`/play/${r.id}`} className="qcard" aria-label={`Start ${r.name}`}>
                      <div className="qcard__art">{art(r)}</div>
                      <span className="qcard__name">{r.name}</span>
                      <span className="qcard__meta"><span className="dot" style={{ background: catColor(r.category) }} />{CATEGORY_LABEL[r.category]} · {formatLength(d.seconds, d.approximate)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </>
  )
}
