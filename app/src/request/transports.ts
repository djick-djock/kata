import type { RequestEnvelope } from './format'
import { formatRequest } from './format'

export type SubmitResult =
  | { ok: true; transport: string }
  /** The transport could not deliver; the UI should show `text` so it can be copied by hand. */
  | { ok: false; transport: string; reason: 'manual-copy'; text: string }

export type Transport = (request: RequestEnvelope) => Promise<SubmitResult>

export const clipboardTransport: Transport = async (request) => {
  const text = formatRequest(request)
  try {
    await navigator.clipboard.writeText(text)
    return { ok: true, transport: 'clipboard' }
  } catch {
    return { ok: false, transport: 'clipboard', reason: 'manual-copy', text }
  }
}

const registry = new Map<string, Transport>([['clipboard', clipboardTransport]])

/** Adds a transport (for future services). Existing names are kept unless replaced explicitly. */
export function registerTransport(name: string, transport: Transport): void {
  registry.set(name, transport)
}

export function getTransport(name: string): Transport {
  const t = registry.get(name)
  if (!t) throw new Error(`Unknown request transport: ${name}`)
  return t
}
