/**
 * SVG sanitiser for owner-imported drawings. Pure: text in, {ok, svg, errors, removed} out.
 * Allow-list based: anything not listed (elements, attributes) is dropped, never trusted.
 * Needs DOMParser/XMLSerializer (browser, or jsdom in tests).
 */
export interface SanitiseResult {
  ok: boolean
  /** Cleaned markup (empty when not ok). */
  svg: string
  /** Why the input was rejected (empty when ok). */
  errors: string[]
  /** Human-readable list of what was stripped from an accepted drawing. */
  removed: string[]
}

const SVG_NS = 'http://www.w3.org/2000/svg'
export const MAX_SVG_BYTES = 200_000

const ELEMENTS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect', 'defs', 'title', 'desc',
  'use', 'symbol', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask', 'marker', 'text', 'tspan',
])

const ATTRS = new Set([
  'id', 'transform', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'points',
  'viewbox', 'preserveaspectratio', 'xmlns', 'xmlns:xlink', 'href', 'xlink:href', 'role', 'focusable',
  'fill', 'fill-opacity', 'fill-rule', 'clip-rule', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', 'opacity', 'color', 'visibility',
  'display', 'vector-effect', 'style', 'clip-path', 'mask', 'marker-start', 'marker-mid', 'marker-end',
  'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform', 'spreadmethod', 'fx', 'fy',
  'markerwidth', 'markerheight', 'refx', 'refy', 'orient', 'markerunits', 'maskunits', 'maskcontentunits', 'clippathunits',
  'text-anchor', 'dominant-baseline', 'font-family', 'font-size', 'font-weight', 'dx', 'dy', 'letter-spacing',
])

const STYLE_PROPS = new Set([
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
  'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', 'opacity', 'color', 'stop-color', 'stop-opacity',
  'clip-path', 'mask', 'marker-start', 'marker-mid', 'marker-end', 'visibility', 'vector-effect',
])

/** True when every url(...) in the value points at a local #fragment and nothing script-like is present. */
function safeValue(value: string): boolean {
  const v = value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\\/g, '')
  if (/javascript:|vbscript:|data:|expression\(|@import|<|>/i.test(v)) return false
  for (const m of v.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) if (!m[2].trim().startsWith('#')) return false
  return !/url\(/i.test(v.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, ''))
}

function cleanStyle(style: string): string {
  return style.split(';').map((d) => d.trim()).filter((d) => {
    const i = d.indexOf(':')
    if (i < 1) return false
    return STYLE_PROPS.has(d.slice(0, i).trim().toLowerCase()) && safeValue(d.slice(i + 1))
  }).join('; ')
}

const fail = (...errors: string[]): SanitiseResult => ({ ok: false, svg: '', errors, removed: [] })

export function sanitiseSvg(input: string): SanitiseResult {
  const text = input.replace(/^﻿/, '').trim()
  if (!text) return fail('Paste or choose an SVG first.')
  if (text.length > MAX_SVG_BYTES) return fail('This SVG is too large (over 200 KB) for a simple line drawing.')
  if (!/<svg[\s>]/i.test(text)) return fail('This does not look like an SVG (no <svg> element found).')
  if (typeof DOMParser === 'undefined') return fail('SVG import is not available here.')

  // DOCTYPE/entities are an XML attack surface and never appear in a drawing.
  const prepared = text.replace(/<\?xml[^>]*\?>/i, '').replace(/<!--[\s\S]*?-->/g, '')
  if (/<!(DOCTYPE|ENTITY)/i.test(prepared)) return fail('This SVG contains a DOCTYPE or entity declaration, which is not allowed.')

  const doc = new DOMParser().parseFromString(prepared, 'image/svg+xml')
  const root = doc.documentElement
  if (!root || doc.getElementsByTagName('parsererror').length > 0) return fail('This SVG could not be read (it is not well-formed). Check that it was copied completely.')
  if (root.localName !== 'svg' || root.namespaceURI !== SVG_NS) return fail('The outer element must be an <svg> in the SVG namespace (xmlns="http://www.w3.org/2000/svg").')

  const removed = new Set<string>()
  const walk = (el: Element) => {
    for (const child of Array.from(el.children)) {
      const name = child.localName.toLowerCase()
      if (child.namespaceURI !== SVG_NS || !ELEMENTS.has(name)) {
        removed.add(`<${child.localName}>`)
        child.remove()
        continue
      }
      clean(child)
      walk(child)
    }
    // Drop any stray non-text node kinds (processing instructions, CDATA) by keeping only elements and text.
    for (const n of Array.from(el.childNodes)) if (n.nodeType !== 1 && n.nodeType !== 3) n.remove()
  }
  const clean = (el: Element) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      const value = attr.value
      let keep = ATTRS.has(name)
      if (keep && (name === 'href' || name === 'xlink:href')) keep = /^#[\w.-]+$/.test(value.trim())
      else if (keep && name === 'style') {
        const cleaned = cleanStyle(value)
        if (cleaned) el.setAttribute(attr.name, cleaned)
        else keep = false
        if (cleaned && cleaned !== value.trim()) removed.add('parts of style attributes')
      } else if (keep && name.startsWith('xmlns')) keep = name === 'xmlns' ? value === SVG_NS : value === 'http://www.w3.org/1999/xlink'
      else if (keep) keep = safeValue(value)
      if (!keep) {
        if (!name.startsWith('xmlns')) removed.add(name.startsWith('on') ? 'event handlers' : name === 'href' || name === 'xlink:href' ? 'external links' : `attribute ${attr.name}`)
        el.removeAttributeNode(attr)
      }
    }
  }
  clean(root)
  walk(root)
  if (!root.hasAttribute('xmlns')) root.setAttribute('xmlns', SVG_NS)

  // The viewBox is what makes the drawing scale; derive it from numeric width/height when missing.
  if (!/^\s*-?[\d.]+[\s,]+-?[\d.]+[\s,]+[\d.]+[\s,]+[\d.]+\s*$/.test(root.getAttribute('viewBox') ?? '')) {
    const w = parseFloat(root.getAttribute('width') ?? '')
    const h = parseFloat(root.getAttribute('height') ?? '')
    if (w > 0 && h > 0) root.setAttribute('viewBox', `0 0 ${w} ${h}`)
    else return fail('The SVG needs a viewBox (for example viewBox="0 0 120 100").')
  }
  if (!root.querySelector('path, circle, ellipse, line, polyline, polygon, rect, text')) return fail('This SVG has nothing drawn in it after cleaning.')

  const svg = new XMLSerializer().serializeToString(root)
  return { ok: true, svg, errors: [], removed: [...removed] }
}
