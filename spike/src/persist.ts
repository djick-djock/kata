export type PersistState = 'unsupported' | 'granted' | 'denied' | 'error'

export async function requestPersistentStorage(): Promise<PersistState> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return 'unsupported'
  try {
    if (await navigator.storage.persisted?.()) return 'granted'
    return (await navigator.storage.persist()) ? 'granted' : 'denied'
  } catch {
    return 'error'
  }
}
