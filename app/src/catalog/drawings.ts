// Drawing convention: every SVG in ./drawings is bundled (works offline) and picked up by file name.
//   drawings/<exercise-id>.svg                 drawing of the exercise
//   drawings/<exercise-id>--<variant-id>.svg   optional own drawing for a variant
// An exercise without a file shows a placeholder. No code change is needed to add a drawing.
const files = import.meta.glob('./drawings/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const byName = new Map<string, string>()
for (const [path, svg] of Object.entries(files)) {
  const name = path.slice(path.lastIndexOf('/') + 1, -'.svg'.length)
  byName.set(name, svg)
}

/** Raw SVG markup for an exercise (or variant, falling back to the exercise), or undefined when none exists. */
export function drawingFor(exerciseId: string, variantId?: string): string | undefined {
  return (variantId ? byName.get(`${exerciseId}--${variantId}`) : undefined) ?? byName.get(exerciseId)
}
