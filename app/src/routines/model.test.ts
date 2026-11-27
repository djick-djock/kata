import { describe, expect, it } from 'vitest'
import { duplicateBlock, newBlock, resolveRoutine } from './model'
import { blankRoutine, customStep } from './model'

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

describe('resolveRoutine custom steps named after catalog exercises', () => {
  const routineWith = (...names: string[]) => ({ ...blankRoutine(), blocks: [{ ...newBlock('A'), steps: names.map((n) => customStep({ name: n, measure: { type: 'time' as const, seconds: 20 }, perSide: true, restAfterSeconds: 7 })) }] })

  it('upgrades by name, case-insensitively and trimmed, keeping measure, perSide and rest', () => {
    const [step] = resolveRoutine(routineWith('  UP AND OVERS ')).blocks[0].steps
    expect(step.ref).toEqual({ type: 'exercise', exerciseId: 'up-and-overs' })
    expect(step.name).toBe('Up and overs')
    expect(step.kind).toBe('hiit')
    expect(step.measure).toEqual({ type: 'time', seconds: 20 })
    expect(step.perSide).toBe(true)
    expect(step.restAfterSeconds).toBe(7)
  })

  it('maps the aliases and leaves unknown names custom', () => {
    const steps = resolveRoutine(routineWith('Side reache', 'Bum kicks', 'My own thing')).blocks[0].steps
    expect(steps[0].ref).toEqual({ type: 'exercise', exerciseId: 'side-reach' })
    expect(steps[0].name).toBe('Side reach')
    expect(steps[1].ref).toEqual({ type: 'exercise', exerciseId: 'butt-kicks' })
    expect(steps[2].ref).toEqual({ type: 'custom' })
    expect(steps[2].name).toBe('My own thing')
  })
})
