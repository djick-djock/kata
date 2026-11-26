import { useMemo, useState } from 'react'
import { allExercises, CATEGORIES, drawingFor, localized, warmUpExercises, type Category, type Exercise } from '../catalog'
import type { Measure } from '../engine'
import { Drawing } from '../ui/Drawing'
import { Sheet } from '../ui/Sheet'
import { Stepper } from '../ui/Stepper'
import { InfoIcon, SearchIcon } from '../ui/Icons'
import { CATEGORY_LABEL, formatMeasure } from './exercise-format'
import './routines.css'

const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

export interface CustomInput { name: string; measure: Measure; perSide: boolean; details?: string }

/** Pick a catalog exercise (asking for a variant when it has some) or define a custom step. */
export function ExercisePicker({ warmUp, onPick, onInfo, onCustom, onClose }: { warmUp: boolean; onPick: (exerciseId: string, variantId?: string) => void; onInfo: (exerciseId: string) => void; onCustom: (input: CustomInput) => void; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [variantFor, setVariantFor] = useState<Exercise | null>(null)
  const [custom, setCustom] = useState(false)

  const { suggested, rest } = useMemo(() => {
    const q = norm(query)
    const ok = (e: Exercise) => (!category || e.category === category) && (!q || Object.values(e.name).some((n) => norm(n).includes(q)))
    const sugg = warmUp ? warmUpExercises().filter(ok) : []
    const ids = new Set(sugg.map((e) => e.id))
    return { suggested: sugg, rest: allExercises().filter((e) => ok(e) && !ids.has(e.id)) }
  }, [query, category, warmUp])

  if (custom) return <CustomForm onClose={onClose} onBack={() => setCustom(false)} onSubmit={onCustom} />

  if (variantFor) {
    return (
      <Sheet title={localized(variantFor.name)} onClose={onClose} action={<button type="button" className="text-btn" onClick={() => setVariantFor(null)}>Back</button>}>
        <p className="sheet__hint">Which variant?</p>
        <ul className="plain-list">
          {variantFor.variants!.map((v) => (
            <li key={v.id}>
              <button type="button" className="row-btn" onClick={() => onPick(variantFor.id, v.id)}>
                <span className="row-btn__main">{localized(v.label)}</span>
                {v.note && <span className="row-btn__sub">{localized(v.note)}</span>}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    )
  }

  const pick = (e: Exercise) => (e.variants?.length ? setVariantFor(e) : onPick(e.id))
  const row = (e: Exercise) => (
    <li key={e.id} className="pick-row">
      <button type="button" className="pick" onClick={() => pick(e)}>
        <span className="thumb"><Drawing svg={drawingFor(e.id)} category={e.category} label={localized(e.name)} /></span>
        <span className="pick__text">
          <span className="pick__name">{localized(e.name)}</span>
          <span className="pick__meta">{CATEGORY_LABEL[e.category]} · {formatMeasure(e.measure, e.perSide)}{e.variants?.length ? ' · variants' : ''}</span>
        </span>
      </button>
      <button type="button" className="info-btn" aria-label={`Details: ${localized(e.name)}`} onClick={() => onInfo(e.id)}><InfoIcon /></button>
    </li>
  )

  return (
    <Sheet title={warmUp ? 'Add to warm-up' : 'Add exercise'} onClose={onClose} tall>
      <label className="search search--sheet">
        <SearchIcon />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercises" aria-label="Search exercises" />
      </label>
      <div className="chips chips--sheet" role="group" aria-label="Category">
        <button type="button" className="chip" aria-pressed={category === null} onClick={() => setCategory(null)}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)}>{CATEGORY_LABEL[c]}</button>
        ))}
      </div>
      <button type="button" className="pick pick--custom" onClick={() => setCustom(true)}>
        <span className="thumb thumb--plus">+</span>
        <span className="pick__text"><span className="pick__name">Custom step</span><span className="pick__meta">Type a name and a time or reps</span></span>
      </button>
      {suggested.length > 0 && (
        <>
          <h3 className="section section--tight">Suggested for warm-up</h3>
          <ul className="plain-list" aria-label="Suggested for warm-up">{suggested.map(row)}</ul>
          <h3 className="section section--tight">All exercises</h3>
        </>
      )}
      <ul className="plain-list" aria-label="All exercises">{rest.map(row)}</ul>
      {suggested.length + rest.length === 0 && <p className="no-match">No exercise matches.</p>}
    </Sheet>
  )
}

function CustomForm({ onSubmit, onBack, onClose }: { onSubmit: (i: CustomInput) => void; onBack: () => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'time' | 'reps'>('time')
  const [value, setValue] = useState(30)
  const [perSide, setPerSide] = useState(false)
  const [details, setDetails] = useState('')
  const switchType = (t: 'time' | 'reps') => { setType(t); setValue(t === 'time' ? 30 : 10) }
  return (
    <Sheet title="Custom step" onClose={onClose} action={<button type="button" className="text-btn" onClick={onBack}>Back</button>}>
      <label className="field">
        <span className="field__label">Name</span>
        <input className="field__input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Foam roll calves" autoFocus />
      </label>
      <div className="field">
        <span className="field__label">Measure</span>
        <div className="seg" role="group" aria-label="Measure">
          <button type="button" aria-pressed={type === 'time'} onClick={() => switchType('time')}>Time</button>
          <button type="button" aria-pressed={type === 'reps'} onClick={() => switchType('reps')}>Reps</button>
        </div>
      </div>
      <div className="field">
        <span className="field__label">{type === 'time' ? 'Seconds' : 'Repetitions'}</span>
        <Stepper label={type === 'time' ? 'Seconds' : 'Repetitions'} value={value} onChange={setValue} min={1} step={type === 'time' ? 5 : 1} suffix={type === 'time' ? 's' : '×'} />
      </div>
      <label className="check">
        <input type="checkbox" checked={perSide} onChange={(e) => setPerSide(e.target.checked)} />
        <span>Per side</span>
      </label>
      <label className="field">
        <span className="field__label">Details (optional)</span>
        <textarea className="field__input field__textarea" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="How to do it, what to watch for" />
      </label>
      <button type="button" className="btn btn--primary btn--block" disabled={!name.trim()} onClick={() => onSubmit({ name: name.trim(), measure: type === 'time' ? { type, seconds: value } : { type, reps: value }, perSide, details })}>Add step</button>
    </Sheet>
  )
}
