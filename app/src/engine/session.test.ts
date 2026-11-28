import { describe, expect, it } from 'vitest'
import type { Block, Routine, Step } from './routine'
import { createSession, type Cue, type SessionMode, type Update } from './session'

const step = (name: string, seconds: number, rest = 0, extra: Partial<Step> = {}): Step => ({
  ref: { type: 'custom' }, name, measure: { type: 'time', seconds }, restAfterSeconds: rest, ...extra,
})
const reps = (name: string, n: number, rest = 0): Step => ({
  ref: { type: 'custom' }, name, measure: { type: 'reps', reps: n }, restAfterSeconds: rest,
})
const routine = (...blocks: Block[]): Routine => ({ name: 'R', blocks })

function setup(r: Routine, mode: SessionMode = 'play-all', settings = {}) {
  let t = 1_000_000
  const s = createSession({ routine: r, mode, settings, now: () => t })
  const log: { at: number; cue: Cue }[] = []
  const t0 = t
  const rec = (u: Update) => { u.cues.forEach((cue) => log.push({ at: (t - t0) / 1000, cue })); return u }
  return {
    s,
    log,
    rec,
    set: (ms: number) => { t = t0 + ms },
    /** Advance whole seconds, updating each second like a UI interval. */
    run(seconds: number) {
      for (let i = 0; i < seconds; i++) { t += 1000; rec(s.update()) }
    },
    jump(seconds: number) { t += seconds * 1000; return rec(s.update()) },
    do: (fn: () => Update) => rec(fn()),
    cues: () => log.map((l) => `${l.at}:${l.cue.kind}${l.cue.secondsLeft ? l.cue.secondsLeft : ''}`),
  }
}

describe('play all', () => {
  it('advances automatically through steps and rests, then finishes with a bell', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10, 4), step('y', 10)] }))
    h.do(h.s.start)
    expect(h.s.getState().phase).toBe('work')
    h.run(10)
    expect(h.s.getState().phase).toBe('rest')
    h.run(4)
    expect(h.s.getState().current?.name).toBe('y')
    h.run(10)
    const st = h.s.getState()
    expect(st.status).toBe('finished')
    expect(st.result?.percent).toBe(100)
    expect(h.log.at(-1)?.cue).toMatchObject({ kind: 'bell', reason: 'routine-end' })
  })

  it('reports step time left, next step, block and round', () => {
    const h = setup(routine({ name: 'Core', repeat: 2, steps: [step('x', 10), step('y', 20)] }))
    h.do(h.s.start)
    h.run(3)
    const st = h.s.getState()
    expect(st.stepSecondsLeft).toBe(7)
    expect(st.next?.name).toBe('y')
    expect(st.block).toMatchObject({ name: 'Core', round: 1, rounds: 2 })
    expect(st.routineRemainingMs).toBe(7000 + 20000 + 30000)
  })

  it('shows the upcoming step during rest', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10, 6), step('y', 10)] }))
    h.do(h.s.start)
    h.run(10)
    const st = h.s.getState()
    expect(st.phase).toBe('rest')
    expect(st.next?.name).toBe('y')
  })
})

describe('step by step', () => {
  const r = routine({ name: 'A', repeat: 1, steps: [step('x', 10, 5), step('y', 10)] })

  it('starts the first step, then waits for me before each next step', () => {
    const h = setup(r, 'step-by-step')
    h.do(h.s.start)
    expect(h.s.getState().status).toBe('running')
    h.run(10)
    expect(h.s.getState().phase).toBe('rest') // rests still flow
    h.run(5)
    expect(h.s.getState()).toMatchObject({ status: 'waiting', phase: 'work' })
    h.run(60)
    expect(h.s.getState().status).toBe('waiting')
    expect(h.s.getState().stepElapsedMs).toBe(0)
    h.do(h.s.start)
    expect(h.s.getState().status).toBe('running')
    h.run(10)
    expect(h.s.getState().status).toBe('finished')
  })

  it('does not count waiting time as elapsed', () => {
    const h = setup(r, 'step-by-step')
    h.do(h.s.start)
    h.run(15)
    h.run(100)
    h.do(h.s.start)
    h.run(10)
    expect(h.s.getState().result?.elapsedMs).toBe(25000)
  })

  it('plays both sides of a per-side step without waiting in between', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('s', 10, 0, { perSide: true })] }), 'step-by-step')
    h.do(h.s.start)
    h.run(10)
    expect(h.s.getState().phase).toBe('switch')
    h.run(5)
    expect(h.s.getState()).toMatchObject({ status: 'running', phase: 'work' })
    expect(h.s.getState().current?.side).toBe('right')
  })

  it('skip lands on a waiting step', () => {
    const h = setup(r, 'step-by-step')
    h.do(h.s.start)
    h.do(h.s.skip)
    expect(h.s.getState()).toMatchObject({ status: 'waiting' })
    expect(h.s.getState().current?.name).toBe('y')
  })
})

describe('reps steps', () => {
  it('runs until Done with no countdown, tracks elapsed, Done goes to the rest', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [reps('push', 12, 20), step('y', 10)] }))
    h.do(h.s.start)
    h.run(95)
    let st = h.s.getState()
    expect(st.phase).toBe('reps')
    expect(st.stepSecondsLeft).toBeNull()
    expect(st.stepElapsedMs).toBe(95000)
    expect(st.current?.reps).toBe(12)
    expect(h.log).toEqual([]) // no ticks on reps
    h.do(h.s.repsDone)
    st = h.s.getState()
    expect(st.phase).toBe('rest')
    expect(st.stepSecondsLeft).toBe(20)
  })

  it('makes the routine time left approximate', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [reps('push', 10), step('y', 10)] }))
    h.do(h.s.start)
    expect(h.s.getState().approximate).toBe(true)
    expect(h.s.getState().routineRemainingMs).toBe(40000)
  })

  it('ignores Done when not on a reps step', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10)] }))
    h.do(h.s.start)
    h.do(h.s.repsDone)
    expect(h.s.getState().phase).toBe('work')
  })
})

describe('per-side', () => {
  it('runs left, switch pause, right, with the configured pause', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('s', 10, 0, { perSide: true })] }), 'play-all', { switchPauseSeconds: 3 })
    h.do(h.s.start)
    expect(h.s.getState().current).toMatchObject({ side: 'left', phase: 'work' })
    h.run(10)
    expect(h.s.getState()).toMatchObject({ phase: 'switch', stepSecondsLeft: 3 })
    h.run(3)
    expect(h.s.getState().current).toMatchObject({ side: 'right', phase: 'work' })
    h.run(10)
    expect(h.s.getState().status).toBe('finished')
  })

  it('gives block progress segments that include both parts', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('s', 10, 0, { perSide: true }), step('t', 10)] }))
    h.do(h.s.start)
    h.run(10) // left done; switch begins. total step = 10+5+10 = 25
    let seg = h.s.getState().block!.segments
    expect(seg[0]).toMatchObject({ status: 'current' })
    expect(seg[0].fraction).toBeCloseTo(10 / 25)
    expect(seg[1]).toMatchObject({ status: 'upcoming', fraction: 0 })
    h.run(20) // into step t
    seg = h.s.getState().block!.segments
    expect(seg[0]).toMatchObject({ status: 'done', fraction: 1 })
    expect(seg[1].status).toBe('current')
  })
})

describe('pause and resume', () => {
  it('preserves elapsed time', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 30)] }))
    h.do(h.s.start)
    h.run(10)
    h.do(h.s.pause)
    expect(h.s.getState().status).toBe('paused')
    h.jump(600)
    expect(h.s.getState().stepSecondsLeft).toBe(20)
    h.do(h.s.resume)
    h.run(5)
    expect(h.s.getState().stepSecondsLeft).toBe(15)
    h.run(15)
    expect(h.s.getState().result?.elapsedMs).toBe(30000)
  })

  it('does not double a tick across pause and resume', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 20)] }))
    h.do(h.s.start)
    h.run(16) // 4 left
    h.do(h.s.pause)
    h.do(h.s.resume)
    h.do(h.s.update)
    expect(h.cues().filter((c) => c.endsWith('beep4'))).toHaveLength(1)
  })

  it('resume on a waiting step starts it', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10), step('y', 10)] }), 'step-by-step')
    h.do(h.s.start)
    h.run(10)
    h.do(h.s.resume)
    expect(h.s.getState().status).toBe('running')
  })
})

describe('skip and previous', () => {
  const r = routine(
    { name: 'A', repeat: 1, steps: [step('a', 20, 10), step('b', 20, 10)] },
    { name: 'B', repeat: 1, steps: [step('c', 20)] },
  )

  it('skip jumps to the next step across rests and block boundaries', () => {
    const h = setup(r)
    h.do(h.s.start)
    h.do(h.s.skip)
    expect(h.s.getState().current?.name).toBe('b')
    h.run(20) // rest
    h.do(h.s.skip)
    expect(h.s.getState().current).toMatchObject({ name: 'c', blockName: 'B' })
  })

  it('skip on the last step finishes', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('a', 20)] }))
    h.do(h.s.start)
    h.do(h.s.skip)
    expect(h.s.getState().status).toBe('finished')
  })

  it('previous restarts a step that ran a while, else goes to the previous step', () => {
    const h = setup(r)
    h.do(h.s.start)
    h.do(h.s.skip) // on b
    h.run(10)
    h.do(h.s.previous)
    expect(h.s.getState().current?.name).toBe('b')
    expect(h.s.getState().stepElapsedMs).toBe(0)
    h.run(1)
    h.do(h.s.previous)
    expect(h.s.getState().current?.name).toBe('a')
  })

  it('previous from a rest replays the step just done; across blocks works backwards', () => {
    const h = setup(r)
    h.do(h.s.start)
    h.run(20)
    expect(h.s.getState().phase).toBe('rest')
    h.do(h.s.previous)
    expect(h.s.getState().current?.name).toBe('a')
    h.do(h.s.skip); h.do(h.s.skip)
    expect(h.s.getState().current?.name).toBe('c')
    h.run(1)
    h.do(h.s.previous)
    expect(h.s.getState().current).toMatchObject({ name: 'b', blockName: 'A' })
  })

  it('previous on the first step restarts it', () => {
    const h = setup(r)
    h.do(h.s.start)
    h.run(1)
    h.do(h.s.previous)
    expect(h.s.getState().current?.name).toBe('a')
    expect(h.s.getState().stepElapsedMs).toBe(0)
  })

  it('skip and previous while paused stay paused', () => {
    const h = setup(r)
    h.do(h.s.start)
    h.do(h.s.pause)
    h.do(h.s.skip)
    expect(h.s.getState()).toMatchObject({ status: 'paused' })
    expect(h.s.getState().current?.name).toBe('b')
    h.jump(100)
    expect(h.s.getState().stepElapsedMs).toBe(0)
  })
})

describe('early stop', () => {
  it('returns steps done, rounds, elapsed and percent', () => {
    const h = setup(routine({ name: 'A', repeat: 2, steps: [step('x', 10), step('y', 10)] }))
    h.do(h.s.start)
    h.run(25) // x, y done (round 1), 5 s into x of round 2
    const u = h.do(h.s.stop)
    const res = u.state.result!
    expect(u.state.status).toBe('stopped')
    expect(res).toMatchObject({ completed: false, stepsDone: 2, stepsTotal: 4, roundsDone: 1, roundsTotal: 2, elapsedMs: 25000, percent: 63 })
  })

  it('does not count a skipped step as done', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10), step('y', 10)] }))
    h.do(h.s.start)
    h.do(h.s.skip)
    const res = h.do(h.s.stop).state.result!
    expect(res.stepsDone).toBe(0)
    expect(res.percent).toBe(0)
  })

  it('stopping before start yields nothing', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10)] }))
    expect(h.do(h.s.stop).state.result).toBeNull()
  })

  it('stays stopped on later updates', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10)] }))
    h.do(h.s.start); h.do(h.s.stop)
    h.jump(100)
    expect(h.s.getState().status).toBe('stopped')
    expect(h.log).toEqual([])
  })
})

describe('cue rules', () => {
  it('ticks the last 5 s of a work step of 8 s or more, none on the first tick', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 8), step('y', 8)] }))
    h.do(h.s.start)
    h.run(16)
    expect(h.cues()).toEqual(['3:beep5', '4:beep4', '5:beep3', '6:beep2', '7:beep1', '11:beep5', '12:beep4', '13:beep3', '14:beep2', '15:beep1', '16:bell'])
  })

  it('no ticks for steps shorter than 8 s', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 7), step('y', 7)] }))
    h.do(h.s.start)
    h.run(14)
    expect(h.cues()).toEqual(['14:bell'])
  })

  it('ticks warm-up steps too', () => {
    const h = setup(routine({ name: 'W', repeat: 1, warmUp: true, steps: [step('x', 10)] }))
    h.do(h.s.start)
    h.run(9)
    expect(h.cues()).toEqual(['5:beep5', '6:beep4', '7:beep3', '8:beep2', '9:beep1'])
  })

  it('rest: rest tone at start, then ticks the last 5 s when the rest lasts >= 8 s, then go', () => {
    const short = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 5, 7), step('y', 5)] }))
    short.do(short.s.start)
    short.run(5 + 7)
    expect(short.cues()).toEqual(['5:rest', '12:go'])
    const long = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 5, 15), step('y', 5)] }))
    long.do(long.s.start)
    long.run(5 + 15)
    expect(long.cues()).toEqual(['5:rest', '15:beep5', '16:beep4', '17:beep3', '18:beep2', '19:beep1', '20:go'])
  })

  it('an 8 s rest ticks from 5 s left, not on its first second', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 5, 8), step('y', 5)] }))
    h.do(h.s.start)
    h.run(5 + 8)
    expect(h.cues()).toEqual(['5:rest', '8:beep5', '9:beep4', '10:beep3', '11:beep2', '12:beep1', '13:go'])
  })

  it('the last tick of a step and the rest tone are one second apart, never together', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10, 10), step('y', 10)] }))
    h.do(h.s.start)
    h.run(20)
    expect(h.cues().slice(0, 7)).toEqual(['5:beep5', '6:beep4', '7:beep3', '8:beep2', '9:beep1', '10:rest', '15:beep5'])
  })

  it('a fresh rest tone noticed after a jump is not stacked with a tick', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10, 8), step('y', 10)] }))
    h.do(h.s.start)
    h.set(13_000) // 3 s into the 8 s rest: rest tone exactly 3 s old (still fresh) and 5 s left
    const u = h.do(h.s.update)
    expect(u.cues.map((c) => c.kind)).toEqual(['rest'])
  })

  it('switch-side pause ticks when it lasts >= 8 s, and not when shorter', () => {
    const long = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 5, 0, { perSide: true })] }), 'play-all', { switchPauseSeconds: 10 })
    long.do(long.s.start)
    long.run(20)
    expect(long.cues()).toEqual(['10:beep5', '11:beep4', '12:beep3', '13:beep2', '14:beep1', '15:go', '20:bell'])
    const short = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 5, 0, { perSide: true })] }), 'play-all', { switchPauseSeconds: 7 })
    short.do(short.s.start)
    short.run(17)
    expect(short.cues()).toEqual(['12:go', '17:bell'])
  })

  it('go tone when a step starts after a rest, not for the first step or without rest', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 5), step('y', 5, 5), step('z', 5)] }))
    h.do(h.s.start)
    h.run(20)
    expect(h.cues()).toEqual(['10:rest', '15:go', '20:bell'])
  })

  it('go tone after the switch pause too', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 5, 0, { perSide: true })] }))
    h.do(h.s.start)
    h.run(15)
    expect(h.cues()).toEqual(['10:go', '15:bell'])
  })

  it('go tone on a manual start after rest in step-by-step', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 5, 5), step('y', 5)] }), 'step-by-step')
    h.do(h.s.start)
    h.run(10)
    expect(h.cues()).toEqual(['5:rest'])
    h.do(h.s.start)
    expect(h.cues()).toEqual(['5:rest', '10:go'])
  })

  it('meditation: no ticks, no go; soft bell at the end of the step, not doubled with the rest tone', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 5, 5), step('m', 20, 5, { kind: 'meditation' }), step('z', 5)] }))
    h.do(h.s.start)
    h.run(5 + 5 + 20 + 5 + 5)
    const kinds = h.log.map((l) => `${l.at}:${l.cue.kind}:${l.cue.reason}`)
    expect(kinds).toEqual(['5:rest:rest-start', '30:bell:meditation-end', '35:go:step-start', '40:bell:routine-end'])
  })

  it('a final meditation step gives a single bell at the end', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('m', 20, 0, { kind: 'meditation' })] }))
    h.do(h.s.start)
    h.run(20)
    expect(h.cues()).toEqual(['20:bell'])
  })

  it('cues are data with a reason', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10)] }))
    h.do(h.s.start)
    h.run(5)
    expect(h.log[0].cue).toEqual({ kind: 'beep', reason: 'tick', secondsLeft: 5, itemIndex: 0 })
  })
})

describe('clock jumps (backgrounding)', () => {
  const r = routine({ name: 'A', repeat: 1, steps: [step('x', 20, 10), step('y', 20, 10), step('z', 20)] })

  it('lands in the right step with correct time left and emits no stale transition cues', () => {
    const h = setup(r)
    h.do(h.s.start)
    h.run(2)
    h.jump(40) // t=42: x 0-20, rest 20-30, y 30-50 -> 12 s into y
    const st = h.s.getState()
    expect(st.current?.name).toBe('y')
    expect(st.stepSecondsLeft).toBe(8)
    expect(h.cues()).toEqual([])
    expect(st.routineRemainingMs).toBe(8000 + 10000 + 20000)
  })

  it('emits only the latest tick after a jump into the last seconds', () => {
    const h = setup(r)
    h.do(h.s.start)
    const u = h.jump(17) // 3 s left in x
    expect(u.cues).toEqual([{ kind: 'beep', reason: 'tick', secondsLeft: 3, itemIndex: 0 }])
  })

  it('emits a fresh start cue when the landing step began just now', () => {
    const h = setup(r)
    h.do(h.s.start)
    const u = h.jump(30.5) // rest ended at 30 -> y began 0.5 s ago
    expect(u.cues.map((c) => c.kind)).toEqual(['go'])
  })

  it('finishing during a long jump keeps state correct; stale bell dropped', () => {
    const h = setup(r)
    h.do(h.s.start)
    const u = h.jump(3600)
    expect(u.state.status).toBe('finished')
    expect(u.cues).toEqual([])
    expect(u.state.result?.percent).toBe(100)
    expect(u.state.result?.elapsedMs).toBe(3600000)
  })

  it('a jump past the end by a moment still rings the bell', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10)] }))
    h.do(h.s.start)
    expect(h.jump(11).cues.map((c) => c.kind)).toEqual(['bell'])
  })

  it('a jump in step-by-step mode stops at the waiting step', () => {
    const h = setup(r, 'step-by-step')
    h.do(h.s.start)
    h.jump(500)
    expect(h.s.getState()).toMatchObject({ status: 'waiting', stepElapsedMs: 0 })
    expect(h.s.getState().current?.name).toBe('y')
  })
})

describe('progress', () => {
  it('reports routine time left and overall progress', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 30, 10), step('y', 20)] }))
    expect(h.s.getState().routineRemainingMs).toBe(60000)
    h.do(h.s.start)
    h.run(30)
    expect(h.s.getState().routineRemainingMs).toBe(30000)
    expect(h.s.getState().progress).toBeCloseTo(0.5)
  })

  it('reports per-block progress across rounds', () => {
    const h = setup(routine(
      { name: 'A', repeat: 2, steps: [step('x', 10)] },
      { name: 'B', repeat: 1, steps: [step('y', 10)] },
    ))
    h.do(h.s.start)
    h.run(5)
    expect(h.s.getState().block).toMatchObject({ index: 0, round: 1, rounds: 2, progress: 0.25 })
    h.run(10)
    expect(h.s.getState().block).toMatchObject({ round: 2, progress: 0.75 })
    h.run(5)
    expect(h.s.getState().block).toMatchObject({ index: 1, name: 'B', progress: 0 })
  })

  it('segments show done, current, upcoming', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10, 5), step('y', 10), step('z', 10)] }))
    h.do(h.s.start)
    h.run(16)
    expect(h.s.getState().block!.segments.map((s) => s.status)).toEqual(['done', 'current', 'upcoming'])
  })
})

describe('subscribe and edge cases', () => {
  it('delivers updates to subscribers and supports unsubscribe', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10)] }))
    const seen: string[] = []
    const off = h.s.subscribe((u) => seen.push(u.state.status))
    h.do(h.s.start)
    off()
    h.do(h.s.pause)
    expect(seen).toEqual(['running'])
  })

  it('an empty routine finishes immediately', () => {
    const h = setup(routine())
    expect(h.do(h.s.start).state.status).toBe('finished')
  })

  it('exposes the flattened plan', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [step('x', 10, 5), step('y', 10)] }))
    expect(h.s.plan.totalMs).toBe(25000)
  })
})

describe('overall progression', () => {
  const r = routine(
    { name: 'Warm', repeat: 1, warmUp: true, steps: [step('w', 10)] },
    { name: 'Empty', repeat: 1, steps: [] },
    { name: 'Main', repeat: 2, steps: [step('a', 10, 10)] },
  )
  it('numbers blocks that have steps (warm-up included, empty ones skipped)', () => {
    const h = setup(r)
    expect(h.s.getState().blockCount).toBe(2)
    h.do(h.s.start)
    expect(h.s.getState()).toMatchObject({ blockNumber: 1, blockCount: 2, overallFraction: 0 })
    expect(h.s.getState().block).toMatchObject({ number: 1, count: 2 })
    h.run(10)
    expect(h.s.getState().blockNumber).toBe(2)
  })
  it('overallFraction is elapsed / total, clamped, 1 when finished', () => {
    const h = setup(r) // total 10 + 10 + 10 + 10 = 40 s (no rest after the warm-up or the last step)
    h.do(h.s.start)
    h.run(10)
    expect(h.s.getState().overallFraction).toBeCloseTo(0.25)
    h.run(10)
    expect(h.s.getState().overallFraction).toBeCloseTo(0.5)
    h.run(20)
    expect(h.s.getState().status).toBe('finished')
    expect(h.s.getState().overallFraction).toBe(1)
  })
  it('stays within 0..1 with reps steps', () => {
    const h = setup(routine({ name: 'A', repeat: 1, steps: [reps('p', 5), step('s', 10)] }))
    h.do(h.s.start)
    h.run(100)
    const f = h.s.getState().overallFraction
    expect(f).toBeGreaterThanOrEqual(0)
    expect(f).toBeLessThanOrEqual(1)
  })
})
