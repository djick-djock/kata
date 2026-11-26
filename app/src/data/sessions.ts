import { db, type Feel, type KataDB, type SessionRow } from './db'
import { markRoutineDone, recomputeLastDone } from './routines'
import { uid } from '../routines/model'
import type { SessionMode, SessionResult } from '../engine'

export type { Feel, SessionRow }

/** What the player hands over when a session ends, plus the routine facts to snapshot. */
export interface FinishedInput {
  /** Fixed by the caller before saving, so saving the same session again is a no-op. */
  id?: string
  result: SessionResult
  routineId?: string
  routineName: string
  category: string
  mode: SessionMode
  startedAt: number
  finishedAt: number
}

/** Pure: the stored record for a finished or stopped session. */
export function toSessionRow(input: FinishedInput, id: string = input.id ?? uid()): SessionRow {
  const r = input.result
  return {
    id,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    routineId: input.routineId,
    routineName: input.routineName,
    category: input.category,
    mode: input.mode,
    durationSeconds: Math.round(r.elapsedMs / 1000),
    stepsDone: r.stepsDone,
    stepsTotal: r.stepsTotal,
    roundsDone: r.roundsDone,
    roundsTotal: r.roundsTotal,
    percent: r.completed ? 100 : Math.max(0, Math.min(100, Math.round(r.percent))),
    completed: r.completed,
  }
}

/**
 * Saves a session exactly once per id: if a row with this id exists it is returned untouched (so a
 * re-render, a replayed navigation or a double call never duplicates or overwrites the feel).
 * The routine's `lastDone` is updated in the same go when at least one step was done.
 */
export async function saveSession(input: FinishedInput, store: KataDB = db): Promise<SessionRow> {
  const row = toSessionRow(input)
  const created = await store.transaction('rw', store.sessions, async () => {
    const existing = await store.sessions.get(row.id)
    if (existing) return existing
    await store.sessions.add(row)
    return row
  })
  if (created === row && row.routineId && row.stepsDone > 0) await markRoutineDone(row.routineId, row.finishedAt, store)
  return created
}

export async function getSession(id: string, store: KataDB = db): Promise<SessionRow | undefined> {
  return store.sessions.get(id)
}

/** Sets or clears (undefined) the "How did it feel" rating. */
export async function setSessionFeel(id: string, feel: Feel | undefined, store: KataDB = db): Promise<void> {
  const existing = await store.sessions.get(id)
  if (!existing) return
  const { feel: _old, ...rest } = existing
  await store.sessions.put(feel ? { ...rest, feel } : rest)
}

/** All sessions, newest first. */
export async function listSessions(store: KataDB = db): Promise<SessionRow[]> {
  return store.sessions.orderBy('startedAt').reverse().toArray()
}

/** Sessions that started in [from, to) (ms), oldest first. Callers pass local-day or local-month bounds. */
export async function sessionsBetween(from: number, to: number, store: KataDB = db): Promise<SessionRow[]> {
  return store.sessions.where('startedAt').between(from, to, true, false).toArray()
}

/** Sessions of one routine, newest first. */
export async function sessionsForRoutine(routineId: string, store: KataDB = db): Promise<SessionRow[]> {
  const rows = await store.sessions.where('[routineId+startedAt]').between([routineId, -Infinity], [routineId, Infinity]).toArray()
  return rows.reverse()
}

/** Deletes a session and re-derives its routine's "Last done" from the sessions that remain. */
export async function deleteSession(id: string, store: KataDB = db): Promise<void> {
  const existing = await store.sessions.get(id)
  await store.sessions.delete(id)
  if (existing?.routineId) await recomputeLastDone(existing.routineId, store)
}
