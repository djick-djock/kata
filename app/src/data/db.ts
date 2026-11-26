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

/** Routine as stored. `pinned` is a number because booleans are not indexable. */
export type RoutineRow = Omit<KataRoutine, 'pinned'> & { pinned: 0 | 1 }

export class KataDB extends Dexie {
  settings!: EntityTable<SettingRow, 'key'>
  exerciseLinks!: EntityTable<ExerciseLinkRow, 'exerciseId'>
  routines!: EntityTable<RoutineRow, 'id'>
  sessions!: EntityTable<SessionRow, 'id'>

  constructor(name = 'kata') {
    super(name)
    this.version(1).stores({ settings: 'key' })
    this.version(2).stores({ exerciseLinks: 'exerciseId' })
    this.version(3).stores({ routines: 'id, pinned, updatedAt' })
    this.version(4).stores({ sessions: 'id, startedAt, routineId, [routineId+startedAt]' })
  }
}

export const db = new KataDB()
