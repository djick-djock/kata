/**
 * Pure player logic: phase to colour, ring progress, cue to pulse / vibration, Next card text.
 * No React, DOM or audio, so it is unit tested.
 */
import type { Cue, PlanItem, SessionState } from '../engine'
import { PHASE_CHANGE_PATTERN, COUNTDOWN_PATTERN } from '../platform/vibration'
import { formatClock } from '../routines/format'

export type PlayerTone = 'warmup' | 'work' | 'rest' | 'dark'

/** Full-screen colour. Reps, paused and waiting (ready) are dark. Same in both themes. */
export function toneFor(state: Pick<SessionState, 'status' | 'phase'>): PlayerTone {
  if (state.status !== 'running') return 'dark'
  switch (state.phase) {
    case 'warmup': return 'warmup'
    case 'work': return 'work'
    case 'rest':
    case 'switch': return 'rest'
    default: return 'dark'
  }
}

/** Fraction of the ring still full, 1 at the start of a timed step to 0 at its end. Null for reps. */
export function ringFraction(remainingMs: number | null, item: Pick<PlanItem, 'durationMs'> | null): number | null {
  if (remainingMs === null || !item || !item.durationMs) return null
  return Math.min(1, Math.max(0, remainingMs / item.durationMs))
}

export interface Pulse {
  kind: Cue['kind']
  /** How long the flash lasts. */
  ms: number
}

/** Every cue gets a visual pulse, so it still works with sound and vibration off. */
export function pulseFor(cue: Pick<Cue, 'kind'>): Pulse {
  switch (cue.kind) {
    case 'beep': return { kind: 'beep', ms: 260 }
    case 'go': return { kind: 'go', ms: 520 }
    case 'rest': return { kind: 'rest', ms: 700 }
    case 'bell': return { kind: 'bell', ms: 1200 }
  }
}

export const BELL_PATTERN = [150]
export const REST_PATTERN = [120]

export function vibrationFor(cue: Pick<Cue, 'kind'>): number | number[] {
  switch (cue.kind) {
    case 'beep': return COUNTDOWN_PATTERN
    case 'go': return PHASE_CHANGE_PATTERN
    case 'rest': return REST_PATTERN
    case 'bell': return BELL_PATTERN
  }
}

export function phaseLabel(item: PlanItem, status: SessionState['status']): string {
  if (status === 'paused') return 'Paused'
  if (status === 'waiting') return 'Ready'
  const side = item.side ? ` · ${item.side} side` : ''
  switch (item.phase) {
    case 'warmup': return `Warm-up${side}`
    case 'work': return item.meditation ? 'Stillness' : `Work${side}`
    case 'reps': return `Reps · your pace${side}`
    case 'rest': {
      const kind = (item as { restKind?: string }).restKind
      return kind === 'round' ? 'Rest · next round' : kind === 'block' ? 'Rest · next block' : 'Rest · breathe'
    }
    case 'switch': return 'Switch sides'
  }
}

const measureText = (item: PlanItem) =>
  item.durationMs === null ? `×${item.reps}` : `${Math.round(item.durationMs / 1000)} s`
const sideText = (item: PlanItem) => (item.side ? ` (${item.side})` : '')

/**
 * "Push-ups ×20", "Switch sides 5 s → Stretch (right) 30 s", "Next block: Core → Plank 45 s", "Finish".
 * Plain rests are left out (the rest is shown by the main label and the Done button); switch-side
 * gaps are kept. When the next step starts another block, the text says so with the block name.
 */
export function nextCardText(items: readonly PlanItem[], index: number): string {
  const current = items[index]
  const gaps: string[] = []
  let j = index + 1
  while (items[j] && !items[j].isStep) {
    if (items[j].phase !== 'rest') gaps.push(`Switch sides ${Math.round((items[j].durationMs ?? 0) / 1000)} s`)
    j++
  }
  const target = items[j]
  if (!target) return 'Finish'
  const parts = [...gaps, `${target.name}${sideText(target)} ${measureText(target)}`]
  if (target.durationMs === null && current && !current.isStep) parts.push('tap Done when finished')
  const text = parts.join(' → ')
  return current && target.blockIndex !== current.blockIndex ? `Next block: ${target.blockName} → ${text}` : text
}

/** Label for the big Done button: "Done · rest 15 s" when a rest follows. */
export function doneLabel(items: readonly PlanItem[], index: number): string {
  const after = items[index + 1]
  return after && after.phase === 'rest' ? `Done · rest ${Math.round((after.durationMs ?? 0) / 1000)} s` : 'Done'
}

/** Time left for the whole routine, "~" when reps steps make it an estimate. */
export function timeLeftText(ms: number, approximate: boolean): string {
  return `${approximate ? '~' : ''}${formatClock(Math.ceil(ms / 1000))} left`
}

export const elapsedText = (ms: number) => formatClock(Math.floor(ms / 1000))

/** "Block 2 of 6" for the overall progress line. */
export const blockCountText = (n: number, count: number) => `Block ${Math.max(1, n)} of ${count}`

/** Overall bar width as a whole percent, clamped 0..100. */
export const overallPercent = (fraction: number) => Math.round(Math.min(1, Math.max(0, fraction)) * 100)
