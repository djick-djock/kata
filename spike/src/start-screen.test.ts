import { describe, expect, it } from 'vitest'
import { VERSION } from './version'

describe('version', () => {
  it('is a semver string', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
