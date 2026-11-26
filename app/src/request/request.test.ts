import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatRequest, submit } from './index'

const req = { appId: 'kata', type: 'drawing', payload: { name: 'Squat', steps: ['Stand', 'Sit back'], perSide: false } }

afterEach(() => vi.unstubAllGlobals())

describe('request module', () => {
  it('formats app id, type and every payload field', () => {
    const t = formatRequest(req)
    for (const s of ['kata', 'drawing', 'name: Squat', 'steps:', '1. Stand', '2. Sit back', 'perSide: false']) expect(t).toContain(s)
  })

  it('clipboard transport writes the prompt text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const r = await submit(req)
    expect(r).toEqual({ ok: true, transport: 'clipboard' })
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Request type: drawing'))
  })

  it('falls back to manual copy when the clipboard fails', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    const r = await submit(req)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.text).toContain('App: kata')
  })

  it('rejects an unknown transport', async () => {
    await expect(submit(req, 'pigeon')).rejects.toThrow(/Unknown request transport/)
  })

  it('imports nothing from outside its own folder', () => {
    const dir = __dirname
    const files = readdirSync(dir).filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.test.ts'))
    expect(files.length).toBeGreaterThan(0)
    for (const f of files) {
      const src = readFileSync(join(dir, f), 'utf8')
      for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
        const spec = m[1]
        if (spec.startsWith('.')) expect(spec, `${f} imports ${spec}`).toMatch(/^\.\/[^/]+$/)
        else expect(spec, `${f} imports package ${spec}`).toMatch(/^(node:)?$/)
      }
    }
  })
})
