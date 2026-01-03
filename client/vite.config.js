import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // This forces Vite to use ONE copy of React, fixing the useRef null error
    dedupe: ['react', 'react-dom'],
  },
})