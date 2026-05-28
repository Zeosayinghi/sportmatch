/**
 * SportMatch Proxy Server
 * 用途：生產環境中代理 iPlay OData API 請求，繞過 Cloudflare 限制
 *
 * 啟動方式：
 *   node proxy-server.js
 *
 * 前端請求：
 *   /api/iplay/GymSearch → https://iplay.sports.gov.tw/odata/GymSearch
 *
 * 安裝依賴（若尚未安裝）：
 *   npm install express http-proxy-middleware cors
 */

import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

// 允許前端跨域請求
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Proxy /api/iplay/* → https://iplay.sports.gov.tw/odata/*
app.use('/api/iplay', createProxyMiddleware({
  target: 'https://iplay.sports.gov.tw',
  changeOrigin: true,
  pathRewrite: { '^/api/iplay': '/odata' },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
    'Referer': 'https://iplay.sports.gov.tw/',
    'Origin': 'https://iplay.sports.gov.tw',
    'Cache-Control': 'no-cache',
  },
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(`[Proxy] ${req.method} ${req.url} → iplay.sports.gov.tw`)
    },
    error: (err, req, res) => {
      console.error(`[Proxy Error] ${err.message}`)
      res.status(502).json({ error: 'Proxy error', message: err.message })
    },
  },
}))

app.listen(PORT, () => {
  console.log(`\n🏀 SportMatch Proxy Server`)
  console.log(`   Port: ${PORT}`)
  console.log(`   Proxy: /api/iplay/* → https://iplay.sports.gov.tw/odata/*`)
  console.log(`   Test: http://localhost:${PORT}/api/iplay/GymSearch?$top=3&$format=json\n`)
})
