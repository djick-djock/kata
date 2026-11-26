import { useRef, type PointerEvent } from 'react'

/**
 * Pointer-based drag to reorder rows in a list (works with touch, pen and mouse).
 * Put `listRef` on the container, `data-drag-row` on each direct child row and `handleProps(i)` on the grip.
 * The grip needs `touch-action: none` so the page does not scroll while dragging.
 */
export function useDragReorder(onMove: (from: number, to: number) => void) {
  const listRef = useRef<HTMLElement | null>(null)

  function handleProps(index: number) {
    return {
      onPointerDown(e: PointerEvent<HTMLElement>) {
        if (e.button !== undefined && e.button > 0) return
        const list = listRef.current
        if (!list) return
        const rows = Array.from(list.querySelectorAll<HTMLElement>(':scope > [data-drag-row]'))
        const row = rows[index]
        if (!row) return
        e.preventDefault()
        const handle = e.currentTarget
        handle.setPointerCapture(e.pointerId)
        const rects = rows.map((r) => r.getBoundingClientRect())
        const startY = e.clientY
        const h = rects[index].height
        let over = index
        row.classList.add('is-dragging')
        const reset = () => {
          rows.forEach((r) => { r.style.transform = ''; r.style.transition = ''; r.classList.remove('is-dragging') })
        }
        const move = (ev: globalThis.PointerEvent) => {
          const dy = ev.clientY - startY
          row.style.transform = `translateY(${dy}px)`
          const centre = rects[index].top + h / 2 + dy
          let target = index
          for (let i = index + 1; i < rects.length; i++) if (centre > rects[i].top + rects[i].height / 2) target = i
          for (let i = index - 1; i >= 0; i--) if (centre < rects[i].top + rects[i].height / 2) target = i
          over = target
          rows.forEach((r, i) => {
            if (i === index) return
            r.style.transition = 'transform 120ms ease'
            const shift = index < over && i > index && i <= over ? -h : index > over && i < index && i >= over ? h : 0
            r.style.transform = shift ? `translateY(${shift}px)` : ''
          })
        }
        const end = (ev: globalThis.PointerEvent) => {
          handle.removeEventListener('pointermove', move)
          handle.removeEventListener('pointerup', end)
          handle.removeEventListener('pointercancel', end)
          reset()
          if (ev.type === 'pointerup' && over !== index) onMove(index, over)
        }
        handle.addEventListener('pointermove', move)
        handle.addEventListener('pointerup', end)
        handle.addEventListener('pointercancel', end)
      },
    }
  }
  return { listRef, handleProps }
}
