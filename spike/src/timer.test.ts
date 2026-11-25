import { describe, expect, it } from 'vitest'
import { buildSchedule, createTimer, type TimerEvent } from './timer'

function setup(cfg = { workSeconds: 5, restSeconds: 3, rounds: 2 }) {
  let t = 1_000_000
  const timer = createTimer(cfg, () => t)
  const events: TimerEvent[] = []
  timer.on((e) => events.push(e))
  const advance = (ms: number) => {
    t += ms
    return timer.update()
  }
  return { timer, events, advance, jump: advance }
}
const kinds = (ev: TimerEvent[]) =>
  ev.map((e) => (e.type === 'finish' ? 'finish' : `${e.type}:${'phase' in e ? e.phase.kind + e.phase.round : ''}`))

describe('schedule', () => {
  it('has work/rest per round with no trailing rest, default >= 5 min', () => {
    const s = buildSchedule({ workSeconds: 5, restSeconds: 3, rounds: 2 })
    expect(s.map((p) => p.kind)).toEqual(['work', 'rest', 'work'])
    const d = buildSchedule({ workSeconds: 20, restSeconds: 10, rounds: 11 })
    expect(d[d.length - 1].endMs).toBeGreaterThanOrEqual(300_000)
  })
})

describe('timestamps, not ticks', () => {
  it('reports correct remaining time after a large clock jump with no updates in between', () => {
    const { timer, advance, jump } = setup({ workSeconds: 20, restSeconds: 10, rounds: 11 })
    timer.start()
    advance(1000)
    const s = jump(95_500) // 96.5 s elapsed: 3 full 30 s cycles (90) + 6.5 s into round 4 work
    expect(s.phase?.kind).toBe('work')
    expect(s.round).toBe(4)
    expect(s.remainingMs).toBe(13_500)
    expect(s.secondsLeft).toBe(14)
  })

  it('emits ordered phase boundaries across a jump and only the latest tick', () => {
    const { timer, events, jump } = setup()
    timer.start()
    events.length = 0
    jump(9_000) // into the second work phase (5+3=8s), 1 s in
    expect(kinds(events)).toEqual(['phase-end:work1', 'phase-start:rest1', 'phase-end:rest1', 'phase-start:work2', 'tick:work2'])
    const tick = events[events.length - 1]
    expect(tick.type === 'tick' && tick.secondsLeft).toBe(4)
  })
})

describe('sequencing and finish', () => {
  it('walks every phase in order with per-second ticks and finishes once', () => {
    const { timer, events, advance } = setup()
    timer.start()
    for (let i = 0; i < 130; i++) advance(100) // 13 s total (> 13 s needed is 13)
    expect(kinds(events).filter((k) => !k.startsWith('tick'))).toEqual([
      'phase-start:work1',
      'phase-end:work1',
      'phase-start:rest1',
      'phase-end:rest1',
      'phase-start:work2',
      'phase-end:work2',
      'finish',
    ])
    const workTicks = events.filter((e) => e.type === 'tick' && e.phase.index === 0).map((e) => (e as { secondsLeft: number }).secondsLeft)
    expect(workTicks).toEqual([5, 4, 3, 2, 1])
    expect(timer.snapshot().status).toBe('finished')
    advance(5000)
    expect(events.filter((e) => e.type === 'finish')).toHaveLength(1)
  })
})

describe('pause and resume', () => {
  it('does not advance while paused and continues from where it stopped', () => {
    const { timer, advance } = setup()
    timer.start()
    advance(2000)
    timer.pause()
    const before = timer.snapshot().remainingMs
    expect(before).toBe(3000)
    advance(60_000)
    expect(timer.snapshot().status).toBe('paused')
    expect(timer.snapshot().remainingMs).toBe(3000)
    timer.resume()
    const s = advance(1000)
    expect(s.remainingMs).toBe(2000)
    expect(s.phase?.kind).toBe('work')
  })

  it('stop returns to idle and allows a fresh start', () => {
    const { timer, advance } = setup()
    timer.start()
    advance(4000)
    timer.stop()
    expect(timer.snapshot().status).toBe('idle')
    timer.start()
    expect(timer.snapshot().remainingMs).toBe(5000)
  })
})
