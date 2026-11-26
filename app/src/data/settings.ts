import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { db, type KataDB, type SettingRow } from './db'

/**
 * Player-facing settings, stored as key/value rows in the Dexie `settings` table
 * (keys: sound, vibration, pulse, volume, switchPauseSeconds). Missing or invalid rows fall back to the
 * defaults, so the player works before the settings screen (ticket 06) writes anything.
 */
export interface PlayerSettings {
  sound: boolean
  vibration: boolean
  /** Visual flash on cues. */
  pulse: boolean
  /** 0..1 */
  volume: number
  /** Pause between the left and right part of a per-side step, seconds. */
  switchPauseSeconds: number
}

export const DEFAULT_SETTINGS: PlayerSettings = { sound: true, vibration: true, pulse: true, volume: 0.7, switchPauseSeconds: 5 }

export type SettingKey = keyof PlayerSettings

const num = (v: unknown, fallback: number, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback

/** Pure: rows from the settings table to a complete settings object. */
export function parseSettings(rows: readonly SettingRow[]): PlayerSettings {
  const map = new Map(rows.map((r) => [r.key, r.value]))
  const bool = (key: SettingKey, fallback: boolean) => (typeof map.get(key) === 'boolean' ? (map.get(key) as boolean) : fallback)
  return {
    sound: bool('sound', DEFAULT_SETTINGS.sound),
    vibration: bool('vibration', DEFAULT_SETTINGS.vibration),
    pulse: bool('pulse', DEFAULT_SETTINGS.pulse),
    volume: num(map.get('volume'), DEFAULT_SETTINGS.volume, 0, 1),
    switchPauseSeconds: Math.round(num(map.get('switchPauseSeconds'), DEFAULT_SETTINGS.switchPauseSeconds, 0, 120)),
  }
}

export async function loadSettings(store: KataDB = db): Promise<PlayerSettings> {
  return parseSettings(await store.settings.toArray())
}

export async function saveSetting<K extends SettingKey>(key: K, value: PlayerSettings[K], store: KataDB = db): Promise<void> {
  await store.settings.put({ key, value })
}

/** Current settings (live), or null until the first read completes. Falls back to defaults if storage fails. */
export function useSettings(): PlayerSettings | null {
  const [settings, setSettings] = useState<PlayerSettings | null>(null)
  useEffect(() => {
    const sub = liveQuery(() => loadSettings()).subscribe({
      next: setSettings,
      error: () => setSettings(DEFAULT_SETTINGS),
    })
    return () => sub.unsubscribe()
  }, [])
  return settings
}
