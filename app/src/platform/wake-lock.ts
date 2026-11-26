export type WakeLockState = 'unsupported' | 'idle' | 'held' | 'failed'

/** Screen wake lock with feature detection. Re-acquire on visibility return while wanted. */
export function createWakeLock(onChange: (state: WakeLockState, detail?: string) => void) {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  let sentinel: WakeLockSentinel | null = null
  let wanted = false

  const acquire = async () => {
    if (!supported) return onChange('unsupported')
    if (sentinel && !sentinel.released) return
    try {
      sentinel = await navigator.wakeLock.request('screen')
      sentinel.addEventListener('release', () => onChange('idle', wanted ? 'released by system' : undefined))
      onChange('held')
    } catch (err) {
      sentinel = null
      onChange('failed', err instanceof Error ? err.message : String(err))
    }
  }

  const onVisible = () => {
    if (wanted && document.visibilityState === 'visible') void acquire()
  }
  document.addEventListener('visibilitychange', onVisible)

  onChange(supported ? 'idle' : 'unsupported')
  return {
    supported,
    async request() {
      wanted = true
      await acquire()
    },
    async release() {
      wanted = false
      const s = sentinel
      sentinel = null
      if (s) await s.release().catch(() => {})
      onChange(supported ? 'idle' : 'unsupported')
    },
    /** Releases the lock and removes the visibility listener. */
    async dispose() {
      document.removeEventListener('visibilitychange', onVisible)
      await this.release()
    },
  }
}
