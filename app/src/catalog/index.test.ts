import { describe, expect, it } from 'vitest'
import { allExercises, CATEGORIES, drawingFor, findExercise, localized, variantsOf, warmUpExercises } from './index'

describe('catalog', () => {
  it('is available with empty storage and holds the 52 starter exercises', () => {
    // No database is opened here: the catalog is code, not stored data.
    expect(allExercises()).toHaveLength(52)
  })

  it('has unique ids and valid categories, English names and how-to', () => {
    const ids = allExercises().map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const e of allExercises()) {
      expect(CATEGORIES).toContain(e.category)
      expect(e.name.en).toBeTruthy()
      expect(e.howTo.en.length).toBeGreaterThan(0)
      expect(e.tips.en).toBeTruthy()
    }
  })

  it('finds by id', () => {
    expect(findExercise('push-up')?.name.en).toBe('Push-up')
    expect(findExercise('nope')).toBeUndefined()
  })

  it('exposes variants', () => {
    expect(variantsOf('squat').map((v) => v.id)).toEqual(['bodyweight', 'goblet'])
    expect(variantsOf('pull-up').map((v) => v.id)).toEqual(['strict', 'chin-up'])
    expect(variantsOf('plank')).toEqual([])
    expect(variantsOf('unknown')).toEqual([])
  })

  it('lists warm-up tagged exercises', () => {
    const ids = warmUpExercises().map((e) => e.id)
    expect(ids).toEqual(expect.arrayContaining(['squat', 'mountain-climber', 'jumping-jack', 'cat-cow', 'arm-circles', 'high-knees', 'butt-kicks', 'marching-arm-raises']))
    expect(ids).not.toContain('plank')
  })

  it('falls back to English when a language is missing', () => {
    expect(localized({ en: 'Hello', fr: 'Bonjour' }, 'fr')).toBe('Bonjour')
    expect(localized({ en: 'Hello' }, 'fr')).toBe('Hello')
    expect(localized({ en: 'Hello' })).toBe('Hello')
    const stretch = findExercise('pigeon-pose')!
    expect(localized(stretch.name, 'fr')).toBe('Pigeon pose')
  })

  it('resolves drawings and variants', () => {
    expect(drawingFor('push-up')).toContain('<svg')
    expect(drawingFor('push-up', 'knee')).not.toBe(drawingFor('push-up'))
    expect(drawingFor('push-up', 'standard')).toBe(drawingFor('push-up'))
    expect(drawingFor('pigeon-pose')).toContain('<svg')
    expect(drawingFor('nope')).toBeUndefined()
  })
})

describe('drawings', () => {
  it('has a drawing for every catalog exercise (no placeholder fallback)', () => {
    const missing = allExercises().filter((e) => !drawingFor(e.id)).map((e) => e.id)
    expect(missing).toEqual([])
  })

  it('uses no scripts or external references in any drawing', () => {
    for (const e of allExercises()) {
      const svg = drawingFor(e.id) ?? ''
      expect(svg).not.toMatch(/<script|href=|<image|url\(\s*['"]?https?:/i)
    }
  })
})
