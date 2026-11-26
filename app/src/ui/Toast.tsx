import { useEffect, useState } from 'react'

const EVENT = 'kata:notice'

/** Shows a brief message on whatever screen is current (works across a navigation). */
export function notify(message: string): void {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }))
}

/** Mount once in the app. */
export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail)
      clearTimeout(timer)
      timer = setTimeout(() => setMsg(null), 3000)
    }
    window.addEventListener(EVENT, on)
    return () => { window.removeEventListener(EVENT, on); clearTimeout(timer) }
  }, [])
  return msg ? <div className="notice" role="status">{msg}</div> : null
}
