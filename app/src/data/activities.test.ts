import { describe, expect, it } from 'vitest'
import { KataDB } from './db'
import { activitiesBetween, deleteActivity, findByExternalId, formatPace, getActivity, isDuplicateExternalId, listActivities, paceSecondsPerKm, saveActivity, validateActivity } from './activities'

const base = { type: 'run' as const, startedAt: 1_000_000, durationSeconds: 1720, distanceKm: 5.2, feel: 'good' as const, notes: ' Mont-Royal loop ' }

describe('activities store', () => {
  it('round-trips an activity with source manual and reserved fields absent', async () => {
    const store = new KataDB('act-roundtrip')
    const saved = await saveActivity(base, store)
    expect(await getActivity(saved.id, store)).toEqual({ id: saved.id, type: 'run', startedAt: 1_000_000, durationSeconds: 1720, distanceKm: 5.2, feel: 'good', notes: 'Mont-Royal loop', source: 'manual' })
  })

  it('keeps optional external id, route and heart-rate data', async () => {
    const store = new KataDB('act-extra')
    const s = await saveActivity({ ...base, source: 'gpx', externalId: 'x1', route: [[1, 2]], heartRate: [150] }, store)
    expect(await getActivity(s.id, store)).toMatchObject({ source: 'gpx', externalId: 'x1', route: [[1, 2]], heartRate: [150] })
  })

  it('lists newest first and queries a half-open range oldest first', async () => {
    const store = new KataDB('act-list')
    for (const [id, t] of [['a', 100], ['b', 300], ['c', 200]] as const) await saveActivity({ ...base, id, startedAt: t }, store)
    expect((await listActivities(store)).map((a) => a.id)).toEqual(['b', 'c', 'a'])
    expect((await activitiesBetween(100, 300, store)).map((a) => a.id)).toEqual(['a', 'c'])
  })

  it('replaces by id and deletes', async () => {
    const store = new KataDB('act-delete')
    await saveActivity({ ...base, id: 'a' }, store)
    await saveActivity({ ...base, id: 'a', durationSeconds: 60 }, store)
    expect(await listActivities(store)).toHaveLength(1)
    await deleteActivity('a', store)
    expect(await listActivities(store)).toEqual([])
  })

  it('refuses invalid input and saves nothing', async () => {
    const store = new KataDB('act-invalid')
    await expect(saveActivity({ ...base, durationSeconds: 0 }, store)).rejects.toThrow()
    await expect(saveActivity({ ...base, distanceKm: -1 }, store)).rejects.toThrow()
    expect(await listActivities(store)).toEqual([])
  })

  it('detects duplicate external ids, optionally per source', async () => {
    const store = new KataDB('act-dup')
    await saveActivity({ ...base, id: 'a', source: 'strava', externalId: '42' }, store)
    expect(await isDuplicateExternalId('42', undefined, store)).toBe(true)
    expect(await isDuplicateExternalId('42', 'strava', store)).toBe(true)
    expect(await isDuplicateExternalId('42', 'gpx', store)).toBe(false)
    expect(await isDuplicateExternalId('43', undefined, store)).toBe(false)
    expect((await findByExternalId('42', undefined, store))?.id).toBe('a')
    await saveActivity({ ...base, id: 'm' }, store)
    expect(await isDuplicateExternalId('', undefined, store)).toBe(false)
  })
})

describe('pace', () => {
  it('derives seconds per km and formats it', () => {
    expect(paceSecondsPerKm(1720, 5.2)).toBe(331)
    expect(formatPace(331)).toBe('5:31')
    expect(formatPace(599.6)).toBe('10:00')
  })
  it('is undefined for zero, missing or negative distance and no time', () => {
    expect(paceSecondsPerKm(1000, 0)).toBeUndefined()
    expect(paceSecondsPerKm(1000, undefined)).toBeUndefined()
    expect(paceSecondsPerKm(1000, -2)).toBeUndefined()
    expect(paceSecondsPerKm(0, 5)).toBeUndefined()
  })
})

describe('validateActivity', () => {
  it('accepts positive duration and missing or zero distance', () => {
    expect(validateActivity({ durationSeconds: 1 })).toEqual({})
    expect(validateActivity({ durationSeconds: 60, distanceKm: 0 })).toEqual({})
  })
  it('flags zero, negative or NaN duration and negative or NaN distance', () => {
    expect(validateActivity({ durationSeconds: 0 }).duration).toBeTruthy()
    expect(validateActivity({ durationSeconds: -5 }).duration).toBeTruthy()
    expect(validateActivity({ durationSeconds: NaN }).duration).toBeTruthy()
    expect(validateActivity({ durationSeconds: 60, distanceKm: -0.1 }).distance).toBeTruthy()
    expect(validateActivity({ durationSeconds: 60, distanceKm: NaN }).distance).toBeTruthy()
  })
})
