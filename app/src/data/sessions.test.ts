import { describe, expect, it } from 'vitest'
import { KataDB } from './db'
import { blankRoutine } from '../routines/model'
import { currentStreak, monthStats } from '../history/streak'
import { toEntries } from '../history/calendar'
import { loadRoutine, saveRoutine } from './routines'
import { deleteSession, getSession, listSessions, saveSession, sessionsBetween, sessionsForRoutine, setSessionFeel, toSessionRow, type FinishedInput } from './sessions'

const base = (over: Partial<FinishedInput> = {}): FinishedInput => ({
  id: 's1',
  result: { completed: true, stepsDone: 9, stepsTotal: 9, roundsDone: 2, roundsTotal: 2, elapsedMs: 852_400, percent: 100 },
  routineId: 'r1',
  routineName: 'Full Body HIIT',
  category: 'hiit',
  mode: 'play-all',
  startedAt: 1_000_000,
  finishedAt: 1_900_000,
  ...over,
})

describe('sessions store', () => {
  it('round-trips a finished session with every field', async () => {
    const store = new KataDB('sessions-roundtrip')
    await saveSession(base(), store)
    expect(await getSession('s1', store)).toEqual({
      id: 's1', startedAt: 1_000_000, finishedAt: 1_900_000, routineId: 'r1', routineName: 'Full Body HIIT', category: 'hiit',
      mode: 'play-all', durationSeconds: 852, stepsDone: 9, stepsTotal: 9, roundsDone: 2, roundsTotal: 2, percent: 100, completed: true,
    })
  })

  it('stores a stopped-early session as partial with its percent', async () => {
    const store = new KataDB('sessions-partial')
    await saveSession(base({ id: 'p', result: { completed: false, stepsDone: 3, stepsTotal: 9, roundsDone: 0, roundsTotal: 2, elapsedMs: 200_000, percent: 41.6 } }), store)
    const row = await getSession('p', store)
    expect(row).toMatchObject({ completed: false, percent: 42, stepsDone: 3, durationSeconds: 200 })
  })

  it('saves exactly once per id and never overwrites the feel', async () => {
    const store = new KataDB('sessions-once')
    await saveSession(base(), store)
    await setSessionFeel('s1', 'good', store)
    await saveSession(base(), store)
    await saveSession(base(), store)
    const all = await listSessions(store)
    expect(all).toHaveLength(1)
    expect(all[0].feel).toBe('good')
  })

  it('sets and clears the feel', async () => {
    const store = new KataDB('sessions-feel')
    await saveSession(base(), store)
    await setSessionFeel('s1', 'hard', store)
    expect((await getSession('s1', store))?.feel).toBe('hard')
    await setSessionFeel('s1', undefined, store)
    expect(await getSession('s1', store)).not.toHaveProperty('feel')
  })

  it('lists newest first and by date range', async () => {
    const store = new KataDB('sessions-list')
    await saveSession(base({ id: 'a', startedAt: 100 }), store)
    await saveSession(base({ id: 'b', startedAt: 300, routineId: 'r2' }), store)
    await saveSession(base({ id: 'c', startedAt: 200 }), store)
    expect((await listSessions(store)).map((s) => s.id)).toEqual(['b', 'c', 'a'])
    expect((await sessionsBetween(150, 300, store)).map((s) => s.id)).toEqual(['c'])
    expect((await sessionsForRoutine('r1', store)).map((s) => s.id)).toEqual(['c', 'a'])
  })

  it('feeds the routine "last done" once, and not for a session with no step done', async () => {
    const store = new KataDB('sessions-lastdone')
    const r = blankRoutine()
    await saveRoutine(r, store)
    await saveSession(base({ id: 'z', routineId: r.id, result: { completed: false, stepsDone: 0, stepsTotal: 3, roundsDone: 0, roundsTotal: 1, elapsedMs: 1000, percent: 0 } }), store)
    expect((await loadRoutine(r.id, store))?.lastDone).toBeUndefined()
    await saveSession(base({ id: 'y', routineId: r.id, finishedAt: 5000 }), store)
    expect((await loadRoutine(r.id, store))?.lastDone).toBe(5000)
  })

  it('toSessionRow clamps percent and gives completed sessions 100', () => {
    expect(toSessionRow(base({ result: { ...base().result, completed: true, percent: 97 } })).percent).toBe(100)
  })

  it('deleting a session updates month stats, streak and the routine last-done', async () => {
    const store = new KataDB('sessions-delete')
    const r = blankRoutine()
    await saveRoutine(r, store)
    const at = (d: number, h = 9) => new Date(2026, 5, d, h).getTime()
    await saveSession(base({ id: 'd1', routineId: r.id, startedAt: at(9), finishedAt: at(9) + 600_000 }), store)
    await saveSession(base({ id: 'd2', routineId: r.id, startedAt: at(10), finishedAt: at(10) + 600_000 }), store)
    const now = at(10, 20)
    const view = async () => {
      const e = toEntries(await listSessions(store))
      return { routines: monthStats(e, 2026, 6).routines, streak: currentStreak(e, now) }
    }
    expect(await view()).toEqual({ routines: 2, streak: 2 })
    expect((await loadRoutine(r.id, store))?.lastDone).toBe(at(10) + 600_000)
    await deleteSession('d2', store)
    expect(await view()).toEqual({ routines: 1, streak: 1 })
    expect((await loadRoutine(r.id, store))?.lastDone).toBe(at(9) + 600_000)
    await deleteSession('d1', store)
    expect(await view()).toEqual({ routines: 0, streak: 0 })
    expect((await loadRoutine(r.id, store))?.lastDone).toBeUndefined()
    await deleteSession('nope', store)
  })
})
