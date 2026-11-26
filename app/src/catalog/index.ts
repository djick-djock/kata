import { EXERCISES } from './exercises'
import type { Exercise, Lang, Localized, Variant } from './types'

export { CATEGORIES, TAGS } from './types'
export type { Category, Exercise, Lang, Localized, Measure, Tag, Variant } from './types'
export { drawingFor } from './drawings'

const byId = new Map(EXERCISES.map((e) => [e.id, e]))

export function allExercises(): readonly Exercise[] {
  return EXERCISES
}

export function findExercise(id: string): Exercise | undefined {
  return byId.get(id)
}

export function variantsOf(id: string): readonly Variant[] {
  return byId.get(id)?.variants ?? []
}

/** Exercises tagged warm-up: offered first when adding a step to a warm-up block. */
export function warmUpExercises(): Exercise[] {
  return EXERCISES.filter((e) => e.tags.includes('warm-up'))
}

/** Value for a language, falling back to English. */
export function localized<T>(map: Localized<T>, lang: Lang = 'en'): T {
  return map[lang] ?? map.en
}
