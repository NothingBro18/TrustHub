import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
      '@components': `${import.meta.dirname}/src/components`,
      '@pages': `${import.meta.dirname}/src/pages`,
      '@services': `${import.meta.dirname}/src/services`,
      '@context': `${import.meta.dirname}/src/context`,
      '@store': `${import.meta.dirname}/src/store`,
      '@utils': `${import.meta.dirname}/src/utils`,
      '@hooks': `${import.meta.dirname}/src/hooks`,
      '@assets': `${import.meta.dirname}/src/assets`,
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
