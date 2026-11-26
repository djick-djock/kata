import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { drawingFor, findExercise, localized } from '../catalog'
import { getExerciseLink, normaliseLink, removeExerciseLink, setExerciseLink } from '../data/exercise-links'
import { AddToRoutine } from './AddToRoutine'
import { ImportDrawing } from '../owner/ImportDrawing'
import { RequestDrawing } from '../owner/RequestDrawing'
import { Drawing } from '../ui/Drawing'
import { BackIcon, LinkIcon, PlusIcon } from '../ui/Icons'
import { CATEGORY_LABEL, formatMeasure } from './exercise-format'
import './exercises.css'

export function ExerciseDetail() {
  const { id = '' } = useParams()
  const exercise = findExercise(id)
  const [variantId, setVariantId] = useState<string | undefined>(undefined)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState<{ id: string; name: string } | null>(null)

  if (!exercise) {
    return (
      <div className="detail">
        <Link to="/exercises" className="icon-btn" aria-label="Back"><BackIcon /></Link>
        <p className="no-match">This exercise is not in the library.</p>
      </div>
    )
  }
  const name = localized(exercise.name)
  const variants = exercise.variants ?? []
  const variant = variants.find((v) => v.id === variantId)
  const catColor = `var(--color-category-${exercise.category === 'meditation' ? 'mobility' : exercise.category})`

  return (
    <div className="detail">
      <div className="detail__scroll">
        <div className="detail__bar">
          <Link to="/exercises" className="icon-btn" aria-label="Back"><BackIcon /></Link>
        </div>
        <div className="detail__art">
          <Drawing svg={drawingFor(exercise.id, variant?.id)} exerciseId={exercise.id} variantId={variant?.id} category={exercise.category} label={name} />
        </div>
        <h1 className="detail__title">{name}</h1>
        <div className="pills">
          <span className="pill"><span className="dot" style={{ background: catColor }} />{CATEGORY_LABEL[exercise.category]}</span>
          {exercise.tags.map((t) => <span key={t} className="pill">{t}</span>)}
          <span className="pill pill--measure">Default {formatMeasure(exercise.measure, exercise.perSide)}</span>
        </div>

        {variants.length > 0 && (
          <>
            <h2 className="section">Variants</h2>
            <div className="chips" role="group" aria-label="Variant">
              {variants.map((v, i) => (
                <button key={v.id} type="button" className="chip" aria-pressed={(variantId ?? variants[0].id) === v.id} onClick={() => setVariantId(i === 0 ? undefined : v.id)}>
                  {localized(v.label)}{v.note ? ` (${localized(v.note)})` : ''}
                </button>
              ))}
            </div>
          </>
        )}

        <h2 className="section">How to</h2>
        <ol className="howto">
          {localized(exercise.howTo).map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        <h2 className="section">Tips</h2>
        <p className="tips">{localized(exercise.tips)}</p>
        <VideoLink exerciseId={exercise.id} />
        <RequestDrawing exercise={exercise} />
        <ImportDrawing exerciseId={exercise.id} variantId={variant?.id} category={exercise.category} name={variant ? `${name} (${localized(variant.label)})` : name} />
      </div>
      {added && (
        <p className="toast" role="status">Added to {added.name}. <Link to={`/routines/${added.id}`}>Open</Link></p>
      )}
      <div className="detail__cta">
        <button type="button" className="btn btn--primary btn--block btn--tall" onClick={() => { setAdded(null); setAdding(true) }}>Add to a routine</button>
      </div>
      {adding && (
        <AddToRoutine
          exerciseId={exercise.id}
          variantId={variants.length ? (variantId ?? variants[0].id) : undefined}
          onClose={() => setAdding(false)}
          onAdded={(r) => { setAdding(false); setAdded({ id: r.id, name: r.name }) }}
        />
      )}
    </div>
  )
}

function VideoLink({ exerciseId }: { exerciseId: string }) {
  const [url, setUrl] = useState<string | undefined>()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let live = true
    void getExerciseLink(exerciseId).then((u) => live && setUrl(u))
    return () => { live = false }
  }, [exerciseId])

  async function save() {
    if (!normaliseLink(draft)) return setError(true)
    await setExerciseLink(exerciseId, draft)
    setUrl(await getExerciseLink(exerciseId))
    setEditing(false)
  }
  async function remove() {
    await removeExerciseLink(exerciseId)
    setUrl(undefined)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="video">
        <label className="video__label" htmlFor="video-url">Video link</label>
        <input id="video-url" className="video__input" type="url" inputMode="url" autoFocus value={draft} placeholder="Paste an Instagram or YouTube link" onChange={(e) => { setDraft(e.target.value); setError(false) }} />
        {error && <p className="video__error" role="alert">That does not look like a web link.</p>}
        <div className="video__actions">
          <button type="button" className="btn btn--primary" onClick={() => void save()}>Save</button>
          <button type="button" className="btn" onClick={() => setEditing(false)}>Cancel</button>
          {url && <button type="button" className="btn btn--danger" onClick={() => void remove()}>Remove</button>}
        </div>
      </div>
    )
  }
  if (url) {
    let host = url
    try { host = new URL(url).hostname.replace(/^www\./, '') } catch { /* keep raw */ }
    return (
      <div className="video">
        <div className="video__row">
          <span className="video__icon"><LinkIcon /></span>
          <span className="video__text"><span className="video__label">Video link</span><span className="video__sub">{host}</span></span>
        </div>
        <div className="video__actions">
          <a className="btn btn--primary" href={url} target="_blank" rel="noopener noreferrer">Open</a>
          <button type="button" className="btn" onClick={() => { setDraft(url); setError(false); setEditing(true) }}>Change</button>
        </div>
      </div>
    )
  }
  return (
    <button type="button" className="video video--add" onClick={() => { setDraft(''); setError(false); setEditing(true) }}>
      <span className="video__icon"><LinkIcon /></span>
      <span className="video__text"><span className="video__label">Video link</span><span className="video__sub">Paste an Instagram or YouTube link</span></span>
      <PlusIcon />
    </button>
  )
}
