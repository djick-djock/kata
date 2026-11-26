import { useEffect, useState } from 'react'
import { listRoutines, saveRoutine } from '../data/routines'
import type { KataRoutine } from '../data/routine-types'
import { findExercise } from '../catalog'
import { blankRoutine, catalogStep, newBlock, nextBlockName } from '../routines/model'
import { Sheet } from '../ui/Sheet'
import { PlusIcon } from '../ui/Icons'
import './routines.css'

/** "Add to a routine" from the exercise detail: pick a routine and block, or create a new routine. */
export function AddToRoutine({ exerciseId, variantId, onAdded, onClose }: { exerciseId: string; variantId?: string; onAdded: (r: KataRoutine) => void; onClose: () => void }) {
  const [routines, setRoutines] = useState<KataRoutine[] | null>(null)
  const [target, setTarget] = useState<KataRoutine | null>(null)

  useEffect(() => {
    let live = true
    void listRoutines().then((r) => live && setRoutines(r))
    return () => { live = false }
  }, [])

  async function add(routine: KataRoutine, blockId: string | 'new') {
    let blocks = routine.blocks
    let id = blockId
    if (blockId === 'new') {
      const b = newBlock(nextBlockName(blocks))
      blocks = [...blocks, b]
      id = b.id
    }
    blocks = blocks.map((b) => {
      if (b.id !== id) return b
      const step = catalogStep(exerciseId, b, variantId)
      return step ? { ...b, steps: [...b.steps, step] } : b
    })
    onAdded(await saveRoutine({ ...routine, blocks }))
  }

  async function createNew() {
    const r = blankRoutine()
    const ex = findExercise(exerciseId)
    if (ex) r.category = ex.category
    r.name = 'New routine'
    await add(r, r.blocks[0].id)
  }

  if (target) {
    return (
      <Sheet title={`Add to ${target.name}`} onClose={onClose} action={<button type="button" className="text-btn" onClick={() => setTarget(null)}>Back</button>}>
        <p className="sheet__hint">Which block?</p>
        <ul className="plain-list">
          {target.blocks.map((b) => (
            <li key={b.id}><button type="button" className="row-btn" onClick={() => void add(target, b.id)}><span className="row-btn__main">{b.name}</span><span className="row-btn__sub">{b.steps.length} {b.steps.length === 1 ? 'move' : 'moves'}{b.warmUp ? ' · warm-up' : ''}</span></button></li>
          ))}
          <li><button type="button" className="row-btn" onClick={() => void add(target, 'new')}><span className="row-btn__main"><PlusIcon /> New block</span></button></li>
        </ul>
      </Sheet>
    )
  }
  return (
    <Sheet title="Add to a routine" onClose={onClose}>
      <ul className="plain-list">
        {(routines ?? []).map((r) => (
          <li key={r.id}><button type="button" className="row-btn" onClick={() => setTarget(r)}><span className="row-btn__main">{r.name}</span><span className="row-btn__sub">{r.blocks.length} {r.blocks.length === 1 ? 'block' : 'blocks'}</span></button></li>
        ))}
        <li><button type="button" className="row-btn" onClick={() => void createNew()}><span className="row-btn__main"><PlusIcon /> New routine</span></button></li>
      </ul>
    </Sheet>
  )
}
