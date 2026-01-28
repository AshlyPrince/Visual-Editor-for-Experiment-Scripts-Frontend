import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['i18next', 'react-i18next', 'i18next-browser-languagedetector']
  },
  server: {
    port: 5173,
    fs: {
      strict: false
    }
  }
})
