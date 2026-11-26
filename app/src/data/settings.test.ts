import { describe, expect, it } from 'vitest'
import { KataDB } from './db'
import { DEFAULT_SETTINGS, loadSettings, parseSettings, saveSetting } from './settings'

describe('settings', () => {
  it('defaults to sound on, vibration on, volume 0.7', () => {
    expect(parseSettings([])).toEqual(DEFAULT_SETTINGS)
    expect(DEFAULT_SETTINGS).toMatchObject({ sound: true, vibration: true, volume: 0.7 })
  })
  it('ignores invalid values and clamps volume', () => {
    const s = parseSettings([
      { key: 'sound', value: 'yes' },
      { key: 'volume', value: 4 },
      { key: 'switchPauseSeconds', value: 'x' },
    ])
    expect(s.sound).toBe(true)
    expect(s.volume).toBe(1)
    expect(s.switchPauseSeconds).toBe(5)
  })
  it('round-trips through Dexie', async () => {
    const store = new KataDB('settings-test')
    await saveSetting('sound', false, store)
    await saveSetting('volume', 0.3, store)
    expect(await loadSettings(store)).toEqual({ ...DEFAULT_SETTINGS, sound: false, volume: 0.3 })
  })
  it('persists every setting across a reopened database', async () => {
    const first = new KataDB('settings-reopen')
    await saveSetting('switchPauseSeconds', 9, first)
    await saveSetting('vibration', false, first)
    await saveSetting('sound', false, first)
    await saveSetting('volume', 0.2, first)
    first.close()
    const again = new KataDB('settings-reopen')
    expect(await loadSettings(again)).toEqual({ sound: false, vibration: false, volume: 0.2, switchPauseSeconds: 9 })
  })
})
