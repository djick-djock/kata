// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { getOwnerMode, setOwnerMode } from './owner'

describe('owner flag', () => {
  beforeEach(() => localStorage.clear())
  it('is off by default, persists on and off', () => {
    expect(getOwnerMode()).toBe(false)
    setOwnerMode(true)
    expect(getOwnerMode()).toBe(true)
    expect(localStorage.getItem('kata.ownerMode')).toBe('1')
    setOwnerMode(false)
    expect(getOwnerMode()).toBe(false)
  })
})
