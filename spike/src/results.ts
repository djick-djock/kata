export type Verdict = 'untested' | 'pass' | 'fail'

export const CHECKS = [
  { id: 'screen', label: 'Screen stays on for 5 minutes' },
  { id: 'audio', label: 'Beeps audible without pausing the music' },
  { id: 'vibration', label: 'Vibration works' },
  { id: 'timer', label: 'Timer accurate after switching apps and returning' },
  { id: 'offline', label: 'Works offline after first load' },
] as const

export interface Results {
  checks: Record<string, Verdict>
  phone: string
  android: string
  music: string
}

export const STORAGE_KEY = 'kata-spike-results'

export function emptyResults(): Results {
  return { checks: Object.fromEntries(CHECKS.map((c) => [c.id, 'untested' as Verdict])), phone: '', android: '', music: '' }
}

const VERDICTS: Verdict[] = ['untested', 'pass', 'fail']

/** Tolerant parse: anything malformed falls back to defaults. */
export function parseResults(raw: string | null): Results {
  const r = emptyResults()
  if (!raw) return r
  try {
    const o = JSON.parse(raw)
    for (const c of CHECKS) if (VERDICTS.includes(o?.checks?.[c.id])) r.checks[c.id] = o.checks[c.id]
    for (const k of ['phone', 'android', 'music'] as const) if (typeof o?.[k] === 'string') r[k] = o[k]
  } catch {
    /* ignore */
  }
  return r
}

export function loadResults(storage: Pick<Storage, 'getItem'> | null = safeStorage()): Results {
  try {
    return parseResults(storage?.getItem(STORAGE_KEY) ?? null)
  } catch {
    return emptyResults()
  }
}

export function saveResults(r: Results, storage: Pick<Storage, 'setItem'> | null = safeStorage()): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(r))
    return !!storage
  } catch {
    return false
  }
}

function safeStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function resultsToText(r: Results): string {
  const lines = ['Kata spike results', `Phone: ${r.phone || '-'}`, `Android: ${r.android || '-'}`, `Music app: ${r.music || '-'}`, '']
  for (const c of CHECKS) lines.push(`${c.label}: ${r.checks[c.id].toUpperCase()}`)
  return lines.join('\n')
}
