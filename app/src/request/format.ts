export interface RequestEnvelope {
  appId: string
  type: string
  payload: Record<string, unknown>
}

function renderValue(value: unknown, indent: string): string {
  if (Array.isArray(value)) {
    return value.map((v, i) => `${indent}${i + 1}. ${typeof v === 'string' ? v : JSON.stringify(v)}`).join('\n')
  }
  if (value !== null && typeof value === 'object') return indent + JSON.stringify(value)
  return indent + String(value)
}

/** Turns a request into human-readable prompt text carrying app id, type and every payload field. */
export function formatRequest({ appId, type, payload }: RequestEnvelope): string {
  const lines = [`App: ${appId}`, `Request type: ${type}`, '', 'Details:']
  for (const [key, value] of Object.entries(payload)) {
    const multi = Array.isArray(value) || (typeof value === 'string' && value.includes('\n'))
    if (multi) {
      lines.push(`- ${key}:`)
      lines.push(typeof value === 'string' ? value.split('\n').map((l) => `    ${l}`).join('\n') : renderValue(value, '    '))
    } else {
      lines.push(`- ${key}: ${renderValue(value, '')}`)
    }
  }
  return lines.join('\n')
}
