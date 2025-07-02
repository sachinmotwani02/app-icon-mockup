import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const base = command === 'serve' ? '/' : '/app-icon-mockup/'
  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'dist',
    },
  }
})
