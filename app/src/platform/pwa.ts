import { registerSW } from 'virtual:pwa-register'

/** Registers the service worker (precaches the whole app for offline use). */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) registerSW({ immediate: true })
}
