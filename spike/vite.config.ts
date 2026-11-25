import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

// Base path is configurable: VITE_BASE=/other/ npm run build. Default suits GitHub Pages.
const base = process.env.VITE_BASE ?? '/kata/'

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registered explicitly in src/pwa.ts
      includeAssets: ['favicon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: `${base}index.html`,
      },
      manifest: {
        name: 'Kata Spike',
        short_name: 'Kata Spike',
        description: 'Throwaway spike: audio, screen-awake and timer checks',
        display: 'standalone',
        start_url: base,
        scope: base,
        background_color: '#E3EEDF',
        theme_color: '#E3EEDF',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: { include: ['src/**/*.test.ts'] },
})
