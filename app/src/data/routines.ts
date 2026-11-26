import { db, type KataDB, type RoutineRow } from './db'
import type { KataRoutine } from './routine-types'
import { resolveRoutine, uid } from '../routines/model'

const toRow = (r: KataRoutine): RoutineRow => ({ ...r, pinned: r.pinned ? 1 : 0 })
const fromRow = (row: RoutineRow): KataRoutine => resolveRoutine({ ...row, pinned: row.pinned === 1 })

/**
 * Saves a routine. If it is pinned, every other routine is unpinned in the same transaction
 * (only one routine can be pinned). A `lastDone` already stored is never lost.
 */
export async function saveRoutine(routine: KataRoutine, store: KataDB = db): Promise<KataRoutine> {
  const saved: KataRoutine = { ...routine, updatedAt: Date.now() }
  await store.transaction('rw', store.routines, async () => {
    const existing = await store.routines.get(routine.id)
    const lastDone = Math.max(existing?.lastDone ?? 0, routine.lastDone ?? 0) || undefined
    saved.lastDone = lastDone
    if (routine.pinned) {
      await store.routines.where('pinned').equals(1).filter((r) => r.id !== routine.id).modify({ pinned: 0 })
    }
    await store.routines.put(toRow(saved))
  })
  return saved
}

/** Loads a routine with its steps re-resolved against the catalog (missing ids fall back to custom steps). */
export async function loadRoutine(id: string, store: KataDB = db): Promise<KataRoutine | undefined> {
  const row = await store.routines.get(id)
  return row ? fromRow(row) : undefined
}

/** All routines, most recently edited first. */
export async function listRoutines(store: KataDB = db): Promise<KataRoutine[]> {
  const rows = await store.routines.orderBy('updatedAt').reverse().toArray()
  return rows.map(fromRow)
}

export async function deleteRoutine(id: string, store: KataDB = db): Promise<void> {
  await store.routines.delete(id)
}

/** A copy gets new ids, is unpinned and has no history; the original is not touched. */
export async function copyRoutine(id: string, store: KataDB = db): Promise<KataRoutine | undefined> {
  const original = await loadRoutine(id, store)
  if (!original) return undefined
  const now = Date.now()
  const copy: KataRoutine = {
    ...structuredClone(original),
    id: uid(),
    name: `${original.name} copy`,
    pinned: false,
    createdFrom: 'copy',
    createdAt: now,
    updatedAt: now,
    lastDone: undefined,
    blocks: original.blocks.map((b) => ({ ...structuredClone(b), id: uid(), steps: b.steps.map((s) => ({ ...structuredClone(s), id: uid() })) })),
  }
  return saveRoutine(copy, store)
}

/** Pins this routine and unpins any other; `false` just unpins it. */
export async function setPinned(id: string, pinned: boolean, store: KataDB = db): Promise<void> {
  await store.transaction('rw', store.routines, async () => {
    if (pinned) await store.routines.where('pinned').equals(1).modify({ pinned: 0 })
    await store.routines.update(id, { pinned: pinned ? 1 : 0 })
  })
}

export async function getPinnedRoutine(store: KataDB = db): Promise<KataRoutine | undefined> {
  const row = await store.routines.where('pinned').equals(1).first()
  return row ? fromRow(row) : undefined
}

/** Hook for the sessions store: record when a routine was last played. */
export async function markRoutineDone(id: string, at: number = Date.now(), store: KataDB = db): Promise<void> {
  await store.routines.update(id, { lastDone: at })
}

/**
 * Sets the routine's `lastDone` from the sessions that remain (the latest one with at least one
 * step done), or clears it. Used after a session is deleted. No-op if the routine is gone.
 */
export async function recomputeLastDone(id: string, store: KataDB = db): Promise<void> {
  const rows = await store.sessions.where('[routineId+startedAt]').between([id, -Infinity], [id, Infinity]).toArray()
  const last = rows.filter((r) => r.stepsDone > 0).reduce((m, r) => Math.max(m, r.finishedAt), 0)
  await store.routines.update(id, { lastDone: last || undefined })
}
