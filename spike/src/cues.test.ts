import { describe, expect, it } from 'vitest'
import { CUES, CUE_NAMES, cueFor } from './cues'
import { buildSchedule, createTimer, type TimerEvent } from './timer'

function run(config: { workSeconds: number; restSeconds: number; rounds: number }, jumpTo?: number[]) {
  let t = 0
  const timer = createTimer(config, () => t)
  const log: { at: number; cue: string }[] = []
  timer.on((e: TimerEvent) => {
    const cue = cueFor(e)
    if (cue) log.push({ at: Math.round(t / 1000), cue })
  })
  timer.start()
  const total = buildSchedule(config).at(-1)!.endMs
  for (const j of jumpTo ?? Array.from({ length: total / 1000 + 1 }, (_, i) => i)) {
    t = j * 1000
    timer.update()
  }
  return log
}

describe('cueFor', () => {
  it('beeps on the last 5 seconds of work, then go after rest, rest tone, bell', () => {
    const log = run({ workSeconds: 10, restSeconds: 4, rounds: 2 })
    expect(log).toEqual([
      { at: 5, cue: 'beep' }, { at: 6, cue: 'beep' }, { at: 7, cue: 'beep' }, { at: 8, cue: 'beep' }, { at: 9, cue: 'beep' },
      { at: 10, cue: 'rest' },
      { at: 14, cue: 'go' },
      { at: 19, cue: 'beep' }, { at: 20, cue: 'beep' }, { at: 21, cue: 'beep' }, { at: 22, cue: 'beep' }, { at: 23, cue: 'beep' },
      { at: 24, cue: 'bell' },
    ])
  })
  it('no go tone on the first work phase and no beeps during rest', () => {
    const cues = run({ workSeconds: 8, restSeconds: 8, rounds: 2 }).map((l) => l.cue)
    expect(cues.filter((c) => c === 'go')).toHaveLength(1)
    expect(cues.filter((c) => c === 'beep')).toHaveLength(10)
  })
  it('short work phase does not beep on the first tick (clashes with the start cue)', () => {
    const cues = run({ workSeconds: 3, restSeconds: 2, rounds: 2 }).map((l) => l.cue)
    expect(cues).toEqual(['beep', 'beep', 'rest', 'go', 'beep', 'beep', 'bell'])
  })
  it('after a big clock jump only the latest tick cues, missed beeps are not replayed', () => {
    const log = run({ workSeconds: 20, restSeconds: 10, rounds: 1 }, [0, 17.2, 20])
    expect(log).toEqual([{ at: 17, cue: 'beep' }, { at: 20, cue: 'bell' }])
  })
  it('ignores unrelated events', () => {
    expect(cueFor({ type: 'phase-end' })).toBeNull()
  })
})

describe('CUES', () => {
  it('every cue has tones; go differs from beep; rest is lower and softer than go', () => {
    for (const n of CUE_NAMES) expect(CUES[n].length).toBeGreaterThan(0)
    expect(CUES.go[0].freq).not.toBe(CUES.beep[0].freq)
    expect(CUES.rest[0].freq).toBeLessThan(CUES.go[0].freq)
    expect(CUES.rest[0].gain).toBeLessThan(CUES.go[0].gain)
  })
})
