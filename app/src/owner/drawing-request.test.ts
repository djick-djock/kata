import { describe, expect, it } from 'vitest'
import { allExercises } from '../catalog'
import { formatRequest } from '../request'
import { buildDrawingPayload, DRAWING_REQUEST } from './drawing-request'

const text = (id: string) => formatRequest({ ...DRAWING_REQUEST, payload: buildDrawingPayload(allExercises().find((e) => e.id === id)!) })

describe('drawing request prompt', () => {
  it('contains name, steps, measure and style rules', () => {
    const ex = allExercises().find((e) => e.id === 'squat')!
    const t = text('squat')
    expect(t).toContain('App: kata')
    expect(t).toContain(ex.name.en)
    for (const s of ex.howTo.en) expect(t).toContain(s)
    for (const s of ['viewBox 0 0 120 100', '2.6', 'round', 'currentColor', 'var(--ill-far', 'var(--ill-bg', 'no scripts', 'One simple schematic figure']) expect(t).toContain(s)
  })
  it('describes per-side and meditation cases', () => {
    const side = allExercises().find((e) => e.perSide)!
    expect(text(side.id)).toContain('/ side')
    expect(text(side.id)).toContain('ONE side')
    const med = allExercises().find((e) => e.category === 'meditation')!
    expect(text(med.id)).toContain('calm glyph')
  })
})
