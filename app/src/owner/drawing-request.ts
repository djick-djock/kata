import { localized, type Exercise, type Measure } from '../catalog'
import { formatMeasure } from '../screens/exercise-format'

/** Drawing style rules, taken from the real files in catalog/drawings and the convention in app/README.md. */
export const DRAWING_STYLE_RULES = [
  'One SVG file. Root element: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="<exercise name>">.',
  'Canvas: viewBox 0 0 120 100, no width or height attributes. Stroke width 2.6 everywhere, round caps and joins (consistent line weight).',
  'Draw the figure with stroke="currentColor" (the app sets it to the category colour). Do not hard-code any other colour for the figure.',
  'Secondary elements use CSS variables with a fallback: far limbs and secondary lines stroke="var(--ill-far, #9AA4BC)" (optionally with stroke-opacity 0.7 or 0.45 for depth); the floor is a single line such as <path d="M8 86 L112 86" stroke="var(--color-line)"/> or currentColor at stroke-opacity="0.35"; head fills use fill="var(--ill-bg, transparent)".',
  'No background rectangle, no gradients, no text, no scripts, no event handlers, no external references (no href, no url(), no images, no fonts, no <style>).',
  'One simple schematic figure (stick-figure style: circle head, limbs as paths), one pose that makes the movement clear. Keep it to a few paths, like squat.svg.',
]

export interface DrawingRequestPayload extends Record<string, unknown> {
  exercise: string
  exerciseId: string
  category: string
  measure: string
  perSide: boolean
  steps: string[]
  tips: string
  figure: string
  styleRules: string[]
  deliverable: string
}

/** A custom exercise as typed into a routine (no catalog entry): used to ask for a drawing before it joins the catalog. */
export interface CustomExercise {
  name: string
  /** Written details, one instruction per line. */
  details?: string
  measure: Measure
  perSide: boolean
}

export const slugify = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'exercise'

interface Facts { name: string; id: string; category: string; measure: Measure; perSide: boolean; steps: string[]; tips: string; meditation: boolean }

function build(f: Facts): DrawingRequestPayload {
  const figure = f.meditation
    ? 'Meditation: use a calm glyph (a seated figure, a circle or soft concentric arcs) rather than an athletic pose.'
    : f.perSide
      ? 'This exercise is done per side: show ONE side clearly (the working side), with the other limbs in var(--ill-far).'
      : 'Show the key position of the movement.'
  return {
    exercise: f.name,
    exerciseId: f.id,
    category: f.category,
    measure: formatMeasure(f.measure, f.perSide),
    perSide: f.perSide,
    steps: f.steps,
    tips: f.tips,
    figure,
    styleRules: DRAWING_STYLE_RULES,
    deliverable: `Reply with only the SVG code for "${f.name}". It will be saved as app/src/catalog/drawings/${f.id}.svg.`,
  }
}

export function buildDrawingPayload(exercise: Exercise | CustomExercise): DrawingRequestPayload {
  if ('howTo' in exercise) {
    return build({ name: localized(exercise.name), id: exercise.id, category: exercise.category, measure: exercise.measure, perSide: exercise.perSide, steps: localized(exercise.howTo), tips: localized(exercise.tips), meditation: exercise.category === 'meditation' })
  }
  const lines = (exercise.details ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
  return build({
    name: exercise.name,
    id: slugify(exercise.name),
    category: 'custom exercise, not in the catalog yet (pick the closest category)',
    measure: exercise.measure,
    perSide: exercise.perSide,
    steps: lines.length ? lines : ['(no written details: infer the movement from the name)'],
    tips: '',
    meditation: false,
  })
}

export const DRAWING_REQUEST = { appId: 'kata', type: 'exercise-drawing' } as const
