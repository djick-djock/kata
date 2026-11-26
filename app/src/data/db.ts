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

/** Routine as stored. `pinned` is a number because booleans are not indexable. */
export type RoutineRow = Omit<KataRoutine, 'pinned'> & { pinned: 0 | 1 }

export class KataDB extends Dexie {
  settings!: EntityTable<SettingRow, 'key'>
  exerciseLinks!: EntityTable<ExerciseLinkRow, 'exerciseId'>
  routines!: EntityTable<RoutineRow, 'id'>

  constructor(name = 'kata') {
    super(name)
    this.version(1).stores({ settings: 'key' })
    this.version(2).stores({ exerciseLinks: 'exerciseId' })
    this.version(3).stores({ routines: 'id, pinned, updatedAt' })
  }
}

export const db = new KataDB()
