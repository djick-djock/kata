import { describe, expect, it } from 'vitest'
import { duplicateBlock, newBlock } from './model'
import { customStep } from './model'

describe('duplicateBlock', () => {
  it('copies steps with fresh ids and a unique name', () => {
    const a = { ...newBlock('Block A', { repeat: 3 }), steps: [customStep({ name: 'Plank', measure: { type: 'time', seconds: 30 } })] }
    const copy = duplicateBlock(a, [a])
    expect(copy.name).toBe('Block A copy')
    expect(copy.repeat).toBe(3)
    expect(copy.id).not.toBe(a.id)
    expect(copy.steps[0].id).not.toBe(a.steps[0].id)
    expect(copy.steps[0].name).toBe('Plank')
    expect(duplicateBlock(a, [a, copy]).name).toBe('Block A copy 2')
  })
})

describe('duplicateBlock rest fields', () => {
  it('copies the dedicated rests', () => {
    const a = { ...newBlock('A', { repeat: 2, restBetweenRoundsSeconds: 30, restAfterBlockSeconds: 60 }), steps: [] }
    const c = duplicateBlock(a, [a])
    expect(c.restBetweenRoundsSeconds).toBe(30)
    expect(c.restAfterBlockSeconds).toBe(60)
  })
})
