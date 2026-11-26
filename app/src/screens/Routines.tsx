import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES, drawingFor, type Category } from '../catalog'
import { copyRoutine, listRoutines, saveRoutine } from '../data/routines'
import type { KataRoutine } from '../data/routine-types'
import { formatLast, formatLength } from '../routines/format'
import { blankRoutine, firstExerciseRef, routineFromTemplate, routineTotal, stepCount, TEMPLATES } from '../routines/model'
import { Drawing } from '../ui/Drawing'
import { CopyIcon, PinIcon, PlayIcon, PlusIcon, SearchIcon, TemplateIcon } from '../ui/Icons'
import { Sheet } from '../ui/Sheet'
import { CATEGORY_LABEL } from './exercise-format'
import './exercises.css'
import './routines.css'

const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
const catColor = (c: Category) => `var(--color-category-${c === 'meditation' ? 'mobility' : c})`

export function Routines() {
  const navigate = useNavigate()
  const [routines, setRoutines] = useState<KataRoutine[] | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let live = true
    void listRoutines().then((r) => live && setRoutines(r))
    return () => { live = false }
  }, [])

  const shown = useMemo(() => {
    const q = norm(query)
    return (routines ?? []).filter((r) => (!category || r.category === category) && (!q || norm(r.name).includes(q)))
  }, [routines, query, category])

  async function create(make: () => KataRoutine | Promise<KataRoutine | undefined>) {
    const r = await make()
    if (r) navigate(`/routines/${r.id}`)
  }

  return (
    <>
      <div className="topbar">
        <h1 className="screen-title">Routines</h1>
        <button type="button" className="new-btn" onClick={() => setCreating(true)}><PlusIcon />New</button>
      </div>
      <label className="search">
        <SearchIcon />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search routines" aria-label="Search routines" />
      </label>
      <div className="chips" role="group" aria-label="Category">
        <button type="button" className="chip" aria-pressed={category === null} onClick={() => setCategory(null)}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)}>
            <span className="dot" style={{ background: catColor(c) }} />
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {routines === null ? null : routines.length === 0 ? (
        <section className="empty">
          <h2>No routines yet</h2>
          <p>Start from blank, a template or a copy, then press play.</p>
        </section>
      ) : shown.length === 0 ? (
        <p className="no-match">No routine matches. Try another search or clear a filter.</p>
      ) : (
        <ul className="rlist">
          {shown.map((r) => <RoutineCard key={r.id} routine={r} />)}
        </ul>
      )}

      {creating && (
        <Sheet title="New routine" onClose={() => setCreating(false)}>
          <button type="button" className="opt" onClick={() => void create(async () => { const r = blankRoutine(); await saveRoutine(r); return r })}>
            <span className="opt__icon"><PlusIcon /></span>
            <span className="opt__text"><strong>Start blank</strong><span>Name it, then add blocks and exercises</span></span>
          </button>
          <div className="opt opt--col">
            <div className="opt__row">
              <span className="opt__icon"><TemplateIcon /></span>
              <span className="opt__text"><strong>From a template</strong><span>Timing is set — you pick the moves</span></span>
            </div>
            <div className="tpls">
              {TEMPLATES.map((t) => (
                <button key={t.id} type="button" className="tpl" onClick={() => void create(async () => { const r = routineFromTemplate(t); await saveRoutine(r); return r })}>
                  <TemplateBars work={t.workSeconds} rest={t.restSeconds} />
                  <strong>{t.name}</strong>
                  <span>{t.summary}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="opt opt--col">
            <div className="opt__row">
              <span className="opt__icon"><CopyIcon /></span>
              <span className="opt__text"><strong>Copy an existing routine</strong><span>Edit the copy, the original stays</span></span>
            </div>
            {(routines ?? []).length === 0 ? (
              <p className="opt__none">No routines to copy yet.</p>
            ) : (
              <ul className="copylist">
                {(routines ?? []).map((r) => {
                  const d = routineTotal(r)
                  return (
                    <li key={r.id}>
                      <button type="button" onClick={() => void create(() => copyRoutine(r.id))}>
                        <span className="dot" style={{ background: catColor(r.category) }} />
                        <span className="copylist__name">{r.name}</span>
                        <span className="copylist__len">{formatLength(d.seconds, d.approximate)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Sheet>
      )}
    </>
  )
}

function TemplateBars({ work, rest }: { work: number; rest: number }) {
  const bars = rest > 0 ? ['w', 'r', 'w', 'r', 'w', 'r'] : ['w', 'w', 'w', 'w']
  return (
    <span className="tpl__bars" aria-hidden="true" data-work={work}>
      {bars.map((b, i) => <i key={i} className={b === 'w' ? 'bar bar--work' : 'bar bar--rest'} />)}
    </span>
  )
}

function RoutineCard({ routine }: { routine: KataRoutine }) {
  const d = routineTotal(routine)
  const ref = firstExerciseRef(routine)
  const moves = stepCount(routine)
  const shape = routine.blocks.length > 1 ? `${routine.blocks.length} blocks` : `${moves} ${moves === 1 ? 'move' : 'moves'}`
  return (
    <li className="rcard">
      <Link to={`/routines/${routine.id}`} className="rcard__main" aria-label={`Edit ${routine.name}`}>
        <div className="rcard__art"><Drawing svg={ref ? drawingFor(ref.exerciseId, ref.variantId) : undefined} category={routine.category} label={routine.name} /></div>
        <div className="rcard__text">
          <span className="rcard__name">{routine.name}{routine.pinned && <span className="rcard__pin" role="img" aria-label="Pinned"><PinIcon /></span>}</span>
          <span className="rcard__meta"><span className="dot" style={{ background: catColor(routine.category) }} />{CATEGORY_LABEL[routine.category]} · {shape} · {formatLength(d.seconds, d.approximate)}</span>
          <span className="rcard__last">Last: {formatLast(routine.lastDone)}</span>
        </div>
      </Link>
      <Link to={`/play/${routine.id}`} className="play-btn" aria-label={`Play ${routine.name}`}><PlayIcon /></Link>
    </li>
  )
}
