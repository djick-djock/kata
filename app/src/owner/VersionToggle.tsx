import { useRef } from 'react'
import { notify } from '../ui/Toast'
import { getOwnerMode, setOwnerMode } from './owner'

const HOLD_MS = 800

/** The version line; a long press (~800 ms) toggles Owner mode. Looks like plain text, no selection or context menu. */
export function VersionToggle({ children }: { children: React.ReactNode }) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const cancel = () => clearTimeout(timer.current)
  const start = () => {
    cancel()
    timer.current = setTimeout(() => {
      const next = !getOwnerMode()
      setOwnerMode(next)
      notify(next ? 'Owner mode on' : 'Owner mode off')
      navigator.vibrate?.(30)
    }, HOLD_MS)
  }
  return (
    <p
      className="setversion setversion--hold"
      data-testid="version"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </p>
  )
}
