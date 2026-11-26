// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor, act } from '@testing-library/react'
import { db } from '../data/db'
import { Drawing } from '../ui/Drawing'
import { drawingFor } from '../catalog'
import { refreshUserDrawings, removeUserDrawing, saveUserDrawing, userDrawingFor } from './user-drawings'

const MINE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle id="mine" cx="5" cy="5" r="2"/></svg>'

afterEach(async () => { cleanup(); await db.userDrawings.clear(); await refreshUserDrawings() })

describe('user drawings', () => {
  it('stores, reads back, and removes', async () => {
    await saveUserDrawing('plank', MINE)
    expect((await db.userDrawings.get('plank'))?.svg).toBe(MINE)
    await refreshUserDrawings()
    expect(userDrawingFor('plank')).toContain('id="mine"')
    await removeUserDrawing('plank')
    expect(await db.userDrawings.count()).toBe(0)
    expect(userDrawingFor('plank')).toBeUndefined()
  })
  it('variant drawing wins over the exercise one, which is the fallback', async () => {
    await saveUserDrawing('push-up', MINE)
    expect(userDrawingFor('push-up', 'knee')).toContain('id="mine"')
    await saveUserDrawing('push-up--knee', MINE.replace('mine', 'knee'))
    expect(userDrawingFor('push-up', 'knee')).toContain('id="knee"')
    expect(userDrawingFor('push-up')).toContain('id="mine"')
  })
  it('re-sanitises hostile rows that arrive through a restored backup', async () => {
    await db.userDrawings.put({ key: 'plank', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" onload="x()"><path d="M0 0 L1 1"/></svg>', updatedAt: 1 })
    await db.userDrawings.put({ key: 'squat', svg: 'not svg', updatedAt: 1 })
    await refreshUserDrawings()
    expect(userDrawingFor('plank')).not.toContain('onload')
    expect(userDrawingFor('squat')).toBeUndefined()
  })
  it('Drawing shows the local override, then falls back to the shipped drawing after removal', async () => {
    const shipped = drawingFor('squat')
    expect(shipped).toBeDefined()
    render(<Drawing svg={shipped} exerciseId="squat" category="strength" label="Squat" />)
    const art = () => screen.getByRole('img', { name: 'Squat' })
    expect(art().querySelector('#mine')).toBeNull()
    await act(async () => { await saveUserDrawing('squat', MINE) })
    await waitFor(() => expect(art().querySelector('#mine')).not.toBeNull())
    await act(async () => { await removeUserDrawing('squat') })
    await waitFor(() => expect(art().querySelector('#mine')).toBeNull())
    expect(art().querySelector('circle')).not.toBeNull()
  })
})
