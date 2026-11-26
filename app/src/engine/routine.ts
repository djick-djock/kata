/**
 * Routine model and flattening. Pure data: no React, DOM, audio, storage, no catalog import.
 * A step carries everything the engine needs (name, kind, measure, per side) so the engine
 * never looks anything up.
 */

export type StepRef =
  | { type: 'exercise'; exerciseId: string; variantId?: string }
  | { type: 'custom' }

export type Measure = { type: 'time'; seconds: number } | { type: 'reps'; reps: number }

export interface Step {
  id?: string
  ref: StepRef
  /** Display name (exercise name incl. variant, or the typed custom name). */
  name: string
  /** Category kind of the exercise, e.g. 'meditation'. Meditation steps use only a soft bell. */
  kind?: string
  measure: Measure
  /** Split into a left and a right part with a switch pause between. Each side gets the full measure. */
  perSide?: boolean
  /** Optional written notes of a custom step. Display only, the engine ignores it. */
  details?: string
  /** Rest after this step in seconds, zero allowed. Ignored inside warm-up blocks. */
  restAfterSeconds: number
}

export interface Block {
  id?: string
  name: string
  /** Number of rounds (>= 1). */
  repeat: number
  warmUp?: boolean
  steps: Step[]
}

export interface Routine {
  id?: string
  name: string
  blocks: Block[]
}

export interface EngineSettings {
  /** Pause between the left and right part of a per-side step. Default 5. */
  switchPauseSeconds?: number
  /** Used only to estimate the length of reps steps. Default 3. */
  secondsPerRep?: number
}

export const DEFAULT_SWITCH_PAUSE_SECONDS = 5
export const DEFAULT_SECONDS_PER_REP = 3

export type Phase = 'warmup' | 'work' | 'reps' | 'rest' | 'switch'
export type Side = 'left' | 'right'

export interface PlanItem {
  index: number
  phase: Phase
  /** Step name; 'Rest' for rests, step name for switch pauses. */
  name: string
  /** True for the parts of a step (work, warmup, reps), false for rest and switch. */
  isStep: boolean
  ref: StepRef | null
  kind?: string
  meditation: boolean
  warmUp: boolean
  side?: Side
  perSide: boolean
  reps?: number
  /** Fixed length in ms; null for a reps step (runs until Done). */
  durationMs: number | null
  /** durationMs, or an estimate for reps steps. */
  estimatedMs: number
  blockIndex: number
  blockName: string
  /** 1-based round within the block. */
  round: number
  rounds: number
  /** Logical step number across the whole routine (left, switch, right and rest share it). */
  stepSeq: number
  stepInBlock: number
  stepsInBlock: number
  /** Estimated offset from the routine start in ms. */
  startMs: number
}

export interface Plan {
  items: PlanItem[]
  totalMs: number
  /** True when a reps step makes the total an estimate. */
  approximate: boolean
  stepCount: number
  roundCount: number
}

type Draft = Omit<PlanItem, 'index' | 'startMs'>

export function flattenRoutine(routine: Routine, settings: EngineSettings = {}): Plan {
  const switchMs = Math.max(0, settings.switchPauseSeconds ?? DEFAULT_SWITCH_PAUSE_SECONDS) * 1000
  const perRepMs = Math.max(0, settings.secondsPerRep ?? DEFAULT_SECONDS_PER_REP) * 1000
  const drafts: Draft[] = []
  let approximate = false
  let seq = 0
  let roundCount = 0

  routine.blocks.forEach((block, blockIndex) => {
    const rounds = Math.max(1, Math.floor(block.repeat || 1))
    const steps = block.steps.filter((s) =>
      s.measure.type === 'time' ? s.measure.seconds > 0 : s.measure.reps > 0,
    )
    if (steps.length === 0) return
    for (let round = 1; round <= rounds; round++) {
      roundCount++
      steps.forEach((step, stepInBlock) => {
        const meditation = step.kind === 'meditation'
        const base = {
          blockIndex,
          blockName: block.name,
          round,
          rounds,
          stepSeq: seq,
          stepInBlock,
          stepsInBlock: steps.length,
          warmUp: !!block.warmUp,
        }
        const part = (side?: Side): Draft => {
          const isReps = step.measure.type === 'reps'
          if (isReps) approximate = true
          const reps = step.measure.type === 'reps' ? step.measure.reps : undefined
          const durationMs = step.measure.type === 'time' ? step.measure.seconds * 1000 : null
          return {
            ...base,
            phase: isReps ? 'reps' : block.warmUp ? 'warmup' : 'work',
            name: step.name,
            isStep: true,
            ref: step.ref,
            kind: step.kind,
            meditation,
            side,
            perSide: !!step.perSide,
            reps,
            durationMs,
            estimatedMs: durationMs ?? (reps ?? 0) * perRepMs,
          }
        }
        if (step.perSide) {
          drafts.push(part('left'))
          if (switchMs > 0)
            drafts.push({
              ...base,
              phase: 'switch',
              name: step.name,
              isStep: false,
              ref: step.ref,
              kind: step.kind,
              meditation: false,
              perSide: true,
              durationMs: switchMs,
              estimatedMs: switchMs,
            })
          drafts.push(part('right'))
        } else {
          drafts.push(part())
        }
        const restMs = block.warmUp ? 0 : Math.max(0, step.restAfterSeconds || 0) * 1000
        if (restMs > 0)
          drafts.push({
            ...base,
            phase: 'rest',
            name: 'Rest',
            isStep: false,
            ref: null,
            meditation: false,
            perSide: false,
            durationMs: restMs,
            estimatedMs: restMs,
          })
        seq++
      })
    }
  })

  // No rest after the very last step of the routine.
  if (drafts.length && drafts[drafts.length - 1].phase === 'rest') drafts.pop()

  let t = 0
  const items = drafts.map((d, index) => {
    const item: PlanItem = { ...d, index, startMs: t }
    t += d.estimatedMs
    return item
  })
  return { items, totalMs: t, approximate, stepCount: seq, roundCount }
}

/** Total duration for the builder header. `approximate` is true when a reps step is present. */
export function routineDuration(
  routine: Routine,
  settings: EngineSettings = {},
): { seconds: number; approximate: boolean } {
  const plan = flattenRoutine(routine, settings)
  return { seconds: Math.round(plan.totalMs / 1000), approximate: plan.approximate }
}
