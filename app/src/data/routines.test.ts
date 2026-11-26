import { afterEach, describe, expect, it } from 'vitest'
import { findExercise, variantsOf, allExercises } from '../catalog'
import { routineDuration } from '../engine'
import { blankRoutine, catalogStep, customStep, resolveRoutine, routineFromTemplate, TEMPLATES } from '../routines/model'
import { KataDB } from './db'
import { copyRoutine, deleteRoutine, getPinnedRoutine, listRoutines, loadRoutine, markRoutineDone, saveRoutine, setPinned } from './routines'
import type { KataRoutine } from './routine-types'

let store: KataDB
const open = () => (store = new KataDB(`routines-${Math.random()}`))
afterEach(async () => {
  store.close()
  await store.delete()
})

function sample(): KataRoutine {
  const r = blankRoutine()
  r.name = 'Morning'
  const withVariants = allExercises().find((e) => (e.variants?.length ?? 0) > 0)!
  const block = r.blocks[0]
  block.repeat = 2
  block.steps.push(catalogStep(withVariants.id, block, withVariants.variants![1]?.id ?? withVariants.variants![0].id)!)
  block.steps.push(customStep({ name: 'Foam roll calves', measure: { type: 'time', seconds: 40 }, perSide: true, restAfterSeconds: 0 }))
  return r
}

describe('routine repository', () => {
  it('round-trips a routine through save and load', async () => {
    open()
    const r = sample()
    await saveRoutine(r, store)
    const back = await loadRoutine(r.id, store)
    expect(back).toMatchObject({ id: r.id, name: 'Morning', category: 'strength', pinned: false })
    expect(back!.blocks[0].repeat).toBe(2)
    expect(back!.blocks[0].steps.map((s) => [s.name, s.ref.type, s.measure, s.perSide, s.restAfterSeconds])).toEqual(
      r.blocks[0].steps.map((s) => [s.name, s.ref.type, s.measure, s.perSide, s.restAfterSeconds]),
    )
    expect(back!.blocks[0].steps[0].ref).toMatchObject({ type: 'exercise', variantId: expect.any(String) })
    expect((await listRoutines(store)).map((x) => x.id)).toEqual([r.id])
    await deleteRoutine(r.id, store)
    expect(await loadRoutine(r.id, store)).toBeUndefined()
  })

  it('copy leaves the original unchanged', async () => {
    open()
    const r = sample()
    await saveRoutine({ ...r, pinned: true }, store)
    const before = await loadRoutine(r.id, store)
    const copy = (await copyRoutine(r.id, store))!
    expect(copy.id).not.toBe(r.id)
    expect(copy.name).toBe('Morning copy')
    expect(copy.pinned).toBe(false)
    expect(copy.blocks[0].id).not.toBe(r.blocks[0].id)
    expect(copy.blocks[0].steps.map((s) => s.name)).toEqual(r.blocks[0].steps.map((s) => s.name))
    // edit the copy: the original stays as it was
    copy.blocks[0].steps.pop()
    copy.name = 'Changed'
    await saveRoutine(copy, store)
    expect(await loadRoutine(r.id, store)).toEqual(before)
    expect((await listRoutines(store)).length).toBe(2)
  })

  it('falls back to a custom step with the saved name when the catalog id is gone', async () => {
    open()
    const r = blankRoutine()
    r.blocks[0].steps.push({
      id: 'x', ref: { type: 'exercise', exerciseId: 'removed-in-v9' }, name: 'Old exercise', kind: 'strength',
      measure: { type: 'time', seconds: 30 }, restAfterSeconds: 10,
    })
    await saveRoutine(r, store)
    const back = (await loadRoutine(r.id, store))!
    expect(back.blocks[0].steps[0]).toMatchObject({ ref: { type: 'custom' }, name: 'Old exercise', measure: { type: 'time', seconds: 30 } })
    expect(back.blocks[0].steps[0].kind).toBeUndefined()
    // still plays: the engine counts it
    expect(routineDuration(back).seconds).toBeGreaterThan(0)
  })

  it('refreshes names from the catalog and drops an unknown variant', () => {
    const ex = allExercises().find((e) => (e.variants?.length ?? 0) > 0)!
    const r = blankRoutine()
    r.blocks[0].steps.push({ id: 'a', ref: { type: 'exercise', exerciseId: ex.id, variantId: 'no-such-variant' }, name: 'stale', measure: { type: 'time', seconds: 20 }, restAfterSeconds: 0 })
    const s = resolveRoutine(r).blocks[0].steps[0]
    expect(s.ref).toEqual({ type: 'exercise', exerciseId: ex.id })
    expect(s.name).not.toBe('stale')
    expect(s.kind).toBe(ex.category)
  })

  it('allows only one pinned routine', async () => {
    open()
    const a = blankRoutine(), b = blankRoutine()
    await saveRoutine(a, store)
    await saveRoutine(b, store)
    await setPinned(a.id, true, store)
    expect((await getPinnedRoutine(store))?.id).toBe(a.id)
    await setPinned(b.id, true, store)
    expect((await getPinnedRoutine(store))?.id).toBe(b.id)
    expect((await listRoutines(store)).filter((r) => r.pinned)).toHaveLength(1)
    // saving a routine that carries pinned=true also unpins the others
    await saveRoutine({ ...a, pinned: true }, store)
    const pinned = (await listRoutines(store)).filter((r) => r.pinned)
    expect(pinned.map((r) => r.id)).toEqual([a.id])
    await setPinned(a.id, false, store)
    expect(await getPinnedRoutine(store)).toBeUndefined()
  })

  it('keeps lastDone across edits and saves via the sessions hook', async () => {
    open()
    const r = blankRoutine()
    await saveRoutine(r, store)
    await markRoutineDone(r.id, 1_700_000_000_000, store)
    await saveRoutine({ ...r, name: 'Renamed' }, store)
    expect((await loadRoutine(r.id, store))?.lastDone).toBe(1_700_000_000_000)
  })
})

describe('duration through the engine', () => {
  it('computes time steps, repeats, rest and per side; flags reps as approximate', () => {
    const r = blankRoutine()
    const b = r.blocks[0]
    b.repeat = 2
    b.steps.push(customStep({ name: 'A', measure: { type: 'time', seconds: 45 }, restAfterSeconds: 15 }))
    b.steps.push(customStep({ name: 'B', measure: { type: 'time', seconds: 30 }, perSide: true, restAfterSeconds: 0 }))
    // round: 45+15 + 30+5+30 = 125 ; x2 = 250
    expect(routineDuration(r)).toEqual({ seconds: 250, approximate: false })
    b.steps.push(customStep({ name: 'C', measure: { type: 'reps', reps: 10 }, restAfterSeconds: 0 }))
    const d = routineDuration(r)
    expect(d.approximate).toBe(true)
    expect(d.seconds).toBeGreaterThan(250)
  })

  it('ignores rest inside a warm-up block', () => {
    const r = blankRoutine()
    r.blocks[0].warmUp = true
    r.blocks[0].steps.push(customStep({ name: 'A', measure: { type: 'time', seconds: 30 }, restAfterSeconds: 20 }), customStep({ name: 'B', measure: { type: 'time', seconds: 30 }, restAfterSeconds: 20 }))
    expect(routineDuration(r).seconds).toBe(60)
  })
})

describe('templates and catalog steps', () => {
  it('builds the three templates with the right repeat and timing defaults', () => {
    const [intervals, tabata, flow] = TEMPLATES.map((t) => routineFromTemplate(t))
    expect(intervals.blocks[0]).toMatchObject({ repeat: 2, defaults: { workSeconds: 45, restSeconds: 15 }, steps: [] })
    expect(tabata.blocks[0]).toMatchObject({ repeat: 8, defaults: { workSeconds: 20, restSeconds: 10 } })
    expect(flow.blocks[0]).toMatchObject({ repeat: 1, defaults: { workSeconds: 30, restSeconds: 0 } })
    const squat = catalogStep(allExercises()[0].id, tabata.blocks[0])!
    expect(squat.measure).toEqual({ type: 'time', seconds: 20 })
    expect(squat.restAfterSeconds).toBe(10)
  })

  it('fills name and kind from the catalog, with the variant in the name; warm-up blocks get no rest', () => {
    const ex = allExercises().find((e) => (e.variants?.length ?? 0) > 0)!
    const v = variantsOf(ex.id)[0]
    const s = catalogStep(ex.id, { warmUp: true }, v.id)!
    expect(s.name).toContain(v.label.en)
    expect(s.kind).toBe(findExercise(ex.id)!.category)
    expect(s.restAfterSeconds).toBe(0)
    expect(catalogStep('nope', {})).toBeNull()
  })
})
