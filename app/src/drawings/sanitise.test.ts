// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { sanitiseSvg } from './sanitise'

const wrap = (inner: string, attrs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" ${attrs}>${inner}</svg>`
const ok = (s: string) => { const r = sanitiseSvg(s); expect(r.ok, r.errors.join()).toBe(true); return r.svg }

describe('sanitiseSvg', () => {
  it('leaves a valid drawing unchanged', () => {
    const src = wrap('<path d="M8 86 L112 86" stroke="currentColor" stroke-opacity="0.35"/><circle cx="60" cy="20" r="7" fill="var(--ill-bg, transparent)" stroke="var(--ill-far, #9AA4BC)"/><g transform="translate(1,2)"><line x1="0" y1="0" x2="5" y2="5" style="stroke-width: 2"/></g>', 'fill="none" stroke="currentColor" role="img" aria-label="x"')
    const r = sanitiseSvg(src)
    expect(r.ok).toBe(true)
    expect(r.removed.filter((x) => !x.includes('aria-label'))).toEqual([])
    for (const frag of ['<path d="M8 86 L112 86" stroke="currentColor" stroke-opacity="0.35"/>', 'fill="var(--ill-bg, transparent)"', 'stroke="var(--ill-far, #9AA4BC)"', 'transform="translate(1,2)"', 'style="stroke-width: 2"', 'viewBox="0 0 120 100"']) expect(r.svg).toContain(frag)
  })

  it('keeps every shipped drawing intact', () => {
    const files = import.meta.glob('../catalog/drawings/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
    expect(Object.keys(files).length).toBeGreaterThan(5)
    for (const [f, src] of Object.entries(files)) {
      const r = sanitiseSvg(src)
      expect(r.ok, f).toBe(true)
      const count = (s: string) => (s.match(/<(path|circle|line|polyline|polygon|rect|ellipse|g)[\s/>]/g) ?? []).length
      expect(count(r.svg), f).toBe(count(src))
    }
  })

  it('strips script elements', () => {
    const svg = ok(wrap('<script>alert(1)</script><path d="M0 0 L5 5"/>'))
    expect(svg).not.toMatch(/script|alert/i)
    expect(svg).toContain('<path')
  })
  it('strips event handlers', () => {
    const svg = ok(wrap('<path d="M0 0 L5 5" onclick="x()" onmouseover="y()"/>', 'onload="alert(1)"'))
    expect(svg).not.toMatch(/on(load|click|mouseover)|alert/i)
  })
  it('strips javascript: and external hrefs, keeps local fragments', () => {
    const svg = ok(wrap('<defs><path id="p" d="M0 0 L5 5"/></defs><use href="javascript:alert(1)"/><use xlink:href="https://evil.test/x.svg#a" xmlns:xlink="http://www.w3.org/1999/xlink"/><use href="#p"/>'))
    expect(svg).not.toMatch(/javascript|evil/)
    expect(svg).toContain('href="#p"')
  })
  it('removes images and foreignObject with their content', () => {
    const svg = ok(wrap('<image href="https://evil.test/a.png"/><foreignObject><div xmlns="http://www.w3.org/1999/xhtml">hi<img src="x"/></div></foreignObject><circle cx="5" cy="5" r="2"/>'))
    expect(svg).not.toMatch(/image|foreignObject|div|evil/i)
    expect(svg).toContain('<circle')
  })
  it('drops external url() references but keeps #fragments', () => {
    const svg = ok(wrap('<rect width="5" height="5" fill="url(https://evil.test/x)"/><rect width="5" height="5" style="fill:url(//evil.test/y)"/><rect width="5" height="5" fill="url(#g)"/>'))
    expect(svg).not.toMatch(/evil/)
    expect(svg).toContain('fill="url(#g)"')
  })
  it('removes style elements (@import) and unsafe style declarations', () => {
    const svg = ok(wrap('<style>@import url(https://evil.test/a.css); svg{display:none}</style><path d="M0 0 L5 5" style="stroke:red; background:url(https://evil.test/z); position:fixed"/>'))
    expect(svg).not.toMatch(/style>|@import|evil|position/)
    expect(svg).toContain('stroke:red')
  })
  it('rejects non-SVG, malformed, doctype and empty input with a message', () => {
    for (const bad of ['', 'hello', '<html><body/></html>', '<svg xmlns="http://www.w3.org/2000/svg"><path></svg>', '<!DOCTYPE svg [<!ENTITY a "b">]>' + wrap('<path d="M0 0"/>'), wrap('<script>1</script>'), '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0 L1 1"/></svg>']) {
      const r = sanitiseSvg(bad)
      expect(r.ok).toBe(false)
      expect(r.svg).toBe('')
      expect(r.errors.length).toBeGreaterThan(0)
    }
  })
  it('derives a viewBox from width and height', () => {
    expect(ok('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="100"><path d="M0 0 L5 5"/></svg>')).toContain('viewBox="0 0 120 100"')
  })
})
