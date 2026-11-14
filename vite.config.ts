import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // la actualización nunca se aplica sola durante un entreno
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Hypertrophy Tracker',
        short_name: 'Hypertrophy',
        description: 'Seguimiento personal de entrenamiento de hipertrofia, sin conexión.',
        lang: 'es',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        theme_color: '#0E1116',
        background_color: '#0E1116',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      }
    })
  ],
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] }
})
