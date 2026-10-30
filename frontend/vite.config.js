import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const envDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export default defineConfig({
  envDir,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    restoreMocks: true,
  },
})
