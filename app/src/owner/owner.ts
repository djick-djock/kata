import { useEffect, useState } from 'react'

/**
 * Owner mode is a device-local flag (localStorage), deliberately NOT in the settings table: it is not
 * part of a backup, so restoring a backup elsewhere never switches it on. Not a security boundary.
 */
const KEY = 'kata.ownerMode'
const EVENT = 'kata-owner'

export function getOwnerMode(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setOwnerMode(on: boolean): void {
  try {
    if (on) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {
    /* storage unavailable: the flag stays off */
  }
  window.dispatchEvent(new Event(EVENT))
}

export function useOwnerMode(): boolean {
  const [on, setOn] = useState(getOwnerMode)
  useEffect(() => {
    const update = () => setOn(getOwnerMode())
    window.addEventListener(EVENT, update)
    window.addEventListener('storage', update)
    return () => { window.removeEventListener(EVENT, update); window.removeEventListener('storage', update) }
  }, [])
  return on
}
