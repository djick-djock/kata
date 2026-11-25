/**
 * Pure interval timer. No DOM, no audio, no real clock: time comes from an injected
 * `now()` (milliseconds). Remaining time is derived from timestamps, never from counting
 * ticks, so a throttled or frozen page that wakes up late still reports the right state.
 *
 * Drive it by calling `update()` often (UI interval, visibilitychange). Other modules
 * subscribe with `on()` to react to events without touching the timer.
 */

export type PhaseKind = 'work' | 'rest'

export interface TimerConfig {
  workSeconds: number
  restSeconds: number
  rounds: number
}

export interface Phase {
  index: number
  kind: PhaseKind
  /** 1-based round number */
  round: number
  durationMs: number
  startMs: number // offset from timer start (active time)
  endMs: number
}

export type TimerEvent =
  | { type: 'phase-start'; phase: Phase }
  /** secondsLeft = whole seconds remaining, rounded up; fires once per second, latest value only after a jump */
  | { type: 'tick'; phase: Phase; secondsLeft: number }
  | { type: 'phase-end'; phase: Phase }
  | { type: 'finish' }

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface TimerSnapshot {
  status: TimerStatus
  phase: Phase | null
  secondsLeft: number
  remainingMs: number
  round: number
  rounds: number
  elapsedMs: number
  totalMs: number
}

export const DEFAULT_CONFIG: TimerConfig = { workSeconds: 20, restSeconds: 10, rounds: 11 }

export function buildSchedule(config: TimerConfig): Phase[] {
  const phases: Phase[] = []
  let t = 0
  const add = (kind: PhaseKind, round: number, seconds: number) => {
    if (seconds <= 0) return
    phases.push({ index: phases.length, kind, round, durationMs: seconds * 1000, startMs: t, endMs: t + seconds * 1000 })
    t += seconds * 1000
  }
  for (let r = 1; r <= config.rounds; r++) {
    add('work', r, config.workSeconds)
    if (r < config.rounds) add('rest', r, config.restSeconds)
  }
  return phases
}

export type Listener = (event: TimerEvent) => void

export function createTimer(config: TimerConfig, now: () => number) {
  const phases = buildSchedule(config)
  const totalMs = phases.length ? phases[phases.length - 1].endMs : 0
  const listeners = new Set<Listener>()

  let status: TimerStatus = 'idle'
  let accumulated = 0 // active ms before the current run segment
  let segmentStart = 0
  // Event cursor: the phase whose start has been emitted, and last tick value emitted in it.
  let cursor = -1
  let lastTick = Infinity

  const emit = (e: TimerEvent) => listeners.forEach((l) => l(e))

  const elapsed = () => {
    const e = status === 'running' ? accumulated + (now() - segmentStart) : accumulated
    return Math.min(Math.max(e, 0), totalMs)
  }

  function phaseAt(ms: number): Phase | null {
    return phases.find((p) => ms < p.endMs) ?? null
  }

  function snapshot(): TimerSnapshot {
    const e = elapsed()
    const phase = status === 'finished' ? null : phaseAt(e)
    const remainingMs = phase ? phase.endMs - e : 0
    return {
      status,
      phase,
      remainingMs,
      secondsLeft: Math.ceil(remainingMs / 1000),
      round: phase?.round ?? (status === 'finished' ? config.rounds : 0),
      rounds: config.rounds,
      elapsedMs: e,
      totalMs,
    }
  }

  /** Emit every event that is due, in order. Safe to call at any frequency. */
  function update(): TimerSnapshot {
    if (status !== 'running') return snapshot()
    const e = elapsed()
    // Close and open phases that were completed (also across a big clock jump).
    while (cursor < phases.length && (cursor < 0 || e >= phases[cursor].endMs)) {
      if (cursor >= 0) emit({ type: 'phase-end', phase: phases[cursor] })
      cursor++
      lastTick = Infinity
      if (cursor < phases.length) emit({ type: 'phase-start', phase: phases[cursor] })
    }
    if (cursor >= phases.length) {
      status = 'finished'
      accumulated = totalMs
      emit({ type: 'finish' })
      return snapshot()
    }
    const phase = phases[cursor]
    const secondsLeft = Math.ceil((phase.endMs - e) / 1000)
    if (secondsLeft < lastTick) {
      lastTick = secondsLeft
      emit({ type: 'tick', phase, secondsLeft })
    }
    return snapshot()
  }

  return {
    config,
    phases,
    on(listener: Listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    start() {
      if (status === 'running' || totalMs === 0) return
      accumulated = 0
      cursor = -1
      lastTick = Infinity
      segmentStart = now()
      status = 'running'
      update()
    },
    pause() {
      if (status !== 'running') return
      update()
      if (status !== 'running') return
      accumulated = elapsed()
      status = 'paused'
    },
    resume() {
      if (status !== 'paused') return
      segmentStart = now()
      status = 'running'
      update()
    },
    stop() {
      status = 'idle'
      accumulated = 0
      cursor = -1
      lastTick = Infinity
    },
    update,
    snapshot,
  }
}

export type Timer = ReturnType<typeof createTimer>
