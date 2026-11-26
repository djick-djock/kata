import { describe, expect, it, vi } from 'vitest'
import { KataDB } from '../data/db'
import { loadRoutine, saveRoutine } from '../data/routines'
import { blankRoutine, customStep } from '../routines/model'
import { BackupError, FORMAT_VERSION, exportAll, importAll, importBackupText } from './backup'
import { lastBackupLabel, shouldNudge } from './nudge'

let n = 0
const fresh = () => new KataDB(`backup-test-${++n}`)

async function seed(db: KataDB) {
  await db.settings.bulkPut([{ key: 'sound', value: false }, { key: 'pulse', value: false }])
  await db.exerciseLinks.put({ exerciseId: 'plank', url: 'https://example.com/v' })
  await db.routines.put({ id: 'r1', name: 'Morning', pinned: 1, updatedAt: 5, steps: [{ custom: true, name: 'Breathe' }] } as never)
  await db.sessions.put({ id: 's1', startedAt: 1, finishedAt: 2, routineName: 'Morning', category: 'stretch', mode: 'play-all', durationSeconds: 60, stepsDone: 1, stepsTotal: 1, roundsDone: 1, roundsTotal: 1, percent: 100, completed: true, feel: 'good' })
  // legacy table (removed owner drawing import): rows must still round-trip
  await db.userDrawings.put({ key: 'squat--wide', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0 L1 1"/></svg>', updatedAt: 7 })
  await db.activities.put({ id: 'a1', type: 'run', startedAt: 3, durationSeconds: 1800, distanceKm: 5, source: 'manual' })
}
async function snapshot(db: KataDB) {
  const out: Record<string, unknown[]> = {}
  for (const t of db.tables) out[t.name] = await t.toArray()
  return out
}

describe('backup', () => {
  it('exports every table with version and timestamp', async () => {
    const db = fresh()
    await seed(db)
    const doc = await exportAll(db, () => Date.UTC(2026, 0, 2))
    expect(doc.formatVersion).toBe(FORMAT_VERSION)
    expect(doc.exportedAt).toBe('2026-01-02T00:00:00.000Z')
    expect(Object.keys(doc.tables).sort()).toEqual(db.tables.map((t) => t.name).sort())
  })

  it('round-trips every store: export, wipe, import', async () => {
    const db = fresh()
    await seed(db)
    const before = await snapshot(db)
    const text = JSON.stringify(await exportAll(db))
    for (const t of db.tables) await t.clear()
    await importBackupText(db, text)
    expect(await snapshot(db)).toEqual(before)
    expect(before.sessions).toHaveLength(1)
    expect(before.userDrawings).toHaveLength(1)
    expect(await db.userDrawings.get('squat--wide')).toMatchObject({ updatedAt: 7 })
  })

  it('an old backup with legacy userDrawings rows still imports without error', async () => {
    const db = fresh()
    const old = { app: 'kata', formatVersion: 1, exportedAt: '2026-01-01T00:00:00.000Z', tables: { userDrawings: [{ key: 'squat', svg: '<svg/>', updatedAt: 1 }], settings: [{ key: 'sound', value: false }] } }
    await importBackupText(db, JSON.stringify(old))
    expect(await db.settings.count()).toBe(1)
    expect(await db.userDrawings.count()).toBe(1)
  })

  it('custom step details survive export and import', async () => {
    const db = fresh()
    const r = blankRoutine()
    r.blocks[0].steps.push(customStep({ name: 'Foam roll', measure: { type: 'time', seconds: 30 }, details: '  Slow, pause on tight spots.\nBreathe.  ' }))
    await saveRoutine(r, db)
    const text = JSON.stringify(await exportAll(db))
    for (const t of db.tables) await t.clear()
    await importBackupText(db, text)
    expect((await loadRoutine(r.id, db))!.blocks[0].steps[0].details).toBe('Slow, pause on tight spots.\nBreathe.')
  })

  it('import replaces existing data rather than merging', async () => {
    const db = fresh()
    await seed(db)
    const doc = await exportAll(db)
    await db.activities.put({ id: 'extra', type: 'walk', startedAt: 9, durationSeconds: 1, source: 'manual' })
    await importAll(db, doc)
    expect(await db.activities.count()).toBe(1)
  })

  const rejects = async (input: unknown, code: string) => {
    const db = fresh()
    await seed(db)
    const before = await snapshot(db)
    const run = typeof input === 'string' ? importBackupText(db, input) : importAll(db, input)
    await expect(run).rejects.toMatchObject({ code })
    expect(await snapshot(db)).toEqual(before)
  }
  const good = { app: 'kata', formatVersion: 1, exportedAt: '2026-01-01T00:00:00.000Z', tables: {} as Record<string, unknown[]> }

  it('rejects non-JSON and truncated files with no change', async () => {
    await rejects('hello', 'not-json')
    const db = fresh()
    await seed(db)
    const text = JSON.stringify(await exportAll(db))
    await rejects(text.slice(0, text.length - 20), 'not-json')
  })
  it('rejects wrong shape', async () => {
    await rejects('[]', 'wrong-shape')
    await rejects('{"hello":1}', 'wrong-shape')
    await rejects({ ...good, app: 'other' }, 'wrong-shape')
    await rejects({ ...good, formatVersion: 'x' }, 'wrong-shape')
    await rejects({ ...good, tables: { nope: [] } }, 'wrong-shape')
    await rejects({ ...good, tables: { sessions: {} } }, 'wrong-shape')
  })
  it('rejects unknown future format versions', async () => {
    await rejects({ ...good, formatVersion: FORMAT_VERSION + 1 }, 'future-version')
  })
  it('rejects rows missing their key, even in a later table', async () => {
    await rejects({ ...good, tables: { settings: [{ key: 'a', value: 1 }], sessions: [{ startedAt: 1 }] } }, 'bad-rows')
    await rejects({ ...good, tables: { settings: [null] } }, 'bad-rows')
  })

  it('a failing write part-way leaves the old data intact', async () => {
    const db = fresh()
    await seed(db)
    const doc = await exportAll(db)
    await db.settings.put({ key: 'sound', value: true })
    const before = await snapshot(db)
    // Dexie hands out transaction-scoped tables, so patch the shared prototype and fail only for activities.
    const proto = Object.getPrototypeOf(db.table('activities')) as { bulkPut: (...a: unknown[]) => Promise<unknown> }
    const real = proto.bulkPut
    const spy = vi.spyOn(proto, 'bulkPut').mockImplementation(function (this: { name: string }, ...a: unknown[]) {
      return this.name === 'activities' ? Promise.reject(new Error('disk full')) : real.apply(this, a)
    })
    await expect(importAll(db, doc)).rejects.toThrow('disk full')
    spy.mockRestore()
    expect(await snapshot(db)).toEqual(before)
  })

  it('accepts a backup from an earlier format version (fixture missing newer tables)', async () => {
    const db = fresh()
    await db.sessions.put({ id: 'old', startedAt: 1 } as never)
    const fixture = { app: 'kata', formatVersion: 1, exportedAt: '2025-06-01T10:00:00.000Z', tables: { settings: [{ key: 'volume', value: 0.4 }], sessions: [{ id: 's9', startedAt: 7, routineName: 'X' }] } }
    await importAll(db, fixture)
    expect(await db.settings.get('volume')).toEqual({ key: 'volume', value: 0.4 })
    expect((await db.sessions.toArray()).map((s) => s.id)).toEqual(['s9'])
    expect(await db.activities.count()).toBe(0)
  })
})

describe('nudge', () => {
  const now = Date.UTC(2026, 5, 30)
  const ago = (d: number) => now - d * 86_400_000
  it('nudges when never', () => expect(shouldNudge(null, now)).toBe(true))
  it('not at 13 or 14 days, yes at 15', () => {
    expect(shouldNudge(ago(13), now)).toBe(false)
    expect(shouldNudge(ago(14), now)).toBe(false)
    expect(shouldNudge(ago(15), now)).toBe(true)
  })
  it('labels', () => {
    expect(lastBackupLabel(null, now)).toBe('Never')
    expect(lastBackupLabel(ago(0), now)).toBe('Today')
    expect(lastBackupLabel(ago(1), now)).toBe('1 day ago')
    expect(lastBackupLabel(ago(15), now)).toBe('15 days ago')
  })
})
