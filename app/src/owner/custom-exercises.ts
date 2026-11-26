// Pure helpers for the Owner "Custom exercises" screen: group custom steps and render a plain-text list.
import type { Measure as CatalogMeasure } from '../catalog'
import type { Measure as StepMeasure } from '../engine'
import { formatMeasure } from '../screens/exercise-format'
import type { CustomExercise } from './drawing-request'

interface RoutineLike {
  id: string
  blocks: { steps: { ref: { type: string }; name: string; measure: StepMeasure; perSide?: boolean; details?: string }[] }[]
}

export interface CustomGroup extends CustomExercise {
  /** Distinct routines using it. */
  routines: number
  /** Steps using it (a routine can use it more than once). */
  steps: number
}

const key = (name: string) => name.trim().toLowerCase()
const toCatalog = (m: StepMeasure): CatalogMeasure => (m.type === 'time' ? { type: 'time', value: m.seconds } : { type: 'reps', value: m.reps })

/**
 * Groups the custom steps of all routines by name (trimmed, case-insensitive). The first occurrence supplies the
 * displayed name, measure and per-side flag; details come from the first occurrence that has some. Sorted by name.
 */
export function groupCustomExercises(routines: readonly RoutineLike[]): CustomGroup[] {
  const groups = new Map<string, CustomGroup & { seen: Set<string> }>()
  for (const r of routines) {
    for (const b of r.blocks) {
      for (const s of b.steps) {
        if (s.ref.type !== 'custom') continue
        const k = key(s.name)
        if (!k) continue
        let g = groups.get(k)
        if (!g) {
          g = { name: s.name.trim(), measure: toCatalog(s.measure), perSide: !!s.perSide, routines: 0, steps: 0, seen: new Set() }
          groups.set(k, g)
        }
        g.steps++
        if (!g.seen.has(r.id)) { g.seen.add(r.id); g.routines++ }
        if (!g.details && s.details?.trim()) g.details = s.details.trim()
      }
    }
  }
  return [...groups.values()].map(({ seen: _seen, ...g }) => g).sort((a, b) => a.name.localeCompare(b.name))
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`

export function usageLabel(g: Pick<CustomGroup, 'routines' | 'steps'>): string {
  return `${plural(g.routines, 'routine')}, ${plural(g.steps, 'step')}`
}

/** Plain text ready to paste into Claude to add the exercises to the catalog. `source` names a backup file when the list comes from one. */
export function customListText(list: readonly CustomGroup[], source?: string): string {
  const head = [`Kata custom exercises${source ? ` (from backup file ${source})` : ''}: ${list.length}`, 'Please add these to the exercise catalog (name, category, how-to steps, tips, measure, per side), then I will ask for drawings.']
  const items = list.map((g, i) => {
    const lines = [`${i + 1}. ${g.name}`, `   Default: ${formatMeasure(g.measure, g.perSide)}`, `   Used in: ${usageLabel(g)}`]
    if (g.details) lines.push('   Details:', ...g.details.split('\n').map((l) => `     ${l}`))
    return lines.join('\n')
  })
  return [...head, '', ...(items.length ? items : ['(none)'])].join('\n')
}
