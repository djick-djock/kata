import { describe, expect, it } from 'vitest'
import { flattenRoutine, routineDuration, type Block, type Routine, type Step } from './routine'

const step = (name: string, seconds: number, rest = 0, extra: Partial<Step> = {}): Step => ({
  ref: { type: 'custom' },
  name,
  measure: { type: 'time', seconds },
  restAfterSeconds: rest,
  ...extra,
})
const routine = (...blocks: Block[]): Routine => ({ name: 'R', blocks })
const summary = (r: Routine, s = {}) => flattenRoutine(r, s).items.map((i) => `${i.phase}:${i.name}${i.side ? ':' + i.side : ''}:${i.durationMs}`)

describe('flattenRoutine', () => {
  it('expands block repeats and drops the rest after the last step', () => {
    const r = routine({ name: 'A', repeat: 2, steps: [step('x', 10, 5), step('y', 10, 5)] })
    expect(summary(r)).toEqual([
      'work:x:10000', 'rest:Rest:5000', 'work:y:10000', 'rest:Rest:5000',
      'work:x:10000', 'rest:Rest:5000', 'work:y:10000',
    ])
  })

  it('omits zero rests', () => {
    const r = routine({ name: 'A', repeat: 1, steps: [step('x', 10, 0), step('y', 10, 0)] })
    expect(summary(r)).toEqual(['work:x:10000', 'work:y:10000'])
  })

  it('splits per-side steps with the default 5 s switch pause, then rest', () => {
    const r = routine({ name: 'A', repeat: 1, steps: [step('s', 30, 10, { perSide: true }), step('t', 20)] })
    expect(summary(r)).toEqual([
      'work:s:left:30000', 'switch:s:5000', 'work:s:right:30000', 'rest:Rest:10000', 'work:t:20000',
    ])
  })

  it('uses the adjustable switch pause, and none when zero', () => {
    const r = routine({ name: 'A', repeat: 1, steps: [step('s', 30, 0, { perSide: true })] })
    expect(summary(r, { switchPauseSeconds: 8 })[1]).toBe('switch:s:8000')
    expect(summary(r, { switchPauseSeconds: 0 })).toEqual(['work:s:left:30000', 'work:s:right:30000'])
  })

  it('marks warm-up blocks and ignores rests in them', () => {
    const r = routine(
      { name: 'W', repeat: 1, warmUp: true, steps: [step('j', 20, 10), step('k', 20, 10)] },
      { name: 'M', repeat: 1, steps: [step('m', 20)] },
    )
    const items = flattenRoutine(r).items
    expect(items.map((i) => i.phase)).toEqual(['warmup', 'warmup', 'work'])
    expect(items[0].warmUp).toBe(true)
    expect(items[2].warmUp).toBe(false)
  })

  it('supports exercise refs with variants and custom steps, and flags meditation', () => {
    const r = routine({
      name: 'A', repeat: 1,
      steps: [
        { ref: { type: 'exercise', exerciseId: 'squat', variantId: 'goblet' }, name: 'Squat (goblet)', measure: { type: 'reps', reps: 10 }, restAfterSeconds: 0 },
        step('Sit', 60, 0, { kind: 'meditation' }),
      ],
    })
    const [a, b] = flattenRoutine(r).items
    expect(a.ref).toEqual({ type: 'exercise', exerciseId: 'squat', variantId: 'goblet' })
    expect(a.phase).toBe('reps')
    expect(a.durationMs).toBeNull()
    expect(b.meditation).toBe(true)
  })

  it('tags block, round and step positions', () => {
    const r = routine({ name: 'A', repeat: 2, steps: [step('x', 10), step('y', 10)] })
    const items = flattenRoutine(r).items
    expect(items.map((i) => [i.round, i.rounds, i.stepInBlock, i.stepSeq])).toEqual([
      [1, 2, 0, 0], [1, 2, 1, 1], [2, 2, 0, 2], [2, 2, 1, 3],
    ])
  })

  it('handles an empty routine', () => {
    expect(flattenRoutine(routine()).items).toEqual([])
    expect(routineDuration(routine())).toEqual({ seconds: 0, approximate: false })
  })
})

describe('routineDuration', () => {
  it('sums everything, per-side and rests included', () => {
    const r = routine(
      { name: 'A', repeat: 2, steps: [step('x', 30, 10), step('s', 20, 5, { perSide: true })] },
    )
    // per round: 30+10 + 20+5+20 +5 rest = 90; two rounds minus final rest(5)
    expect(routineDuration(r)).toEqual({ seconds: 175, approximate: false })
  })

  it('flags reps steps as approximate with an adjustable estimate', () => {
    const r = routine({ name: 'A', repeat: 1, steps: [{ ref: { type: 'custom' }, name: 'p', measure: { type: 'reps', reps: 10 }, restAfterSeconds: 0 }] })
    expect(routineDuration(r)).toEqual({ seconds: 30, approximate: true })
    expect(routineDuration(r, { secondsPerRep: 2 }).seconds).toBe(20)
  })
})

describe('dedicated rests between rounds and blocks', () => {
  const st = (name: string, rest = 10): Step => ({ ref: { type: 'custom' }, name, measure: { type: 'time', seconds: 20 }, restAfterSeconds: rest })
  const blk = (b: Partial<Block> & { steps: Step[] }): Block => ({ name: 'B', repeat: 1, ...b })
  const rests = (r: Routine) => flattenRoutine(r).items.filter((i) => i.phase === 'rest')

  it('absent fields keep the old output', () => {
    const r: Routine = { name: 'r', blocks: [blk({ repeat: 2, steps: [st('a', 10)] }), blk({ steps: [st('b', 5)] })] }
    expect(rests(r).map((i) => [i.durationMs, i.restKind])).toEqual([[10000, 'step'], [10000, 'step']])
    expect(flattenRoutine(r).totalMs).toBe(20000 * 3 + 10000 * 2)
  })

  it('between-rounds rest replaces the last step rest, not after the final round', () => {
    const r: Routine = { name: 'r', blocks: [blk({ repeat: 3, restBetweenRoundsSeconds: 30, steps: [st('a', 10), st('b', 10)] })] }
    const rs = rests(r)
    const round = rs.filter((i) => i.restKind === 'round')
    expect(round.map((i) => [i.durationMs, i.round])).toEqual([[30000, 1], [30000, 2]])
    expect(rs.filter((i) => i.restKind === 'step').length).toBe(3)
    expect(flattenRoutine(r).items.at(-1)?.phase).toBe('work')
    expect(flattenRoutine(r).totalMs).toBe(20000 * 6 + 10000 * 3 + 30000 * 2)
  })

  it('a defined 0 removes the rest at that boundary', () => {
    const r: Routine = { name: 'r', blocks: [blk({ repeat: 2, restBetweenRoundsSeconds: 0, steps: [st('a', 10)] })] }
    expect(rests(r)).toHaveLength(0)
  })

  it('rest after block replaces the last step rest, keeps block info, none after the last block', () => {
    const r: Routine = { name: 'r', blocks: [blk({ restAfterBlockSeconds: 45, steps: [st('a', 10)] }), blk({ restAfterBlockSeconds: 45, steps: [st('b', 10)] })] }
    const rs = rests(r)
    expect(rs).toHaveLength(1)
    expect(rs[0]).toMatchObject({ restKind: 'block', durationMs: 45000, blockIndex: 0, stepSeq: 0 })
    expect(flattenRoutine(r).items.at(-1)?.phase).toBe('work')
  })

  it('warm-up blocks ignore step rests but honour block rests', () => {
    const r: Routine = { name: 'r', blocks: [blk({ warmUp: true, repeat: 2, restBetweenRoundsSeconds: 15, restAfterBlockSeconds: 20, steps: [st('a', 10)] }), blk({ steps: [st('b', 0)] })] }
    expect(rests(r).map((i) => [i.restKind, i.durationMs])).toEqual([['round', 15000], ['block', 20000]])
  })
})
