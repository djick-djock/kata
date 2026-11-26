import { describe, expect, it } from 'vitest'
import { db, KataDB } from '../data/db'
import { saveRoutine } from '../data/routines'
import { exportAll } from '../backup/backup'
import { blankRoutine, customStep } from '../routines/model'
import { formatRequest } from '../request'
import { customFromBackupText } from './CustomExercises'
import { customListText, groupCustomExercises } from './custom-exercises'
import { buildDrawingPayload, DRAWING_REQUEST } from './drawing-request'

const time = (seconds: number) => ({ type: 'time' as const, seconds })
function routines() {
  const a = blankRoutine()
  a.blocks[0].steps.push(
    customStep({ name: 'Foam roll', measure: time(30), details: 'Slow.\nPause on tight spots.' }),
    customStep({ name: '  foam ROLL ', measure: time(60) }),
    customStep({ name: 'Nordic curl', measure: { type: 'reps', reps: 5 }, perSide: true }),
  )
  const b = blankRoutine()
  b.blocks[0].steps.push(customStep({ name: 'FOAM roll', measure: time(45) }))
  return [a, b]
}

describe('groupCustomExercises', () => {
  it('groups by trimmed case-insensitive name with counts and details', () => {
    const g = groupCustomExercises(routines())
    expect(g.map((x) => x.name)).toEqual(['Foam roll', 'Nordic curl'])
    expect(g[0]).toMatchObject({ routines: 2, steps: 3, details: 'Slow.\nPause on tight spots.', measure: { type: 'time', value: 30 }, perSide: false })
    expect(g[1]).toMatchObject({ routines: 1, steps: 1, perSide: true, measure: { type: 'reps', value: 5 } })
    expect(g[1].details).toBeUndefined()
  })
  it('ignores catalog steps', () => {
    const r = blankRoutine()
    r.blocks[0].steps.push({ id: 'x', ref: { type: 'exercise', exerciseId: 'squat' }, name: 'Squat', measure: time(30), restAfterSeconds: 10 })
    expect(groupCustomExercises([r])).toEqual([])
  })
})

describe('customListText', () => {
  it('is readable plain text with details, usage and measure', () => {
    const t = customListText(groupCustomExercises(routines()))
    expect(t).toContain('Kata custom exercises: 2')
    expect(t).toContain('1. Foam roll')
    expect(t).toContain('Default: 30 s')
    expect(t).toContain('Used in: 2 routines, 3 steps')
    expect(t).toContain('     Pause on tight spots.')
    expect(t).toContain('2. Nordic curl')
    expect(t).toContain('Default: ×5 / side')
    expect(t).toContain('Used in: 1 routine, 1 step')
  })
  it('names the backup file when given', () => {
    expect(customListText([], 'mum.json')).toContain('from backup file mum.json')
  })
})

describe('drawing prompt for a custom exercise', () => {
  it('uses name, details as how-to, measure and per side', () => {
    const t = formatRequest({ ...DRAWING_REQUEST, payload: buildDrawingPayload({ name: 'Nordic curl', details: 'Kneel.\nLower slowly.', measure: { type: 'reps', value: 5 }, perSide: false }) })
    expect(t).toContain('Nordic curl')
    expect(t).toContain('Kneel.')
    expect(t).toContain('Lower slowly.')
    expect(t).toContain('×5')
    expect(t).toContain('nordic-curl.svg')
    expect(t).toContain('One simple schematic figure')
  })
})

describe('reading a backup file', () => {
  it('lists its custom exercises and leaves the local database untouched', async () => {
    const other = new KataDB('cx-source')
    for (const r of routines()) await saveRoutine(r, other)
    const text = JSON.stringify(await exportAll(other))
    await db.settings.put({ key: 'sound', value: false })
    await saveRoutine(blankRoutine(), db)
    const before = JSON.stringify(await exportAll(db, () => 0))
    const list = customFromBackupText(text)
    expect(list.map((x) => x.name.toLowerCase())).toEqual(['foam roll', 'nordic curl'])
    expect(JSON.stringify(await exportAll(db, () => 0))).toBe(before)
  })
  it('rejects a bad file without touching the database', async () => {
    expect(() => customFromBackupText('nope')).toThrow()
    expect(() => customFromBackupText('{"app":"other"}')).toThrow()
  })
})
