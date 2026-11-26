import { afterEach, describe, expect, it } from 'vitest'
import { KataDB } from './db'

let db: KataDB
afterEach(async () => {
  db.close()
  await db.delete()
})

describe('KataDB over in-memory IndexedDB', () => {
  it('opens, writes and reads back a setting', async () => {
    db = new KataDB(`test-${Math.random()}`)
    await db.open()
    await db.settings.put({ key: 'switchPauseSeconds', value: 5 })
    expect((await db.settings.get('switchPauseSeconds'))?.value).toBe(5)
  })
})
