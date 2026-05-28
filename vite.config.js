import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Vite dev proxy: /api/iplay/* → iplay.sports.gov.tw/odata/*
      // 讓請求從 Node.js 發出，繞過瀏覽器 CORS 限制
      '/api/iplay': {
        target: 'https://iplay.sports.gov.tw',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/iplay/, '/odata'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
          'Referer': 'https://iplay.sports.gov.tw/',
          'Origin': 'https://iplay.sports.gov.tw',
        },
      },
    },
  },
})
