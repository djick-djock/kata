import { describe, expect, it } from 'vitest'
import { flattenRoutine, type Routine } from '../engine'
import { PHASE_CHANGE_PATTERN } from '../platform/vibration'
import { doneLabel, elapsedText, nextCardText, phaseLabel, pulseFor, ringFraction, timeLeftText, toneFor, vibrationFor } from './logic'

const routine: Routine = {
  name: 'R',
  blocks: [
    {
      name: 'Block A',
      repeat: 1,
      steps: [
        { ref: { type: 'custom' }, name: 'Squats', measure: { type: 'time', seconds: 45 }, restAfterSeconds: 15 },
        { ref: { type: 'custom' }, name: 'Push-ups', measure: { type: 'reps', reps: 20 }, restAfterSeconds: 15 },
        { ref: { type: 'custom' }, name: 'Stretch', measure: { type: 'time', seconds: 30 }, perSide: true, restAfterSeconds: 0 },
      ],
    },
  ],
}
const items = flattenRoutine(routine).items // 0 squats, 1 rest, 2 push-ups, 3 rest, 4 left, 5 switch, 6 right

describe('toneFor', () => {
  it('maps phases to colours; reps, paused and waiting are dark', () => {
    expect(toneFor({ status: 'running', phase: 'warmup' })).toBe('warmup')
    expect(toneFor({ status: 'running', phase: 'work' })).toBe('work')
    expect(toneFor({ status: 'running', phase: 'rest' })).toBe('rest')
    expect(toneFor({ status: 'running', phase: 'switch' })).toBe('rest')
    expect(toneFor({ status: 'running', phase: 'reps' })).toBe('dark')
    expect(toneFor({ status: 'paused', phase: 'work' })).toBe('dark')
    expect(toneFor({ status: 'waiting', phase: 'work' })).toBe('dark')
  })
})

describe('ringFraction', () => {
  it('drains from 1 to 0 and is null for reps', () => {
    expect(ringFraction(45000, items[0])).toBe(1)
    expect(ringFraction(22500, items[0])).toBe(0.5)
    expect(ringFraction(0, items[0])).toBe(0)
    expect(ringFraction(null, items[2])).toBeNull()
  })
})

describe('cue mapping', () => {
  it('every cue kind has a pulse and a vibration', () => {
    for (const kind of ['beep', 'go', 'rest', 'bell'] as const) {
      expect(pulseFor({ kind }).ms).toBeGreaterThan(0)
      expect(vibrationFor({ kind })).toBeTruthy()
    }
    expect(vibrationFor({ kind: 'go' })).toEqual(PHASE_CHANGE_PATTERN)
    expect(pulseFor({ kind: 'bell' }).ms).toBeGreaterThan(pulseFor({ kind: 'beep' }).ms)
  })
})

describe('texts', () => {
  it('Next card', () => {
    expect(nextCardText(items, 0)).toBe('Rest 15 s → Push-ups ×20')
    expect(nextCardText(items, 1)).toBe('Push-ups ×20 → tap Done when finished')
    expect(nextCardText(items, 4)).toBe('Switch sides 5 s → Stretch (right) 30 s')
    expect(nextCardText(items, 6)).toBe('Finish')
  })
  it('Done label, labels and clocks', () => {
    expect(doneLabel(items, 2)).toBe('Done · rest 15 s')
    expect(phaseLabel(items[4], 'running')).toBe('Work · left side')
    expect(phaseLabel(items[1], 'running')).toBe('Rest · breathe')
    expect(phaseLabel(items[0], 'paused')).toBe('Paused')
    expect(timeLeftText(11_280, false)).toBe('0:12 left')
    expect(timeLeftText(688_001, true)).toBe('~11:29 left')
    expect(elapsedText(21_900)).toBe('0:21')
  })
})
