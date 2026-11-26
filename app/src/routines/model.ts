// Pure routine-building helpers: no React, no storage. The builder and the repository use these.
import { findExercise, localized, type Category, type Exercise } from '../catalog'
import { routineDuration, type Measure } from '../engine'
import type { BlockDefaults, KataRoutine, RoutineBlock, RoutineStep } from '../data/routine-types'

export function uid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const DEFAULT_REST_SECONDS = 15

export interface RoutineTemplate {
  id: 'intervals' | 'tabata' | 'stretch-flow'
  name: string
  category: Category
  workSeconds: number
  restSeconds: number
  rounds: number
  summary: string
}

export const TEMPLATES: readonly RoutineTemplate[] = [
  { id: 'intervals', name: 'Intervals', category: 'hiit', workSeconds: 45, restSeconds: 15, rounds: 2, summary: '45 s work · 15 s rest · ×2' },
  { id: 'tabata', name: 'Tabata', category: 'hiit', workSeconds: 20, restSeconds: 10, rounds: 8, summary: '20 s · 10 s · ×8' },
  { id: 'stretch-flow', name: 'Stretch flow', category: 'stretch', workSeconds: 30, restSeconds: 0, rounds: 1, summary: '30 s each · no rest' },
]

export function newBlock(name = 'Block A', init: Partial<RoutineBlock> = {}): RoutineBlock {
  return { id: uid(), name, repeat: 1, steps: [], ...init }
}

export function nextBlockName(blocks: readonly RoutineBlock[]): string {
  const taken = new Set(blocks.map((b) => b.name))
  for (let i = 0; i < 26; i++) {
    const name = `Block ${String.fromCharCode(65 + i)}`
    if (!taken.has(name)) return name
  }
  return `Block ${blocks.length + 1}`
}

export function blankRoutine(now = Date.now()): KataRoutine {
  return { id: uid(), name: 'New routine', category: 'strength', pinned: false, blocks: [newBlock('Block A')], createdFrom: 'blank', createdAt: now, updatedAt: now }
}

/** A template creates one block with the right repeat and timing defaults; steps are empty slots to fill. */
export function routineFromTemplate(template: RoutineTemplate, now = Date.now()): KataRoutine {
  const defaults: BlockDefaults = { workSeconds: template.workSeconds, restSeconds: template.restSeconds }
  return {
    id: uid(),
    name: template.name,
    category: template.category,
    pinned: false,
    blocks: [newBlock('Block A', { repeat: template.rounds, defaults })],
    createdFrom: 'template',
    createdAt: now,
    updatedAt: now,
  }
}

/** Display name of an exercise step, including the variant label when there is one. */
export function stepName(exercise: Exercise, variantId?: string): string {
  const base = localized(exercise.name)
  const variant = exercise.variants?.find((v) => v.id === variantId)
  return variant ? `${base} (${localized(variant.label)})` : base
}

/** Catalog step with name and kind filled from the catalog. Block defaults and warm-up shape its timing. */
export function catalogStep(exerciseId: string, block: Pick<RoutineBlock, 'warmUp' | 'defaults'>, variantId?: string): RoutineStep | null {
  const exercise = findExercise(exerciseId)
  if (!exercise) return null
  const d = block.defaults
  const measure: Measure = d ? { type: 'time', seconds: d.workSeconds } : exercise.measure.type === 'reps' ? { type: 'reps', reps: exercise.measure.value } : { type: 'time', seconds: exercise.measure.value }
  return {
    id: uid(),
    ref: { type: 'exercise', exerciseId, ...(variantId ? { variantId } : {}) },
    name: stepName(exercise, variantId),
    kind: exercise.category,
    measure,
    perSide: exercise.perSide,
    restAfterSeconds: block.warmUp ? 0 : d ? d.restSeconds : DEFAULT_REST_SECONDS,
  }
}

export function customStep(input: { name: string; measure: Measure; perSide?: boolean; restAfterSeconds?: number }): RoutineStep {
  return { id: uid(), ref: { type: 'custom' }, name: input.name.trim() || 'Custom step', measure: input.measure, perSide: !!input.perSide, restAfterSeconds: input.restAfterSeconds ?? DEFAULT_REST_SECONDS }
}

/**
 * Re-reads each exercise step against the catalog: refreshes name and kind, drops an unknown variant,
 * and turns a step whose exercise is gone into a custom step that keeps its saved name.
 */
export function resolveRoutine(routine: KataRoutine): KataRoutine {
  return {
    ...routine,
    blocks: routine.blocks.map((block) => ({
      ...block,
      steps: block.steps.map((step): RoutineStep => {
        if (step.ref.type !== 'exercise') return step
        const exercise = findExercise(step.ref.exerciseId)
        if (!exercise) return { ...step, ref: { type: 'custom' }, kind: undefined }
        const variantId = exercise.variants?.some((v) => v.id === (step.ref as { variantId?: string }).variantId) ? (step.ref as { variantId?: string }).variantId : undefined
        return { ...step, ref: { type: 'exercise', exerciseId: exercise.id, ...(variantId ? { variantId } : {}) }, name: stepName(exercise, variantId), kind: exercise.category }
      }),
    })),
  }
}

export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return [...list]
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function routineTotal(routine: Pick<KataRoutine, 'name' | 'blocks'>) {
  return routineDuration(routine)
}

export function blockTotal(block: RoutineBlock) {
  return routineDuration({ name: block.name, blocks: [block] })
}

/** First step that references a catalog exercise (for the card thumbnail). */
export function firstExerciseRef(routine: KataRoutine): { exerciseId: string; variantId?: string } | undefined {
  for (const b of routine.blocks)
    for (const s of b.steps) if (s.ref.type === 'exercise') return { exerciseId: s.ref.exerciseId, variantId: s.ref.variantId }
  return undefined
}

export function stepCount(routine: KataRoutine): number {
  return routine.blocks.reduce((n, b) => n + b.steps.length, 0)
}
