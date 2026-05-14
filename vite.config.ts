import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@':           path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@three':      path.resolve(__dirname, './src/three'),
      '@stores':     path.resolve(__dirname, './src/stores'),
      '@lib':        path.resolve(__dirname, './src/lib'),
      '@types':      path.resolve(__dirname, './src/types'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('three')) return 'three-core'
          if (id.includes('@react-three')) return 'r3f-core'
          if (id.includes('recharts') || id.includes('d3-')) return 'chart'
          if (id.includes('framer-motion')) return 'motion'
        },
      }
    }
  }
})
