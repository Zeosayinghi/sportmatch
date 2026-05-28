/**
 * iPlay OData API Service
 * 資料來源：全國運動場館資訊網 https://iplay.sports.gov.tw/odata/GymSearch
 *
 * ── 架構說明 ──────────────────────────────────────────────
 *
 *  開發環境（npm run dev）：
 *    瀏覽器 → /api/iplay/GymSearch → Vite proxy → iplay.sports.gov.tw
 *    Vite proxy 以 Node.js 發出請求，帶上 browser-like headers，
 *    繞過 Cloudflare bot 偵測與 CORS 限制。
 *
 *  生產環境：
 *    瀏覽器 → /api/iplay/GymSearch → proxy-server.js（Express）→ iplay.sports.gov.tw
 *    啟動方式：node proxy-server.js（另開終端機）
 *
 *  若兩者都失敗：自動 fallback 至本地 mock data（39 個全台球場）
 *
 * ── OData 欄位對應 ────────────────────────────────────────
 *  GymName      → 場館名稱
 *  City         → 縣市
 *  District     → 行政區
 *  Address      → 地址
 *  Lat          → 緯度
 *  Lng          → 經度
 *  SportClass   → 運動分類
 *  Tel          → 電話
 *  OpenTime     → 開放時間
 *  WebSite      → 網站
 *
 * ⚠️  擁擠程度為模擬資料，iPlay API 無即時人流資訊
 */

import { FALLBACK_COURTS, SLOTS, PEAK_HOURS } from '../data/fallbackCourts.js'

// ── 常數 ──────────────────────────────────────────────────

// 透過 Vite proxy（開發）或 Express proxy（生產）呼叫
const PROXY_BASE = '/api/iplay'

// 目標運動關鍵字
const TARGET_KEYWORDS = ['羽球', '籃球', '網球', '排球', '足球', '棒球', '壘球', '桌球']

// 運動關鍵字 → 內部 sport key
const SPORT_KEY_MAP = {
  '羽球': 'badminton',
  '籃球': 'basketball',
  '網球': 'tennis',
  '排球': 'volleyball',
  '足球': 'football',
  '棒球': 'baseball',
  '壘球': 'baseball',
  '桌球': 'tabletennis',
}

// 模擬擁擠狀態（⚠️ 非真實人流）
const MOCK_STATUSES = ['free', 'free', 'moderate', 'moderate', 'busy', 'booked']
const MOCK_RATINGS  = [4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0]

// ── 工具函式 ──────────────────────────────────────────────

export function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function parseSports(sportClass = '') {
  const found = []
  for (const [kw, key] of Object.entries(SPORT_KEY_MAP)) {
    if (sportClass.includes(kw) && !found.includes(key)) found.push(key)
  }
  return found.length > 0 ? found : ['basketball']
}

function mockStatus(index) {
  return MOCK_STATUSES[index % MOCK_STATUSES.length]
}

function mockFreeCourts(status, total) {
  if (status === 'busy' || status === 'booked') return 0
  if (status === 'moderate') return Math.max(1, Math.floor(total * 0.3))
  return Math.max(1, Math.floor(total * 0.7))
}

// ── OData 資料轉換 ────────────────────────────────────────

/**
 * 將 iPlay OData 單筆場館轉換成內部格式
 */
function transformVenue(venue, index, userLat, userLng) {
  const lat = parseFloat(venue.Lat) || 0
  const lng = parseFloat(venue.Lng) || 0
  const sports = parseSports(venue.SportClass || '')
  const status = mockStatus(index)
  const totalCourts = Math.floor(Math.random() * 8) + 2
  const freeCourts = mockFreeCourts(status, totalCourts)
  const distance = (userLat && userLng && lat && lng)
    ? parseFloat(calcDistance(userLat, userLng, lat, lng).toFixed(1))
    : parseFloat((0.5 + index * 0.3).toFixed(1))

  return {
    id: venue.GymId || `iplay_${index}`,
    name: venue.GymName || '未知場館',
    city: venue.City || '',
    district: venue.District || '',
    address: venue.Address || '',
    lat,
    lng,
    sports,
    primarySport: sports[0],
    price: 0,
    phone: venue.Tel || '',
    hours: venue.OpenTime || '請洽場館',
    website: venue.WebSite || '',
    rating: MOCK_RATINGS[index % MOCK_RATINGS.length],
    totalCourts,
    freeCourts,
    occupancy: totalCourts - freeCourts,
    status,
    canBook: true,
    slots: SLOTS.filter((_, i) => i % 2 === 0),
    peakHours: PEAK_HOURS,
    nextSlot: SLOTS[Math.floor(Math.random() * 4)],
    distance,
    source: 'iplay',
  }
}

/**
 * 將 fallback mock data 轉換成完整格式
 */
function transformFallback(court, index, userLat, userLng) {
  const status = mockStatus(index)
  const freeCourts = mockFreeCourts(status, court.totalCourts)
  const distance = (userLat && userLng)
    ? parseFloat(calcDistance(userLat, userLng, court.lat, court.lng).toFixed(1))
    : parseFloat((0.5 + index * 0.35).toFixed(1))

  return {
    ...court,
    primarySport: court.sports[0],
    freeCourts,
    occupancy: court.totalCourts - freeCourts,
    status,
    canBook: true,
    slots: SLOTS.filter((_, i) => i % 2 === 0),
    peakHours: PEAK_HOURS,
    nextSlot: SLOTS[Math.floor(Math.random() * 4)],
    distance,
    source: 'fallback',
  }
}

// ── OData fetch ───────────────────────────────────────────

/**
 * 透過 Vite/Express proxy 呼叫 iPlay OData API
 * 支援分頁，自動抓取全部資料（最多 500 筆）
 */
async function fetchFromProxy(params = {}) {
  const defaultParams = {
    '$format': 'json',
    '$top': 500,
    '$skip': 0,
    // 只抓有目標運動的場館
    '$filter': TARGET_KEYWORDS.map(k => `contains(SportClass,'${k}')`).join(' or '),
  }
  const merged = { ...defaultParams, ...params }
  const query = Object.entries(merged)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  const url = `${PROXY_BASE}/GymSearch?${query}`

  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const text = await res.text()

  // iPlay 有時回傳 HTML（Cloudflare challenge），偵測並拋出錯誤
  if (text.trim().startsWith('<') || text.includes('Just a moment')) {
    throw new Error('Cloudflare challenge detected')
  }

  const data = JSON.parse(text)

  // OData 回傳格式：{ value: [...] } 或 { d: { results: [...] } }
  if (Array.isArray(data.value)) return data.value
  if (Array.isArray(data?.d?.results)) return data.d.results
  if (Array.isArray(data)) return data
  throw new Error('Unexpected response format')
}

// ── 主要入口 ──────────────────────────────────────────────

/**
 * 取得全台球場資料
 *
 * 流程：
 *  1. 嘗試透過 proxy 呼叫 iPlay OData API
 *  2. 若失敗（CORS / Cloudflare / 網路）→ 使用 fallback mock data
 *  3. 加入模擬擁擠狀態（⚠️ 非真實人流）
 *  4. 計算與使用者的距離
 *
 * @returns {{ courts: Array, source: 'iplay'|'fallback', error: string|null }}
 */
export async function fetchCourts(userLat = null, userLng = null) {
  // 嘗試 iPlay OData API
  try {
    const venues = await fetchFromProxy()

    if (venues.length > 0) {
      const courts = venues
        .filter(v => {
          const lat = parseFloat(v.Lat)
          const lng = parseFloat(v.Lng)
          return lat && lng && lat > 21 && lat < 26 && lng > 119 && lng < 123 // 台灣範圍
        })
        .map((v, i) => transformVenue(v, i, userLat, userLng))

      console.log(`[iPlay] 成功載入 ${courts.length} 個場館`)
      return { courts, source: 'iplay', error: null }
    }
  } catch (err) {
    console.warn(`[iPlay] API 失敗，使用 fallback data：${err.message}`)
  }

  // Fallback
  const courts = FALLBACK_COURTS.map((c, i) => transformFallback(c, i, userLat, userLng))
  return { courts, source: 'fallback', error: 'iPlay API 無法存取，使用本地資料' }
}

/**
 * 依縣市篩選（直接從已載入的資料篩選，不重新 fetch）
 */
export function filterByCity(courts, city) {
  if (!city || city === 'all') return courts
  return courts.filter(c => c.city === city || c.city.includes(city))
}

/**
 * 依運動種類篩選
 */
export function filterBySport(courts, sport) {
  if (!sport || sport === 'all') return courts
  return courts.filter(c => c.sports?.includes(sport))
}
