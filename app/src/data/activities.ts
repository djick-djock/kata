import { db, type ActivityRow, type ActivityType, type Feel, type KataDB } from './db'
import { uid } from '../routines/model'

export type { ActivityRow, ActivityType }

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'run', label: 'Run' },
  { value: 'walk', label: 'Walk' },
  { value: 'bike', label: 'Bike' },
  { value: 'swim', label: 'Swim' },
  { value: 'other', label: 'Other' },
]

export const activityLabel = (t: ActivityType): string => ACTIVITY_TYPES.find((x) => x.value === t)?.label ?? 'Other'

export interface ActivityInput {
  /** Set to keep an id (editing, or a re-import). */
  id?: string
  type: ActivityType
  startedAt: number
  durationSeconds: number
  distanceKm?: number
  feel?: Feel
  notes?: string
  source?: string
  externalId?: string
  route?: unknown
  heartRate?: unknown
}

export interface ActivityErrors {
  duration?: string
  distance?: string
}

/** Pure. Empty object = valid. Distance is optional but must not be negative; duration must be positive. */
export function validateActivity(input: { durationSeconds: number; distanceKm?: number }): ActivityErrors {
  const errors: ActivityErrors = {}
  if (!Number.isFinite(input.durationSeconds) || input.durationSeconds <= 0) errors.duration = 'Enter a duration greater than zero.'
  const d = input.distanceKm
  if (d !== undefined && (!Number.isFinite(d) || d < 0)) errors.distance = 'Distance cannot be negative.'
  return errors
}

/** Pure. Average pace in seconds per km, rounded; undefined when there is no distance (missing or zero) or no time. */
export function paceSecondsPerKm(durationSeconds: number, distanceKm?: number): number | undefined {
  if (distanceKm === undefined || !Number.isFinite(distanceKm) || distanceKm <= 0) return undefined
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return undefined
  return Math.round(durationSeconds / distanceKm)
}

/** "5:31" from seconds per km. */
export function formatPace(secondsPerKm: number): string {
  const s = Math.round(secondsPerKm)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Convenience for rows: the derived pace, never stored. */
export const activityPace = (a: Pick<ActivityRow, 'durationSeconds' | 'distanceKm'>): number | undefined => paceSecondsPerKm(a.durationSeconds, a.distanceKm)

/** Pure: the stored row for an input (manual source by default; empty notes and absent feel are dropped). */
export function toActivityRow(input: ActivityInput, id: string = input.id ?? uid()): ActivityRow {
  const row: ActivityRow = {
    id,
    type: input.type,
    startedAt: input.startedAt,
    durationSeconds: Math.round(input.durationSeconds),
    source: input.source ?? 'manual',
  }
  if (input.distanceKm !== undefined) row.distanceKm = input.distanceKm
  if (input.feel) row.feel = input.feel
  const notes = input.notes?.trim()
  if (notes) row.notes = notes
  if (input.externalId) row.externalId = input.externalId
  if (input.route !== undefined) row.route = input.route
  if (input.heartRate !== undefined) row.heartRate = input.heartRate
  return row
}

/** Saves (adds or replaces by id). Throws if invalid, saving nothing. Returns the stored row. */
export async function saveActivity(input: ActivityInput, store: KataDB = db): Promise<ActivityRow> {
  const errors = validateActivity(input)
  if (errors.duration || errors.distance) throw new Error(errors.duration ?? errors.distance)
  const row = toActivityRow(input)
  await store.activities.put(row)
  return row
}

export async function getActivity(id: string, store: KataDB = db): Promise<ActivityRow | undefined> {
  return store.activities.get(id)
}

/** All activities, newest first. */
export async function listActivities(store: KataDB = db): Promise<ActivityRow[]> {
  return store.activities.orderBy('startedAt').reverse().toArray()
}

/** Activities that started in [from, to) (ms), oldest first. Callers pass local-day or local-month bounds. */
export async function activitiesBetween(from: number, to: number, store: KataDB = db): Promise<ActivityRow[]> {
  return store.activities.where('startedAt').between(from, to, true, false).toArray()
}

export async function deleteActivity(id: string, store: KataDB = db): Promise<void> {
  await store.activities.delete(id)
}

/** The stored activity that already has this external id (optionally from this source), for duplicate checks on import. */
export async function findByExternalId(externalId: string, source?: string, store: KataDB = db): Promise<ActivityRow | undefined> {
  if (!externalId) return undefined
  const rows = await store.activities.where('externalId').equals(externalId).toArray()
  return rows.find((r) => source === undefined || r.source === source)
}

export async function isDuplicateExternalId(externalId: string, source?: string, store: KataDB = db): Promise<boolean> {
  return (await findByExternalId(externalId, source, store)) !== undefined
}
