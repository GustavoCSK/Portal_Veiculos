import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

const envDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export default defineConfig(({ mode }) => {
  const { API_BASE_URL } = loadEnv(mode, envDir, '')
  if (!API_BASE_URL) {
    throw new Error('Missing API_BASE_URL configuration')
  }

  return {
    envDir,
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: new URL(API_BASE_URL).origin,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './tests/setup.js',
      restoreMocks: true,
    },
  }
})
