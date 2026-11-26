import Dexie, { type EntityTable } from 'dexie'

/** Key/value settings row. Later tickets add routines, sessions etc. as new versions. */
export interface SettingRow {
  key: string
  value: unknown
}

export class KataDB extends Dexie {
  settings!: EntityTable<SettingRow, 'key'>

  constructor(name = 'kata') {
    super(name)
    this.version(1).stores({ settings: 'key' })
  }
}

export const db = new KataDB()
