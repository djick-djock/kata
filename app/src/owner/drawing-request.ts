import { localized, type Exercise } from '../catalog'
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

export function buildDrawingPayload(exercise: Exercise): DrawingRequestPayload {
  const name = localized(exercise.name)
  const meditation = exercise.category === 'meditation'
  const figure = meditation
    ? 'Meditation: use a calm glyph (a seated figure, a circle or soft concentric arcs) rather than an athletic pose.'
    : exercise.perSide
      ? 'This exercise is done per side: show ONE side clearly (the working side), with the other limbs in var(--ill-far).'
      : 'Show the key position of the movement.'
  return {
    exercise: name,
    exerciseId: exercise.id,
    category: exercise.category,
    measure: formatMeasure(exercise.measure, exercise.perSide),
    perSide: exercise.perSide,
    steps: localized(exercise.howTo),
    tips: localized(exercise.tips),
    figure,
    styleRules: DRAWING_STYLE_RULES,
    deliverable: `Reply with only the SVG code for "${name}". It will be saved as app/src/catalog/drawings/${exercise.id}.svg.`,
  }
}

export const DRAWING_REQUEST = { appId: 'kata', type: 'exercise-drawing' } as const
