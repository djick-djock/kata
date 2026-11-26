import type { KataDB } from '../data/db'

/** Bump when the document layout changes; importAll accepts every version up to this one. */
export const FORMAT_VERSION = 1
export const BACKUP_APP = 'kata'

export interface BackupDocument {
  app: typeof BACKUP_APP
  formatVersion: number
  /** ISO timestamp. */
  exportedAt: string
  /** Every Dexie table, enumerated from the database (never a hand-kept list). */
  tables: Record<string, unknown[]>
}

export type BackupFailure = 'not-json' | 'wrong-shape' | 'future-version' | 'bad-rows'
export class BackupError extends Error {
  constructor(readonly code: BackupFailure, message: string) {
    super(message)
    this.name = 'BackupError'
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Snapshot of every table, read in one transaction so it is consistent. */
export async function exportAll(db: KataDB, now: () => number = Date.now): Promise<BackupDocument> {
  const tables: Record<string, unknown[]> = {}
  await db.transaction('r', db.tables, async () => {
    for (const t of db.tables) tables[t.name] = await t.toArray()
  })
  return { app: BACKUP_APP, formatVersion: FORMAT_VERSION, exportedAt: new Date(now()).toISOString(), tables }
}

/** Parses file text into a document or throws BackupError with a user-readable message. Does not touch the db. */
export function parseBackup(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    throw new BackupError('not-json', 'This file is not a valid Kata backup (it is damaged, cut short or not JSON).')
  }
}

/** Full validation against the database's schema. Throws BackupError; returns the typed document. */
export function validateBackup(db: KataDB, doc: unknown): BackupDocument {
  if (!isObj(doc) || doc.app !== BACKUP_APP || !isObj(doc.tables) || typeof doc.exportedAt !== 'string' || Number.isNaN(Date.parse(doc.exportedAt))) {
    throw new BackupError('wrong-shape', 'This file is not a Kata backup.')
  }
  const v = doc.formatVersion
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 1) throw new BackupError('wrong-shape', 'This file is not a Kata backup.')
  if (v > FORMAT_VERSION) throw new BackupError('future-version', 'This backup was made by a newer version of Kata. Update the app and try again.')
  const known = new Map(db.tables.map((t) => [t.name, t]))
  for (const [name, rows] of Object.entries(doc.tables)) {
    const table = known.get(name)
    if (!table) throw new BackupError('wrong-shape', `This backup contains data Kata does not know ("${name}").`)
    if (!Array.isArray(rows)) throw new BackupError('wrong-shape', `The "${name}" data in this backup is damaged.`)
    const keyPath = table.schema.primKey.keyPath
    const keys = typeof keyPath === 'string' ? [keyPath] : (keyPath ?? [])
    for (const row of rows) {
      const ok = isObj(row) && keys.every((k) => typeof row[k] === 'string' ? row[k] !== '' : typeof row[k] === 'number' && Number.isFinite(row[k]))
      if (!ok) throw new BackupError('bad-rows', `The "${name}" data in this backup is damaged (a record is missing its key).`)
    }
  }
  return doc as unknown as BackupDocument
}

/**
 * Validates first (no change on failure), then replaces every table in one transaction.
 * A table missing from an older backup is emptied, so the result equals the file.
 */
export async function importAll(db: KataDB, input: unknown): Promise<BackupDocument> {
  const doc = validateBackup(db, input)
  await db.transaction('rw', db.tables, async () => {
    for (const t of db.tables) {
      await t.clear()
      const rows = doc.tables[t.name]
      if (rows?.length) await t.bulkPut(rows)
    }
  })
  return doc
}

/** Convenience for the file picker: text in, replaced data out. */
export async function importBackupText(db: KataDB, text: string): Promise<BackupDocument> {
  return importAll(db, parseBackup(text))
}
