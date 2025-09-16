import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      tsconfig: 'tsconfig.app.json',
    },
  },
  build: {
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: [],
    },
    // Tauri-specific build settings
    target: ["es2021", "chrome100", "safari15"],
    rollupOptions: {
      external: [],
    },
  },
  plugins: [
    react(), 
    TanStackRouterVite(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Nyx Crawler Bot',
        short_name: 'NyxBot',
        description: 'Advanced website visit automation with anti-detection technology',
        theme_color: '#000000',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: '/favicon.png',
            sizes: '48x48 72x72 96x96 128x128 256x256',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  // Tauri uses a random port for development
  // We'll adjust the server config for Tauri compatibility
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false, // Tauri needs this to be false
    // Disable HTTPS certificate validation in development
    strictSSL: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api/, ''),
      },
      '/ws': {
        target: process.env.VITE_WS_URL || 'ws://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
      // Add HMR specific websocket endpoint
      '/socket.io': {
        target: 'ws://localhost:5173',
        ws: true,
      }
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
})