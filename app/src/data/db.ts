import Dexie, { type EntityTable } from 'dexie'
import type { KataRoutine } from './routine-types'

/** Key/value settings row. Later tickets add routines, sessions etc. as new versions. */
export interface SettingRow {
  key: string
  value: unknown
}

/** Per-user personal addition to a catalog exercise (the catalog itself is never stored). */
export interface ExerciseLinkRow {
  exerciseId: string
  url: string
}

/** How a session felt, asked on the completion screen (optional). */
export type Feel = 'easy' | 'good' | 'hard'

/** A finished or early-stopped session. Full detail is kept; the history slice derives every stat from these rows. */
export interface SessionRow {
  id: string
  /** ms since epoch; days are grouped in local time from this. */
  startedAt: number
  finishedAt: number
  routineId?: string
  /** Snapshot, so history still reads right after the routine is renamed or deleted. */
  routineName: string
  category: string
  mode: 'play-all' | 'step-by-step'
  /** Active seconds (pauses excluded). */
  durationSeconds: number
  stepsDone: number
  stepsTotal: number
  roundsDone: number
  roundsTotal: number
  /** 0..100 */
  percent: number
  /** false = stopped early (partial). */
  completed: boolean
  feel?: Feel
}

export type ActivityType = 'run' | 'walk' | 'bike' | 'swim' | 'other'

/** An activity done outside Kata. Pace is derived (see data/activities.ts), never stored. */
export interface ActivityRow {
  id: string
  type: ActivityType
  /** ms since epoch; days are grouped in local time from this. */
  startedAt: number
  durationSeconds: number
  /** Kilometres. Absent when not entered. */
  distanceKm?: number
  feel?: Feel
  notes?: string
  /** Where it came from: 'manual' now; later imports use e.g. 'gpx' or 'strava'. */
  source: string
  /** Identifier in the source system, to detect duplicate imports. */
  externalId?: string
  /** Reserved for later imports (route points); unused in v1. */
  route?: unknown
  /** Reserved for later imports (heart-rate samples); unused in v1. */
  heartRate?: unknown
}

/** LEGACY: the removed owner drawing import stored rows here. Nothing reads or writes the table any more; it stays declared so existing databases open and old backups containing it still import. */
export interface UserDrawingRow {
  key: string
  svg: string
  updatedAt: number
}

/** Routine as stored. `pinned` is a number because booleans are not indexable. */
export type RoutineRow = Omit<KataRoutine, 'pinned'> & { pinned: 0 | 1 }

export class KataDB extends Dexie {
  settings!: EntityTable<SettingRow, 'key'>
  exerciseLinks!: EntityTable<ExerciseLinkRow, 'exerciseId'>
  routines!: EntityTable<RoutineRow, 'id'>
  sessions!: EntityTable<SessionRow, 'id'>
  activities!: EntityTable<ActivityRow, 'id'>
  /** Legacy, unused (see UserDrawingRow). Do not drop: schema changes and old backups depend on it. */
  userDrawings!: EntityTable<UserDrawingRow, 'key'>

  constructor(name = 'kata') {
    super(name)
    this.version(1).stores({ settings: 'key' })
    this.version(2).stores({ exerciseLinks: 'exerciseId' })
    this.version(3).stores({ routines: 'id, pinned, updatedAt' })
    this.version(4).stores({ sessions: 'id, startedAt, routineId, [routineId+startedAt]' })
    this.version(5).stores({ activities: 'id, startedAt, externalId' })
    this.version(6).stores({ userDrawings: 'key' })
  }
}

export const db = new KataDB()
