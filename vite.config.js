import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate' registers SW and checks for updates automatically
      registerType: 'prompt',
      // Inject the SW registration into the app
      injectRegister: 'auto',
      workbox: {
        // Cache all app assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Don't cache Firebase / API calls
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/firebase/],
        // When a new SW is found, skip waiting so we can prompt immediately
        skipWaiting: false,
        clientsClaim: true,
      },
      manifest: {
        name: 'iKIMEI Banking',
        short_name: 'iKIMEI',
        description: 'iKIMEI Internal Banking System',
        theme_color: '#2563EB',
        background_color: '#F5F7FB',
        display: 'standalone',
        icons: [
          {
            src: '/ikimei-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          }
        ],
      },
    }),
  ],
});