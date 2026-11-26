import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CATEGORIES, drawingFor, findExercise, type Category } from '../catalog'
import { deleteRoutine, loadRoutine, saveRoutine } from '../data/routines'
import type { KataRoutine, RoutineBlock, RoutineStep } from '../data/routine-types'
import { formatTotal } from '../routines/format'
import { blockTotal, catalogStep, customStep, duplicateBlock, infoParam, moveItem, newBlock, nextBlockName, parseInfoParam, routineTotal, stepName, type InfoTarget } from '../routines/model'
import { Drawing } from '../ui/Drawing'
import { BackIcon, ChevronDownIcon, GripIcon, InfoIcon, PinIcon, PlayIcon, PlusIcon, RepeatIcon, StepByStepIcon, TrashIcon } from '../ui/Icons'
import { Sheet } from '../ui/Sheet'
import { Stepper } from '../ui/Stepper'
import { useDragReorder } from '../ui/useDragReorder'
import { ExerciseInfo } from './ExerciseDetail'
import { CATEGORY_LABEL, formatMeasure } from './exercise-format'
import { ExercisePicker } from './ExercisePicker'
import './exercises.css'
import './routines.css'

const catColor = (c: Category) => `var(--color-category-${c === 'meditation' ? 'mobility' : c})`

export function RoutineBuilder() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const info = parseInfoParam(searchParams.get('info'))
  const [routine, setRoutine] = useState<KataRoutine | null | undefined>(undefined)
  const ref = useRef<KataRoutine | null>(null)
  const chain = useRef<Promise<unknown>>(Promise.resolve())
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [picker, setPicker] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ blockId: string; stepId: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let live = true
    void loadRoutine(id).then((r) => {
      if (!live) return
      ref.current = r ?? null
      setRoutine(r ?? null)
    })
    return () => { live = false }
  }, [id])

  /** Applies a change, shows it at once and saves it (saves are queued so they land in order). */
  function change(fn: (r: KataRoutine) => KataRoutine) {
    if (!ref.current) return
    const next = fn(ref.current)
    ref.current = next
    setRoutine(next)
    chain.current = chain.current.then(() => saveRoutine(next))
  }
  const changeBlock = (blockId: string, fn: (b: RoutineBlock) => RoutineBlock) =>
    change((r) => ({ ...r, blocks: r.blocks.map((b) => (b.id === blockId ? fn(b) : b)) }))
  const changeStep = (blockId: string, stepId: string, fn: (s: RoutineStep) => RoutineStep) =>
    changeBlock(blockId, (b) => ({ ...b, steps: b.steps.map((s) => (s.id === stepId ? fn(s) : s)) }))

  /**
   * Details open as a full-screen layer over the builder, driven by the `info` search param. The builder
   * stays mounted, so the picker (search, filter, scroll), expanded blocks and scroll are all kept, and
   * the browser Back button closes the layer.
   */
  const openInfo = (t: InfoTarget) => setSearchParams({ info: infoParam(t) }, { state: { fromInfo: true } })
  const closeInfo = () => {
    if ((location.state as { fromInfo?: boolean } | null)?.fromInfo) navigate(-1)
    else setSearchParams({}, { replace: true })
  }

  async function leave() {
    await chain.current
    navigate('/routines')
  }

  if (routine === undefined) return null
  if (routine === null) {
    return (
      <div className="detail">
        <div className="detail__scroll">
          <Link to="/routines" className="icon-btn" aria-label="Back"><BackIcon /></Link>
          <p className="no-match">This routine does not exist.</p>
        </div>
      </div>
    )
  }

  const total = routineTotal(routine)
  const pickerBlock = routine.blocks.find((b) => b.id === picker)
  const editBlock = routine.blocks.find((b) => b.id === editing?.blockId)
  const editStep = editBlock?.steps.find((s) => s.id === editing?.stepId)
  const addStep = (blockId: string, make: (b: RoutineBlock) => RoutineStep | null) => {
    changeBlock(blockId, (b) => { const s = make(b); return s ? { ...b, steps: [...b.steps, s] } : b })
    setPicker(null)
  }

  return (
    <div className="detail builder">
      <div className="detail__scroll">
        <div className="builder__bar">
          <button type="button" className="icon-btn" aria-label="Back" onClick={() => void leave()}><BackIcon /></button>
          <span className="spacer" />
          <button type="button" className={`icon-btn pin-btn${routine.pinned ? ' is-on' : ''}`} aria-label={routine.pinned ? 'Unpin routine' : 'Pin routine'} aria-pressed={routine.pinned} onClick={() => { const pinned = !routine.pinned; change((r) => ({ ...r, pinned }))}}><PinIcon /></button>
          <button type="button" className="text-btn" onClick={() => void leave()}>Save</button>
        </div>
        <p className="builder__cat"><span className="dot" style={{ background: catColor(routine.category) }} />{CATEGORY_LABEL[routine.category]}</p>
        <input className="builder__title" aria-label="Routine name" value={routine.name} onChange={(e) => change((r) => ({ ...r, name: e.target.value }))} onBlur={() => !routine.name.trim() && change((r) => ({ ...r, name: 'New routine' }))} />
        <p className="builder__meta">
          {routine.blocks.length} {routine.blocks.length === 1 ? 'block' : 'blocks'} · total <strong data-testid="total">{formatTotal(total.seconds, total.approximate)}</strong>{total.approximate ? ' · reps add time' : ''}
        </p>

        {routine.blocks.map((block, index) => (
          <BlockCard
            key={block.id}
            block={block}
            canMoveUp={index > 0}
            canMoveDown={index < routine.blocks.length - 1}
            onMove={(to) => change((r) => ({ ...r, blocks: moveItem(r.blocks, index, to) }))}
            onDuplicate={() => change((r) => { const i = r.blocks.findIndex((b) => b.id === block.id); const copy = duplicateBlock(r.blocks[i], r.blocks); return { ...r, blocks: [...r.blocks.slice(0, i + 1), copy, ...r.blocks.slice(i + 1)] } })}
            index={index}
            collapsed={!!collapsed[block.id]}
            canDelete={routine.blocks.length > 1}
            onToggle={() => setCollapsed((c) => ({ ...c, [block.id]: !c[block.id] }))}
            onChange={(fn) => changeBlock(block.id, fn)}
            onDelete={() => change((r) => ({ ...r, blocks: r.blocks.filter((b) => b.id !== block.id) }))}
            onAdd={() => setPicker(block.id)}
            onEdit={(stepId) => setEditing({ blockId: block.id, stepId })}
            onInfo={(stepId) => openInfo({ type: 'step', stepId })}
          />
        ))}
        <button type="button" className="add-block" onClick={() => change((r) => ({ ...r, blocks: [...r.blocks, newBlock(nextBlockName(r.blocks))] }))}>
          <PlusIcon /> Add block
        </button>

        <h2 className="section">Routine</h2>
        <div className="chips chips--flush" role="group" aria-label="Category">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={routine.category === c} onClick={() => change((r) => ({ ...r, category: c }))}>
              <span className="dot" style={{ background: catColor(c) }} />{CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn--danger delete-routine" onClick={() => {
          if (!confirmDelete) return setConfirmDelete(true)
          void chain.current.then(() => deleteRoutine(routine.id)).then(() => navigate('/routines'))
        }}>
          <TrashIcon />{confirmDelete ? 'Tap again to delete this routine' : 'Delete routine'}
        </button>
      </div>

      <div className="builder__cta">
        <Link to={`/play/${routine.id}?mode=step`} className="btn btn--secondary"><StepByStepIcon /> Step by step</Link>
        <Link to={`/play/${routine.id}`} className="btn btn--primary btn--play"><PlayIcon /> Play all</Link>
      </div>

      {pickerBlock && (
        <ExercisePicker
          warmUp={!!pickerBlock.warmUp}
          onClose={() => setPicker(null)}
          onInfo={(exerciseId) => openInfo({ type: 'exercise', exerciseId })}
          onPick={(exerciseId, variantId) => {
            addStep(pickerBlock.id, (b) => catalogStep(exerciseId, b, variantId))
            const ex = findExercise(exerciseId)
            if (ex && routine.blocks.every((b) => b.steps.length === 0) && routine.createdFrom === 'blank') change((r) => ({ ...r, category: ex.category }))
          }}
          onCustom={(input) => addStep(pickerBlock.id, (b) => customStep({ ...input, restAfterSeconds: b.warmUp ? 0 : b.defaults?.restSeconds }))}
        />
      )}
      {info && <InfoLayer info={info} routine={routine} fromPicker={!!pickerBlock && info.type === 'exercise'} onClose={closeInfo} onEditStep={(blockId, stepId) => { closeInfo(); setEditing({ blockId, stepId }) }} />}
      {editBlock && editStep && (
        <StepEditor
          step={editStep}
          warmUp={!!editBlock.warmUp}
          index={editBlock.steps.indexOf(editStep)}
          count={editBlock.steps.length}
          onChange={(fn) => changeStep(editBlock.id, editStep.id, fn)}
          onMove={(to) => changeBlock(editBlock.id, (b) => ({ ...b, steps: moveItem(b.steps, b.steps.indexOf(editStep), to) }))}
          onRemove={() => { changeBlock(editBlock.id, (b) => ({ ...b, steps: b.steps.filter((s) => s.id !== editStep.id) })); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function BlockCard({ block, index, canMoveUp, canMoveDown, onMove, onDuplicate, collapsed, canDelete, onToggle, onChange, onDelete, onAdd, onEdit, onInfo }: {
  block: RoutineBlock
  index: number
  canMoveUp: boolean
  canMoveDown: boolean
  onMove: (to: number) => void
  onDuplicate: () => void
  collapsed: boolean
  canDelete: boolean
  onToggle: () => void
  onChange: (fn: (b: RoutineBlock) => RoutineBlock) => void
  onDelete: () => void
  onAdd: () => void
  onEdit: (stepId: string) => void
  onInfo: (stepId: string) => void
}) {
  const { listRef, handleProps } = useDragReorder((from, to) => onChange((b) => ({ ...b, steps: moveItem(b.steps, from, to) })))
  const [confirm, setConfirm] = useState(false)
  const dur = blockTotal(block)
  const moves = `${block.steps.length} ${block.steps.length === 1 ? 'move' : 'moves'}`
  const meta = block.warmUp
    ? `${moves} · no rest · ${formatTotal(dur.seconds, dur.approximate)}`
    : `${moves} · ${block.repeat} ${block.repeat === 1 ? 'round' : 'rounds'} · ${formatTotal(dur.seconds, dur.approximate)}`
  return (
    <section className={`block${block.warmUp ? ' block--warmup' : ''}`} aria-label={block.name}>
      <button type="button" className="block__head" aria-expanded={!collapsed} aria-label={`${block.name}, ${collapsed ? 'expand' : 'collapse'}`} onClick={onToggle}>
        <span className="block__titles">
          <span className="block__name">{block.name}</span>
          <span className="block__meta">{meta}</span>
        </span>
        {!collapsed && block.repeat > 1 && !block.warmUp ? <span className="repeat-pill"><RepeatIcon />×{block.repeat}</span> : null}
        <span className={`chev${collapsed ? '' : ' chev--open'}`}><ChevronDownIcon /></span>
      </button>
      {!collapsed && (
        <>
          <div className="block__settings">
            <input className="block__name-input" aria-label="Block name" value={block.name} onChange={(e) => onChange((b) => ({ ...b, name: e.target.value }))} />
            <div className="block__row">
              <span className="block__row-label">Rounds</span>
              <Stepper label="Rounds" value={block.repeat} min={1} step={1} suffix="×" onChange={(v) => onChange((b) => ({ ...b, repeat: v }))} />
            </div>
            <div className="block__row block__row--actions">
              <button type="button" className="text-btn text-btn--small" disabled={!canMoveUp} aria-label={`Move ${block.name} up`} onClick={() => onMove(index - 1)}>Move up</button>
              <button type="button" className="text-btn text-btn--small" disabled={!canMoveDown} aria-label={`Move ${block.name} down`} onClick={() => onMove(index + 1)}>Move down</button>
              <button type="button" className="text-btn text-btn--small" aria-label={`Duplicate ${block.name}`} onClick={onDuplicate}>Duplicate</button>
            </div>
            <div className="block__row">
              <label className="check check--inline">
                <input type="checkbox" checked={!!block.warmUp} onChange={(e) => onChange((b) => ({ ...b, warmUp: e.target.checked }))} />
                <span>Warm-up block (no rest)</span>
              </label>
              {canDelete && (
                <button type="button" className="text-btn text-btn--danger" aria-label={confirm ? 'Confirm delete block' : 'Delete block'} onClick={() => (confirm ? onDelete() : setConfirm(true))}>{confirm ? 'Tap again' : 'Delete'}</button>
              )}
            </div>
          </div>
          {block.steps.length === 0 && <p className="block__empty">No exercises yet.</p>}
          <ul className="steps" ref={listRef as React.RefObject<HTMLUListElement>}>
            {block.steps.map((s, i) => (
              <li key={s.id} className="step" data-drag-row>
                <button type="button" className="grip" aria-label={`Reorder ${s.name}`} {...handleProps(i)}><GripIcon /></button>
                <button type="button" className="step__main" aria-label={`Edit ${s.name}`} onClick={() => onEdit(s.id)}>
                  <span className="thumb"><StepDrawing step={s} /></span>
                  <span className="step__name">{s.name}{s.perSide && <span className="step__side">per side</span>}</span>
                  <span className="pill-work">{s.measure.type === 'time' ? `${s.measure.seconds}s` : `×${s.measure.reps}`}</span>
                  {!block.warmUp && s.restAfterSeconds > 0 && <span className="pill-rest">{s.restAfterSeconds}s</span>}
                </button>
                <button type="button" className="info-btn" aria-label={`Details: ${s.name}`} onClick={() => onInfo(s.id)}><InfoIcon /></button>
              </li>
            ))}
          </ul>
          <button type="button" className="add-ex" onClick={onAdd}><PlusIcon /> Add exercise</button>
        </>
      )}
    </section>
  )
}

function InfoLayer({ info, routine, fromPicker, onClose, onEditStep }: { info: InfoTarget; routine: KataRoutine; fromPicker: boolean; onClose: () => void; onEditStep: (blockId: string, stepId: string) => void }) {
  const backBtn = (label: string) => <button type="button" className="btn btn--primary btn--block btn--tall" onClick={onClose}>{label}</button>
  let body: React.ReactNode
  if (info.type === 'exercise') {
    body = <ExerciseInfo exerciseId={info.exerciseId} initialVariantId={info.variantId} onBack={onClose} footer={backBtn(fromPicker ? 'Back to the picker' : 'Back to the routine')} />
  } else {
    let owner: RoutineBlock | undefined
    let step: RoutineStep | undefined
    for (const b of routine.blocks) { const s = b.steps.find((x) => x.id === info.stepId); if (s) { owner = b; step = s } }
    if (!owner || !step) {
      body = <div className="detail"><div className="detail__scroll"><button type="button" className="icon-btn" aria-label="Back" onClick={onClose}><BackIcon /></button><p className="no-match">This step is no longer in the routine.</p></div></div>
    } else if (step.ref.type === 'exercise') {
      body = <ExerciseInfo exerciseId={step.ref.exerciseId} initialVariantId={step.ref.variantId} onBack={onClose} footer={backBtn('Back to the routine')} />
    } else {
      const details = step.details?.trim()
      const blockId = owner.id
      const stepId = step.id
      body = (
        <div className="detail">
          <div className="detail__scroll">
            <div className="detail__bar"><button type="button" className="icon-btn" aria-label="Back" onClick={onClose}><BackIcon /></button></div>
            <div className="detail__art"><Drawing category="mobility" label={step.name} /></div>
            <h1 className="detail__title">{step.name}</h1>
            <p className="step-info__meta">{formatMeasure(step.measure.type === 'time' ? { type: 'time', value: step.measure.seconds } : { type: 'reps', value: step.measure.reps }, !!step.perSide)}</p>
            <h2 className="section">Details</h2>
            {details ? <p className="step-info__text">{details}</p> : (
              <>
                <p className="step-info__hint">No details yet. Add a few notes on how to do this step.</p>
                <button type="button" className="btn" onClick={() => onEditStep(blockId, stepId)}>Add details</button>
              </>
            )}
          </div>
          <div className="detail__cta">
            {details ? <button type="button" className="btn btn--block" onClick={() => onEditStep(blockId, stepId)}>Edit step</button> : null}
            {backBtn('Back to the routine')}
          </div>
        </div>
      )
    }
  }
  return <div className="info-layer" role="dialog" aria-modal="true" aria-label="Details">{body}</div>
}

function StepDrawing({ step }: { step: RoutineStep }) {
  if (step.ref.type === 'exercise') {
    const ex = findExercise(step.ref.exerciseId)
    if (ex) return <Drawing svg={drawingFor(ex.id, step.ref.variantId)} category={ex.category} label={step.name} />
  }
  return <Drawing category="mobility" label={step.name} />
}

function StepEditor({ step, warmUp, index, count, onChange, onMove, onRemove, onClose }: {
  step: RoutineStep
  warmUp: boolean
  index: number
  count: number
  onChange: (fn: (s: RoutineStep) => RoutineStep) => void
  onMove: (to: number) => void
  onRemove: () => void
  onClose: () => void
}) {
  const exercise = step.ref.type === 'exercise' ? findExercise(step.ref.exerciseId) : undefined
  const variants = exercise?.variants ?? []
  const currentVariant = step.ref.type === 'exercise' ? step.ref.variantId : undefined
  const isTime = step.measure.type === 'time'
  return (
    <Sheet title={exercise ? stepName(exercise) : 'Custom step'} onClose={onClose} action={<button type="button" className="text-btn" onClick={onClose}>Done</button>}>
      {!exercise && (
        <label className="field">
          <span className="field__label">Name</span>
          <input className="field__input" value={step.name} onChange={(e) => onChange((s) => ({ ...s, name: e.target.value }))} />
        </label>
      )}
      {variants.length > 0 && exercise && (
        <div className="field">
          <span className="field__label">Variant</span>
          <div className="chips chips--flush chips--wrap" role="group" aria-label="Variant">
            {variants.map((v) => (
              <button key={v.id} type="button" className="chip" aria-pressed={currentVariant === v.id} onClick={() => onChange((s) => ({ ...s, ref: { type: 'exercise', exerciseId: exercise.id, variantId: v.id }, name: stepName(exercise, v.id) }))}>
                {v.label.en}
              </button>
            ))}
          </div>
        </div>
      )}
      {!exercise && (
        <label className="field">
          <span className="field__label">Details (optional)</span>
          <textarea className="field__input field__textarea" rows={3} value={step.details ?? ''} onChange={(e) => onChange((s) => ({ ...s, details: e.target.value }))} placeholder="How to do it, what to watch for" />
        </label>
      )}
      <div className="field">
        <span className="field__label">Measure</span>
        <div className="seg" role="group" aria-label="Measure">
          <button type="button" aria-pressed={isTime} onClick={() => onChange((s) => ({ ...s, measure: { type: 'time', seconds: 30 } }))}>Time</button>
          <button type="button" aria-pressed={!isTime} onClick={() => onChange((s) => ({ ...s, measure: { type: 'reps', reps: 10 } }))}>Reps</button>
        </div>
      </div>
      <div className="field">
        <span className="field__label">{isTime ? 'Seconds' : 'Repetitions'}</span>
        {step.measure.type === 'time' ? (
          <Stepper label="Seconds" value={step.measure.seconds} min={1} step={5} suffix="s" onChange={(v) => onChange((s) => ({ ...s, measure: { type: 'time', seconds: v } }))} />
        ) : (
          <Stepper label="Repetitions" value={step.measure.reps} min={1} step={1} suffix="×" onChange={(v) => onChange((s) => ({ ...s, measure: { type: 'reps', reps: v } }))} />
        )}
      </div>
      <label className="check">
        <input type="checkbox" checked={!!step.perSide} onChange={(e) => onChange((s) => ({ ...s, perSide: e.target.checked }))} />
        <span>Per side</span>
      </label>
      {!warmUp && (
        <div className="field">
          <span className="field__label">Rest after</span>
          <Stepper label="Rest after" value={step.restAfterSeconds} min={0} step={5} suffix="s" onChange={(v) => onChange((s) => ({ ...s, restAfterSeconds: v }))} />
        </div>
      )}
      <div className="editor-actions">
        <button type="button" className="btn" disabled={index === 0} onClick={() => onMove(index - 1)}>Move up</button>
        <button type="button" className="btn" disabled={index >= count - 1} onClick={() => onMove(index + 1)}>Move down</button>
        <button type="button" className="btn btn--danger" onClick={onRemove}><TrashIcon />Remove</button>
      </div>
    </Sheet>
  )
}
