import { afterEach, describe, expect, it } from 'vitest'
import { KataDB } from './db'
import { getExerciseLink, normaliseLink, removeExerciseLink, setExerciseLink } from './exercise-links'

let store: KataDB
afterEach(async () => {
  store.close()
  await store.delete()
})

describe('exercise video links', () => {
  it('sets, changes, reads back and removes a link', async () => {
    store = new KataDB(`links-${Math.random()}`)
    expect(await getExerciseLink('plank', store)).toBeUndefined()
    expect(await setExerciseLink('plank', 'https://youtu.be/abc', store)).toBe(true)
    expect(await getExerciseLink('plank', store)).toBe('https://youtu.be/abc')
    expect(await setExerciseLink('plank', 'instagram.com/reel/xyz', store)).toBe(true)
    expect(await getExerciseLink('plank', store)).toBe('https://instagram.com/reel/xyz')
    await removeExerciseLink('plank', store)
    expect(await getExerciseLink('plank', store)).toBeUndefined()
  })

  it('rejects text that is not an http(s) link and keeps the old one', async () => {
    store = new KataDB(`links-${Math.random()}`)
    await setExerciseLink('plank', 'https://youtu.be/abc', store)
    expect(await setExerciseLink('plank', 'javascript:alert(1)', store)).toBe(false)
    expect(await setExerciseLink('plank', '  ', store)).toBe(false)
    expect(await getExerciseLink('plank', store)).toBe('https://youtu.be/abc')
    expect(normaliseLink('not a url')).toBeNull()
  })
})
