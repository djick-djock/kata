import { useEffect, useRef, type ReactNode } from 'react'

/** Bottom sheet over a dark scrim. Closes on scrim tap or Escape. */
export function Sheet({ title, onClose, action, children, tall }: { title: string; onClose: () => void; action?: ReactNode; children: ReactNode; tall?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="scrim" onClick={onClose}>
      <div ref={ref} className={`sheet${tall ? ' sheet--tall' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="sheet__grab" aria-hidden="true" />
        <div className="sheet__head">
          <h2 className="sheet__title">{title}</h2>
          {action ?? <button type="button" className="text-btn" onClick={onClose}>Cancel</button>}
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  )
}
