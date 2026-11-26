import type { Category, Measure } from '../catalog'

export const CATEGORY_LABEL: Record<Category, string> = {
  strength: 'Strength',
  hiit: 'HIIT',
  stretch: 'Stretch',
  mobility: 'Mobility',
  meditation: 'Meditation',
}

export function formatMeasure({ type, value }: Measure, perSide: boolean): string {
  const base = type === 'reps' ? `×${value}` : value >= 120 && value % 60 === 0 ? `${value / 60} min` : `${value} s`
  return perSide ? `${base} / side` : base
}
