import { useState } from 'react'
import { submit } from '../request'
import { Sheet } from '../ui/Sheet'
import { notify } from '../ui/Toast'
import type { Exercise } from '../catalog'
import { buildDrawingPayload, DRAWING_REQUEST, type CustomExercise } from './drawing-request'

/** Copies a ready-made drawing prompt for an exercise or a custom exercise. Only used on the owner-only screen. */
export function RequestDrawing({ exercise }: { exercise: Exercise | CustomExercise }) {
  const [manual, setManual] = useState<string | null>(null)

  const run = async () => {
    const r = await submit({ ...DRAWING_REQUEST, payload: buildDrawingPayload(exercise) })
    if (r.ok) notify('Drawing prompt copied')
    else setManual(r.text)
  }
  return (
    <>
      <button type="button" className="btn" data-testid="request-drawing" onClick={() => void run()}>Request drawing</button>
      {manual !== null && (
        <Sheet title="Copy the prompt" onClose={() => setManual(null)}>
          <p>Copying was blocked. Select the text below and copy it.</p>
          <textarea readOnly className="video__input" rows={10} value={manual} onFocus={(e) => e.currentTarget.select()} />
        </Sheet>
      )}
    </>
  )
}
