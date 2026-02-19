import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react-vendor'
          }

          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase-vendor'
          }

          if (id.includes('node_modules/jspdf') || id.includes('node_modules/dompurify')) {
            return 'jspdf-vendor'
          }

          if (id.includes('node_modules/html2canvas')) {
            return 'html2canvas-vendor'
          }

          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform/resolvers') ||
            id.includes('node_modules/zod')
          ) {
            return 'form-vendor'
          }

          if (id.includes('node_modules')) {
            return 'vendor'
          }

          return undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
