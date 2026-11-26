// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App'

afterEach(cleanup)

describe('navigation', () => {
  it('switches between the four tabs and opens Settings', () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav.querySelectorAll('a')).toHaveLength(4)
    for (const label of ['Routines', 'Exercises', 'History']) {
      fireEvent.click(screen.getByRole('link', { name: label }))
      expect(screen.getByRole('heading', { level: 1, name: label })).toBeTruthy()
    }
    fireEvent.click(screen.getByRole('link', { name: 'Settings' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeTruthy()
  })
})
