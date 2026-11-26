import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Base path is configurable: VITE_BASE=/other/ npm run build. Default suits GitHub Pages.
const base = process.env.VITE_BASE ?? '/kata/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registered explicitly in src/platform/pwa.ts
      includeAssets: ['favicon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        navigateFallback: `${base}index.html`,
        // The spike may live under <base>spike/ on the same origin: never serve the app shell for it.
        navigateFallbackDenylist: [new RegExp(`^${base}spike/`)],
      },
      manifest: {
        name: 'Kata',
        short_name: 'Kata',
        description: 'Build routines and press play',
        display: 'standalone',
        start_url: base,
        scope: base,
        background_color: '#F5F3EE',
        theme_color: '#F5F3EE',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: { include: ['src/**/*.test.{ts,tsx}'], setupFiles: ['src/test/setup.ts'] },
})
