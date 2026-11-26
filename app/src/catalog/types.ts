export type Lang = 'en' | 'fr'
/** Per-language map; English is always present and is the fallback. */
export type Localized<T> = { en: T } & Partial<Record<Lang, T>>

export const CATEGORIES = ['strength', 'hiit', 'stretch', 'mobility', 'meditation'] as const
export type Category = (typeof CATEGORIES)[number]

export const TAGS = ['push', 'pull', 'legs', 'core', 'warm-up', 'cool-down'] as const
export type Tag = (typeof TAGS)[number]

export interface Measure {
  type: 'time' | 'reps'
  /** Seconds for time, repetitions for reps. */
  value: number
}

export interface Variant {
  /** Stable within its exercise. A variant drawing lives in drawings/<exerciseId>--<variantId>.svg. */
  id: string
  label: Localized<string>
  note?: Localized<string>
}

export interface Exercise {
  /** Stable id, also the drawing file name. Never reused. */
  id: string
  category: Category
  tags: Tag[]
  name: Localized<string>
  measure: Measure
  perSide: boolean
  howTo: Localized<string[]>
  tips: Localized<string>
  variants?: Variant[]
}
