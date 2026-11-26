import { useMemo, useRef, useState } from 'react'
import { drawingKey, removeUserDrawing, saveUserDrawing, useUserDrawings } from '../drawings/user-drawings'
import { sanitiseSvg } from '../drawings/sanitise'
import { Sheet } from '../ui/Sheet'
import { notify } from '../ui/Toast'
import type { Category } from '../catalog'
import { useOwnerMode } from './owner'
import './import-drawing.css'

/** Owner-only: import, replace or remove the local drawing of an exercise (or the selected variant). */
export function ImportDrawing({ exerciseId, variantId, category, name }: { exerciseId: string; variantId?: string; category: Category; name: string }) {
  const owner = useOwnerMode()
  const drawings = useUserDrawings()
  const [open, setOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const key = drawingKey(exerciseId, variantId)
  if (!owner) return null
  const has = drawings.has(key)

  return (
    <>
      <button type="button" className="btn btn--block" style={{ marginTop: 'var(--space-3)' }} data-testid="import-drawing" onClick={() => setOpen(true)}>
        {has ? 'Replace local drawing' : 'Import drawing'}
      </button>
      {has && (
        <button type="button" className="btn btn--block btn--danger" style={{ marginTop: 'var(--space-3)' }} data-testid="remove-drawing" onClick={() => setConfirmRemove(true)}>
          Remove local drawing
        </button>
      )}
      {open && <ImportSheet storeKey={key} category={category} name={name} onClose={() => setOpen(false)} />}
      {confirmRemove && (
        <Sheet title="Remove local drawing?" onClose={() => setConfirmRemove(false)}>
          <p>The shipped drawing for this exercise is used again. This cannot be undone.</p>
          <button type="button" className="btn btn--block btn--danger" data-testid="confirm-remove-drawing" onClick={() => { void removeUserDrawing(key).then(() => { setConfirmRemove(false); notify('Local drawing removed') }) }}>Remove</button>
        </Sheet>
      )}
    </>
  )
}

function ImportSheet({ storeKey, category, name, onClose }: { storeKey: string; category: Category; name: string; onClose: () => void }) {
  const [text, setText] = useState('')
  const file = useRef<HTMLInputElement>(null)
  const result = useMemo(() => (text.trim() ? sanitiseSvg(text) : null), [text])
  const tint = `var(--color-illustration-${category === 'meditation' ? 'mobility' : category})`

  const save = async () => {
    if (!result?.ok) return
    await saveUserDrawing(storeKey, result.svg)
    notify('Local drawing saved')
    onClose()
  }
  return (
    <Sheet title="Import drawing" tall onClose={onClose} action={<button type="button" className="text-btn" onClick={onClose}>Cancel</button>}>
      <label className="video__label" htmlFor="svg-text">SVG for {name}</label>
      <textarea id="svg-text" className="video__input idraw__text" rows={6} spellCheck={false} placeholder="Paste the SVG Claude returned" value={text} onChange={(e) => setText(e.target.value)} data-testid="svg-text" />
      <button type="button" className="btn" onClick={() => file.current?.click()}>Choose an SVG file</button>
      <input ref={file} type="file" accept="image/svg+xml,.svg" hidden data-testid="svg-file" onChange={(e) => {
        const f = e.target.files?.[0]
        e.target.value = ''
        if (f) void f.text().then(setText)
      }} />
      {result && !result.ok && <p className="video__error" role="alert" data-testid="svg-error">{result.errors.join(' ')}</p>}
      {result?.ok && (
        <>
          <p className="setnote" role="status" data-testid="svg-ok">Looks good.{result.removed.length > 0 && ` Removed: ${result.removed.join(', ')}.`}</p>
          <div className="idraw__preview" data-testid="svg-preview">
            {(['light', 'dark'] as const).map((t) => (
              <figure key={t} className={`idraw__cell idraw__cell--${t}`}>
                <div className="drawing" style={{ color: tint }} role="img" aria-label={`${name}, ${t} theme preview`} dangerouslySetInnerHTML={{ __html: result.svg }} />
                <figcaption>{t === 'light' ? 'Light' : 'Dark'}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
      <button type="button" className="btn btn--primary btn--block" disabled={!result?.ok} data-testid="svg-save" onClick={() => void save()}>Save</button>
    </Sheet>
  )
}
