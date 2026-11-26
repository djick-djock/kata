import { getTransport, type SubmitResult, type Transport } from './transports'
import type { RequestEnvelope } from './format'

export { formatRequest, type RequestEnvelope } from './format'
export { registerTransport, type SubmitResult, type Transport } from './transports'

/**
 * Sends a request through a transport: a registered name (default "clipboard") or a transport function.
 * An unknown name is rejected. Self-contained: copy this folder to reuse it in another app.
 */
export async function submit(request: RequestEnvelope, transport: string | Transport = 'clipboard'): Promise<SubmitResult> {
  const send = typeof transport === 'string' ? getTransport(transport) : transport
  return send(request)
}
