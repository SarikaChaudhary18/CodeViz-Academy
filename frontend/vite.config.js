import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'https://codeviz-academy-backend.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://codeviz-academy-backend.onrender.com',
        ws: true,
        changeOrigin: true,
      },
    },
  }
})
