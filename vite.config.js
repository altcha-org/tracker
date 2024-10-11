import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/tracker.ts',
      name: 'AltchaAnalyticsTracker',
      formats: ['es', 'umd']
    },
  },
})