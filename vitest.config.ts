/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: [
      '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'test-results/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'clover'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'dist/**',
        'build/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'coverage/**',
        'test-results/**',
        'playwright-report/**',
        'vitest.config.ts',
        'vitest.setup.ts',
        'jest.setup.js',
        'jest.config.js',
        'next.config.js',
        'tailwind.config.ts',
        'postcss.config.js'
      ],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        './components/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        './lib/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        './services/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        './hooks/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      },
      all: true,
      lines: 95,
      functions: 95,
      branches: 95,
      statements: 95
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    bail: 1,
    reporters: process.env.CI ? ['verbose', 'json'] : ['verbose'],
    outputFile: {
      json: './test-results/vitest-results.json'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/types': path.resolve(__dirname, './types'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/services': path.resolve(__dirname, './services'),
      '@/utils': path.resolve(__dirname, './lib/utils'),
      '@/test-utils': path.resolve(__dirname, './__tests__/utils')
    }
  },
  optimizeDeps: {
    include: ['@testing-library/react', '@testing-library/jest-dom']
  }
})
