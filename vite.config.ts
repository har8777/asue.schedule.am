import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' 

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Ակադեմիական Դասացուցակի Համակարգ',
        short_name: 'Դասացուցակ',
        description: 'Համալսարանի ֆակուլտետների ինտերակտիվ դասացուցակի կառավարման համակարգ',
        theme_color: '#1e3a8a',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'] 
      }
    })
  ],
  // AGGIUNTO QUI: Configurazione per sbloccare l'accesso esterno (Pinggy/Localtunnel)
  server: {
    host: true,
    port: 5173,
    allowedHosts: true
  }
})