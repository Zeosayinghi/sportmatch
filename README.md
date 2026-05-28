# SportMatch 🏀

動態運動資源調度平台 - Vite React MVP

## 快速啟動

### 方法一：只啟動前端（使用 fallback 資料）
```
npm run dev
```
開啟 http://localhost:5173

### 方法二：啟動前端 + iPlay API proxy（取得真實場館資料）
```
npm run dev:full
```
- 前端：http://localhost:5173
- Proxy：http://localhost:3001

## iPlay API 說明

資料來源：https://iplay.sports.gov.tw/odata/GymSearch

**為什麼需要 proxy？**
iPlay 網站受 Cloudflare 保護，瀏覽器直接呼叫會被擋（CORS + bot 偵測）。
透過 Node.js proxy server 發出請求可繞過此限制。

**資料流程：**
```
瀏覽器 → /api/iplay/GymSearch
  (開發) Vite proxy → iplay.sports.gov.tw
  (生產) proxy-server.js (port 3001) → iplay.sports.gov.tw
```

**Fallback 機制：**
若 API 無法存取，自動使用 src/data/fallbackCourts.js 中的 39 個全台球場資料。

注意：擁擠程度為模擬資料，iPlay API 無即時人流資訊

## 技術棧

- React 19 + Vite 8
- Tailwind CSS v4
- Leaflet + OpenStreetMap（真實地圖）
- Framer Motion（動畫）
- Express proxy（iPlay API 代理）
