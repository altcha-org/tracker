import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist_bundle',
    lib: {
      entry: 'src/main.ts',
      name: 'AltchaAnalyticsTracker',
      fileName: () => 'tracker.js',
      formats: ['umd']
    },
  },
})