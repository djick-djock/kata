import { useSyncExternalStore } from 'react'
import { db, type KataDB } from '../data/db'
import { sanitiseSvg } from './sanitise'

/**
 * Owner's local drawings. Rows live in Dexie (`userDrawings`, part of every backup); an in-memory map mirrors
 * them so the synchronous Drawing component can look one up. Rows are re-sanitised when loaded because a
 * restored backup is outside input and its SVG ends up in innerHTML.
 */
export const drawingKey = (exerciseId: string, variantId?: string) => (variantId ? `${exerciseId}--${variantId}` : exerciseId)

let cache = new Map<string, string>()
let loaded: Promise<void> | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export async function saveUserDrawing(key: string, svg: string, store: KataDB = db, now: () => number = Date.now): Promise<void> {
  await store.userDrawings.put({ key, svg, updatedAt: now() })
  await refreshUserDrawings(store)
}

export async function removeUserDrawing(key: string, store: KataDB = db): Promise<void> {
  await store.userDrawings.delete(key)
  await refreshUserDrawings(store)
}

/** Reloads the in-memory map from the database (also after a backup is restored). */
export async function refreshUserDrawings(store: KataDB = db): Promise<void> {
  const next = new Map<string, string>()
  for (const row of await store.userDrawings.toArray()) {
    const r = sanitiseSvg(row.svg)
    if (r.ok) next.set(row.key, r.svg)
  }
  cache = next
  loaded = Promise.resolve()
  emit()
}

function ensureLoaded() {
  if (!loaded) {
    loaded = Promise.resolve()
    void refreshUserDrawings().catch(() => { loaded = null })
  }
}

/** Local override: the variant's own drawing first, then the exercise's. */
export function userDrawingFor(exerciseId: string, variantId?: string): string | undefined {
  return (variantId ? cache.get(drawingKey(exerciseId, variantId)) : undefined) ?? cache.get(exerciseId)
}

export function useUserDrawings(): ReadonlyMap<string, string> {
  return useSyncExternalStore(
    (l) => { ensureLoaded(); listeners.add(l); return () => listeners.delete(l) },
    () => cache,
  )
}
