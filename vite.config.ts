import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  test: {
    // Pure unit tests run in node; no jsdom needed for the current suite.
    environment: 'node',
    coverage: {
      provider: 'v8',
      // text = human-readable in CI logs; lcov = the report SonarCloud reads.
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },
})
