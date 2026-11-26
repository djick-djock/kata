import Dexie, { type EntityTable } from 'dexie'

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

export class KataDB extends Dexie {
  settings!: EntityTable<SettingRow, 'key'>
  exerciseLinks!: EntityTable<ExerciseLinkRow, 'exerciseId'>

  constructor(name = 'kata') {
    super(name)
    this.version(1).stores({ settings: 'key' })
    this.version(2).stores({ exerciseLinks: 'exerciseId' })
  }
}

export const db = new KataDB()
