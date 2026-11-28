/**
 * Session engine. Pure and event-driven. All timing derives from the injected `now()` (ms):
 * the current item's start timestamp, never tick counting. After a large clock jump the state
 * is correct and only the latest tick (and, if still fresh, the latest transition cue) is emitted.
 *
 * Every method returns an Update { state, cues }; subscribers get the same objects.
 * Cues are data, never sound.
 */
import {
  flattenRoutine,
  type EngineSettings,
  type Phase,
  type Plan,
  type PlanItem,
  type Routine,
} from './routine'

export type SessionMode = 'play-all' | 'step-by-step'
export type SessionStatus = 'idle' | 'running' | 'paused' | 'waiting' | 'finished' | 'stopped'

export type CueKind = 'beep' | 'go' | 'rest' | 'bell'
export type CueReason = 'tick' | 'step-start' | 'rest-start' | 'meditation-end' | 'routine-end'

export interface Cue {
  kind: CueKind
  reason: CueReason
  /** Whole seconds left, for ticks. */
  secondsLeft?: number
  /** Index of the plan item the cue belongs to. */
  itemIndex: number
}

/** Cue rules, exported so the UI/tests can reference them. */
export const TICK_SECONDS = 5
export const MIN_STEP_TICK_SECONDS = 8
/** Rests and switch-side pauses tick too, with the same threshold as steps: the countdown before the next exercise. */
export const MIN_REST_TICK_SECONDS = MIN_STEP_TICK_SECONDS
/** Transition cues older than this when noticed (backgrounding) are dropped. */
export const STALE_CUE_MS = 3000
/** Previous restarts the current step when it has run at least this long. */
export const RESTART_AFTER_MS = 3000

export interface SessionResult {
  /** True when the routine ran to its end. */
  completed: boolean
  stepsDone: number
  stepsTotal: number
  roundsDone: number
  roundsTotal: number
  /** Active time (excludes pauses and waiting between steps in step-by-step mode). */
  elapsedMs: number
  /** 0..100 */
  percent: number
}

export interface SegmentProgress {
  stepInBlock: number
  name: string
  status: 'done' | 'current' | 'upcoming'
  /** 0..1, per-side parts and switch pause included. */
  fraction: number
}

export interface BlockProgress {
  index: number
  /** 1-based position among the blocks that have steps (warm-up blocks included). */
  number: number
  /** How many blocks have steps. */
  count: number
  name: string
  warmUp: boolean
  round: number
  rounds: number
  /** 0..1 across all rounds of the block. */
  progress: number
  /** One segment per step of the current round. */
  segments: SegmentProgress[]
}

export interface SessionState {
  status: SessionStatus
  mode: SessionMode
  /** Phase of the current item (the upcoming step while waiting); null when idle or over. */
  phase: Phase | null
  current: PlanItem | null
  /** Next step part to come (skips rests and switch pauses): the "Next" / "Up next" card. */
  next: PlanItem | null
  itemIndex: number
  itemCount: number
  stepElapsedMs: number
  /** Time left in the current item, null for reps steps. */
  stepRemainingMs: number | null
  stepSecondsLeft: number | null
  routineRemainingMs: number
  /** True when routineRemainingMs is an estimate because of reps steps. */
  approximate: boolean
  /** Active time so far. */
  elapsedMs: number
  /** 0..1 position in the routine. */
  progress: number
  /** Overall routine progress, elapsed / total from the plan (an estimate with reps steps), clamped 0..1. */
  overallFraction: number
  /** 1-based number of the current block among blocks with steps; 0 when there is no current item. */
  blockNumber: number
  /** Blocks that have steps. */
  blockCount: number
  block: BlockProgress | null
  /** Present once finished or stopped. */
  result: SessionResult | null
}

export interface Update {
  state: SessionState
  cues: Cue[]
}

export interface SessionOptions {
  routine: Routine
  mode?: SessionMode
  settings?: EngineSettings
  now: () => number
}

const isStepPhase = (p: Phase) => p === 'work' || p === 'warmup' || p === 'reps'

export function createSession(opts: SessionOptions) {
  const mode: SessionMode = opts.mode ?? 'play-all'
  const now = opts.now
  const plan: Plan = flattenRoutine(opts.routine, opts.settings)
  const items = plan.items

  let status: SessionStatus = 'idle'
  let idx = 0
  let itemStart = 0 // timestamp the current item (virtually) started, while running
  let heldElapsed = 0 // elapsed in current item while paused
  let lastTick = Infinity
  let lastSettle = 0
  let activeMs = 0
  let result: SessionResult | null = null
  const progressed = items.map(() => 0) // best ms progressed per item
  const finishedItem = items.map(() => false)
  const blockOrder = [...new Set(items.map((i) => i.blockIndex))]
  const listeners = new Set<(u: Update) => void>()

  // ---- helpers -----------------------------------------------------------

  const gated = (item: PlanItem) => mode === 'step-by-step' && isStepPhase(item.phase) && item.side !== 'right'

  function elapsedInItem(t: number): number {
    if (status === 'running') return Math.max(0, t - itemStart)
    if (status === 'paused') return heldElapsed
    return 0
  }

  function startCues(i: number): Cue[] {
    const item = items[i]
    if (item.meditation) return []
    if (item.phase === 'rest') return [{ kind: 'rest', reason: 'rest-start', itemIndex: i }]
    if (isStepPhase(item.phase) && i > 0) {
      const prev = items[i - 1].phase
      if (prev === 'rest' || prev === 'switch') return [{ kind: 'go', reason: 'step-start', itemIndex: i }]
    }
    return []
  }

  function leaveCues(i: number): Cue[] {
    return items[i].meditation ? [{ kind: 'bell', reason: 'meditation-end', itemIndex: i }] : []
  }

  function computeResult(t: number, completed: boolean): SessionResult {
    const partial = progressed.slice()
    if (!completed && (status === 'running' || status === 'paused') && items[idx]) {
      partial[idx] = Math.max(partial[idx], Math.min(elapsedInItem(t), items[idx].estimatedMs))
    }
    const doneMs = partial.reduce((a, b) => a + b, 0)
    const seqDone = new Map<number, boolean>()
    const roundOf = new Map<string, number[]>()
    items.forEach((it, i) => {
      if (!it.isStep) return
      seqDone.set(it.stepSeq, (seqDone.get(it.stepSeq) ?? true) && finishedItem[i])
      const key = `${it.blockIndex}:${it.round}`
      const list = roundOf.get(key) ?? []
      if (!list.includes(it.stepSeq)) list.push(it.stepSeq)
      roundOf.set(key, list)
    })
    let roundsDone = 0
    roundOf.forEach((seqs) => {
      if (seqs.every((s) => seqDone.get(s))) roundsDone++
    })
    return {
      completed,
      stepsDone: [...seqDone.values()].filter(Boolean).length,
      stepsTotal: plan.stepCount,
      roundsDone,
      roundsTotal: plan.roundCount,
      elapsedMs: Math.round(activeMs),
      percent: completed ? 100 : plan.totalMs ? Math.min(100, Math.round((doneMs / plan.totalMs) * 100)) : 0,
    }
  }

  function finish(t: number, at: number): Cue[] {
    status = 'finished'
    result = computeResult(t, true)
    if (t - at > STALE_CUE_MS || items.length === 0) return []
    return [{ kind: 'bell', reason: 'routine-end', itemIndex: items.length - 1 }]
  }

  /** Complete item idx at timestamp `at` and move on. Returns the transition cues. */
  function advance(t: number, at: number): Cue[] {
    const from = idx
    progressed[from] = Math.max(progressed[from], items[from].estimatedMs)
    if (items[from].isStep) finishedItem[from] = true
    const next = from + 1
    if (next >= items.length) {
      // Routine end: a single soft bell (also when the last step is meditation).
      return finish(t, at)
    }
    const leave = leaveCues(from)
    idx = next
    lastTick = Infinity
    let cues: Cue[]
    if (gated(items[next])) {
      status = 'waiting'
      cues = leave
    } else {
      itemStart = at
      const start = startCues(next)
      // A bell already marks the moment: no extra rest tone on top of it.
      cues = leave.length ? leave : start
    }
    return t - at > STALE_CUE_MS ? [] : cues
  }

  /** Move through everything that is due. Emits only the latest transition and tick. */
  function settle(): Cue[] {
    const t = now()
    if (status === 'running') {
      activeMs += t - lastSettle
      lastSettle = t
    }
    let cues: Cue[] = []
    let transitioned = false
    while (status === 'running') {
      const item = items[idx]
      if (item.durationMs === null || t - itemStart < item.durationMs) break
      const at = itemStart + item.durationMs
      cues = advance(t, at)
      transitioned = true
    }
    if (status === 'running') {
      const item = items[idx]
      const dur = item.durationMs
      const minTick =
        item.phase === 'rest' || item.phase === 'switch'
          ? MIN_REST_TICK_SECONDS
          : isStepPhase(item.phase) && !item.meditation ? MIN_STEP_TICK_SECONDS : Infinity
      if (dur !== null && dur >= minTick * 1000) {
        const s = Math.ceil((dur - (t - itemStart)) / 1000)
        if (s >= 1 && s <= TICK_SECONDS && s * 1000 < dur && s < lastTick) {
          lastTick = s
          // A transition cue noticed in this same update (rest / go / bell) already marks the moment:
          // never stack a tick on top of it (a fresh rest cue and the first tick can coincide).
          if (!(transitioned && cues.length)) cues = [...cues, { kind: 'beep', reason: 'tick', secondsLeft: s, itemIndex: idx }]
        }
      }
    }
    return cues
  }

  function snapshot(): SessionState {
    const t = now()
    const item = status === 'finished' || status === 'stopped' || status === 'idle' ? null : (items[idx] ?? null)
    const el = item ? elapsedInItem(t) : 0
    const remainingMs = item && item.durationMs !== null ? Math.max(0, item.durationMs - el) : null
    let routineRemaining = 0
    if (status === 'idle') routineRemaining = plan.totalMs
    else if (item) {
      routineRemaining = Math.max(0, item.estimatedMs - el)
      for (let i = idx + 1; i < items.length; i++) routineRemaining += items[i].estimatedMs
    }
    const prog = (i: number): number => {
      if (status === 'finished') return items[i].estimatedMs
      if (status === 'idle') return 0
      if (i < idx) return items[i].estimatedMs
      if (i === idx) return Math.min(el, items[i].estimatedMs)
      return 0
    }
    let next: PlanItem | null = null
    if (item) for (let i = idx + 1; i < items.length; i++) if (items[i].isStep) { next = items[i]; break }
    const total = plan.totalMs
    let progress = 0
    if (status === 'finished') progress = 1
    else if (item && total) progress = items.reduce((a, it) => a + prog(it.index), 0) / total

    const overallFraction = Math.min(1, Math.max(0, status === 'finished' ? 1 : progress))
    const blockNumber = item ? blockOrder.indexOf(item.blockIndex) + 1 : 0

    let block: BlockProgress | null = null
    if (item) {
      const inBlock = items.filter((i) => i.blockIndex === item.blockIndex)
      const blockTotal = inBlock.reduce((a, i) => a + i.estimatedMs, 0)
      const blockDone = inBlock.reduce((a, i) => a + prog(i.index), 0)
      const segments: SegmentProgress[] = []
      for (let s = 0; s < item.stepsInBlock; s++) {
        const parts = inBlock.filter((i) => i.round === item.round && i.stepInBlock === s && i.phase !== 'rest')
        if (!parts.length) continue
        const tot = parts.reduce((a, i) => a + i.estimatedMs, 0)
        const got = parts.reduce((a, i) => a + prog(i.index), 0)
        const last = parts[parts.length - 1].index
        const first = parts[0].index
        segments.push({
          stepInBlock: s,
          name: parts[0].name,
          status: idx > last ? 'done' : idx >= first ? 'current' : 'upcoming',
          fraction: tot ? got / tot : 0,
        })
      }
      block = {
        index: item.blockIndex,
        number: blockNumber,
        count: blockOrder.length,
        name: item.blockName,
        warmUp: item.warmUp,
        round: item.round,
        rounds: item.rounds,
        progress: blockTotal ? blockDone / blockTotal : 0,
        segments,
      }
    }
    return {
      status,
      mode,
      phase: item ? item.phase : null,
      current: item,
      next,
      itemIndex: idx,
      itemCount: items.length,
      stepElapsedMs: el,
      stepRemainingMs: remainingMs,
      stepSecondsLeft: remainingMs === null ? null : Math.ceil(remainingMs / 1000),
      routineRemainingMs: routineRemaining,
      approximate: plan.approximate,
      elapsedMs: Math.round(status === 'running' ? activeMs + Math.max(0, t - lastSettle) : activeMs),
      progress,
      overallFraction,
      blockNumber,
      blockCount: blockOrder.length,
      block,
      result,
    }
  }

  function out(cues: Cue[]): Update {
    const u: Update = { state: snapshot(), cues }
    listeners.forEach((l) => l(u))
    return u
  }

  const isLive = () => status === 'running' || status === 'paused' || status === 'waiting'

  /** First item of a logical step. */
  const firstOfSeq = (seq: number) => items.findIndex((i) => i.stepSeq === seq)

  function goTo(target: number): Cue[] {
    const t = now()
    if (status === 'running') {
      activeMs += t - lastSettle
      lastSettle = t
    }
    idx = target
    lastTick = Infinity
    heldElapsed = 0
    if (gated(items[idx])) {
      status = 'waiting'
      return []
    }
    if (status === 'paused') return []
    status = 'running'
    itemStart = t
    lastSettle = t
    return startCues(idx)
  }

  // ---- public events -----------------------------------------------------

  const api = {
    plan,
    mode,
    /**
     * Begins the session; in step-by-step mode the first step starts right away, and calling
     * start() again while status is 'waiting' begins the waiting step.
     */
    start(): Update {
      const t = now()
      if (status === 'idle') {
        if (items.length === 0) return out(finish(t, t))
        status = 'running'
        idx = 0
        itemStart = t
        lastSettle = t
        activeMs = 0
        lastTick = Infinity
        return out(settle())
      }
      if (status === 'waiting') {
        status = 'running'
        itemStart = t
        lastSettle = t
        lastTick = Infinity
        return out([...startCues(idx), ...settle()])
      }
      return out([])
    },
    pause(): Update {
      if (status !== 'running') return out([])
      const cues = settle()
      if (status === 'running') {
        heldElapsed = now() - itemStart
        status = 'paused'
      }
      return out(cues)
    },
    resume(): Update {
      if (status === 'waiting') return api.start()
      if (status !== 'paused') return out([])
      const t = now()
      status = 'running'
      itemStart = t - heldElapsed
      lastSettle = t
      return out(settle())
    },
    /** Jump to the first part of the next step (from a rest, to the step after it). Past the last step: finish. */
    skip(): Update {
      if (!isLive()) return out([])
      const pre = status === 'running' ? settle() : []
      if (!isLive()) return out(pre)
      const nextSeq = items[idx].stepSeq + 1
      const target = firstOfSeq(nextSeq)
      if (target < 0) {
        const t = now()
        if (status === 'running') activeMs += t - lastSettle
        return out(finish(t, t))
      }
      return out(goTo(target))
    },
    /**
     * From a rest or switch pause, restarts the step just done; during a step, restarts it if it
     * has run 3 s or more (or is a right side), otherwise goes to the previous step.
     */
    previous(): Update {
      if (!isLive()) return out([])
      if (status === 'running') settle()
      if (!isLive()) return out([])
      const item = items[idx]
      const el = elapsedInItem(now())
      const restart = !isStepPhase(item.phase) || el >= RESTART_AFTER_MS || item.side === 'right'
      const seq = restart ? item.stepSeq : Math.max(0, item.stepSeq - 1)
      return out(goTo(firstOfSeq(seq)))
    },
    /** Done on a reps step: moves to the following rest (or step). */
    repsDone(): Update {
      if (status !== 'running') return out([])
      const pre = settle()
      if (status !== 'running' || items[idx].durationMs !== null) return out(pre)
      const t = now()
      return out(advance(t, t))
    },
    /** Early stop: returns the update with a partial result in state.result. */
    stop(): Update {
      if (status === 'running') settle()
      if (status === 'finished' || status === 'stopped' || status === 'idle') return out([])
      result = computeResult(now(), false)
      status = 'stopped'
      return out([])
    },
    /** Call often (UI interval, visibilitychange). Safe at any frequency. */
    update(): Update {
      return out(settle())
    },
    getState(): SessionState {
      return snapshot()
    },
    subscribe(listener: (u: Update) => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
  return api
}

export type Session = ReturnType<typeof createSession>
