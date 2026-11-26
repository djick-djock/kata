import type { Category } from '../catalog'
import { useUserDrawings, userDrawingFor } from '../drawings/user-drawings'

/** Exercise drawing (a local owner drawing for exerciseId/variantId wins over the shipped `svg`) tinted with the category colour, or a calm placeholder when there is none. */
export function Drawing({ svg: shipped, exerciseId, variantId, category, label }: { svg?: string; exerciseId?: string; variantId?: string; category: Category; label: string }) {
  useUserDrawings() // re-render when the owner's local drawings change
  const svg = (exerciseId ? userDrawingFor(exerciseId, variantId) : undefined) ?? shipped
  const tint = { color: `var(--color-illustration-${category === 'meditation' ? 'mobility' : category})` }
  if (!svg) {
    return (
      <div className="drawing drawing--placeholder" style={tint} role="img" aria-label={`${label} (no drawing yet)`}>
        <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 86 L112 86" strokeOpacity="0.35" />
          <circle cx="60" cy="38" r="16" strokeDasharray="2 7" strokeOpacity="0.7" />
        </svg>
      </div>
    )
  }
  return <div className="drawing" style={tint} role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />
}
