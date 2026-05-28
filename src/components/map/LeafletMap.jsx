import { useEffect, useRef } from 'react'
import { SPORT_COLORS, STATUS_CONFIG } from '../../utils/constants.js'

// ── Marker icon 工廠 ──────────────────────────────────────

function createMarkerIcon(L, sport, status, isSelected = false) {
  const sc = SPORT_COLORS[sport] || '#3B82F6'
  const stc = STATUS_CONFIG[status]?.color || '#22C55E'
  const size = isSelected ? 46 : 36

  const emoji = { basketball:'🏀', badminton:'🏸', tennis:'🎾', volleyball:'🏐', football:'⚽', baseball:'⚾', tabletennis:'🏓' }[sport] || '🏟️'

  const html = `
    <div style="position:relative;width:${size}px;height:${size + 10}px;cursor:pointer">
      <svg width="${size}" height="${size + 10}" viewBox="0 0 46 56" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="ds${sport}${status}" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.45)"/>
          </filter>
        </defs>
        <path d="M23 2C12.5 2 4 10.5 4 21C4 34 23 54 23 54C23 54 42 34 42 21C42 10.5 33.5 2 23 2Z"
          fill="${sc}" filter="url(#ds${sport}${status})" opacity="0.92"/>
        <circle cx="23" cy="21" r="13" fill="white" opacity="0.95"/>
        <circle cx="34" cy="10" r="7" fill="${stc}" stroke="white" stroke-width="2.5"/>
      </svg>
      <div style="position:absolute;top:${isSelected ? 8 : 6}px;left:50%;transform:translateX(-50%);font-size:${isSelected ? 14 : 11}px;line-height:1;pointer-events:none">
        ${emoji}
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 10],
    popupAnchor: [0, -(size + 10)],
  })
}

function createUserIcon(L) {
  return L.divIcon({
    html: `
      <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(59,130,246,0.25);animation:pulse-ring 1.8s ease-out infinite"></div>
        <div style="position:absolute;width:20px;height:20px;border-radius:50%;background:rgba(59,130,246,0.15);animation:pulse-ring 1.8s ease-out 0.4s infinite"></div>
        <div style="width:14px;height:14px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 2px 10px rgba(59,130,246,0.7);position:relative;z-index:1"></div>
      </div>
    `,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

// ── Popup HTML ────────────────────────────────────────────

function buildPopupHTML(court) {
  const sc = STATUS_CONFIG[court.status] || STATUS_CONFIG.free
  const sportColor = SPORT_COLORS[court.primarySport] || '#3B82F6'
  const sportEmojis = { basketball:'🏀', badminton:'🏸', tennis:'🎾', volleyball:'🏐', football:'⚽', baseball:'⚾', tabletennis:'🏓' }

  const sportTags = (court.sports || [court.primarySport]).map(s =>
    `<span style="padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:${sportColor}25;color:${sportColor};border:1px solid ${sportColor}40">${sportEmojis[s] || '🏟️'} ${s === 'basketball' ? '籃球' : s === 'badminton' ? '羽球' : s === 'tennis' ? '網球' : s}</span>`
  ).join('')

  return `
    <div style="font-family:Inter,sans-serif;padding:2px 0;min-width:250px">
      <h3 style="margin:0 0 6px;font-size:15px;font-weight:700;color:#F8FAFC;line-height:1.3;padding-right:20px">${court.name}</h3>
      <p style="margin:0 0 10px;font-size:12px;color:#94A3B8">📍 ${court.city} ${court.district} · ${court.address}</p>

      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;align-items:center">
        <span style="padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:${sc.color}25;color:${sc.color};border:1px solid ${sc.color}40">
          ${sc.label}
        </span>
        ${sportTags}
        <span style="margin-left:auto;font-size:11px;color:#64748B">📏 ${court.distance} km</span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-bottom:10px">
        <div style="background:#0F172A;border-radius:8px;padding:7px;text-align:center">
          <div style="font-size:10px;color:#64748B;margin-bottom:2px">空場</div>
          <div style="font-size:14px;font-weight:700;color:#F8FAFC">${court.freeCourts}<span style="font-size:10px;color:#64748B">/${court.totalCourts}</span></div>
        </div>
        <div style="background:#0F172A;border-radius:8px;padding:7px;text-align:center">
          <div style="font-size:10px;color:#64748B;margin-bottom:2px">評分</div>
          <div style="font-size:14px;font-weight:700;color:#FBBF24">⭐ ${court.rating}</div>
        </div>
        <div style="background:#0F172A;border-radius:8px;padding:7px;text-align:center">
          <div style="font-size:10px;color:#64748B;margin-bottom:2px">費用</div>
          <div style="font-size:13px;font-weight:700;color:#F8FAFC">${court.price === 0 ? '免費' : '$' + court.price}</div>
        </div>
      </div>

      <div style="font-size:11px;color:#64748B;margin-bottom:10px;line-height:1.6">
        🕐 ${court.hours}${court.phone ? `　📞 ${court.phone}` : ''}
      </div>

      <button
        onclick="window.__sm_book(${JSON.stringify(court.id)})"
        style="width:100%;height:36px;border-radius:10px;background:#2563EB;color:white;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:6px"
        onmouseover="this.style.background='#1D4ED8'"
        onmouseout="this.style.background='#2563EB'"
      >
        🏟️ 立即預約
      </button>
      <div style="display:flex;gap:6px;margin-top:8px">
        <a
          href="https://www.google.com/maps?q=${court.lat},${court.lng}"
          target="_blank"
          style="flex:1;text-align:center;padding:8px;border-radius:8px;background:#0F172A;color:#93C5FD;font-size:11px;text-decoration:none;border:1px solid #1E293B"
        >
          🗺️ Google Maps
        </a>

        <a
          href="https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}"
          target="_blank"
          style="flex:1;text-align:center;padding:8px;border-radius:8px;background:#0F172A;color:#34D399;font-size:11px;text-decoration:none;border:1px solid #1E293B"
        >
          🚗 導航
        </a>
      </div>
      <p style="margin:5px 0 0;font-size:10px;color:#475569;text-align:center">⚠️ 擁擠程度為模擬資料，非真實人流</p>
    </div>
  `
}

// ── Component ─────────────────────────────────────────────

export default function LeafletMap({ courts, userPos, selectedCourtId, onSelectCourt, onBook }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef({})
  const userMarkRef  = useRef(null)
  const LRef         = useRef(null)

  // 初始化地圖
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const L = window.L
    if (!L) { console.error('Leaflet not loaded'); return }
    LRef.current = L

    const map = L.map(containerRef.current, {
      center: [23.9739, 120.9773],
      zoom: 8,
      zoomControl: true,
      attributionControl: true,
    })

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" style="color:#475569">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    // 全域 callback 供 popup 按鈕使用
    window.__sm_book = (id) => onBook && onBook(id)

    return () => {
      map.remove()
      mapRef.current = null
      delete window.__sm_book
    }
  }, [])

  // 更新 onBook callback（避免 stale closure）
  useEffect(() => {
    window.__sm_book = (id) => onBook && onBook(id)
  }, [onBook])

  // 更新 markers
  useEffect(() => {
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L) return

    // 清除舊 markers
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}

    courts.forEach(court => {
      if (!court.lat || !court.lng) return
      const isSelected = court.id === selectedCourtId
      const icon = createMarkerIcon(L, court.primarySport, court.status, isSelected)

      const marker = L.marker([court.lat, court.lng], { icon, title: court.name })
        .addTo(map)
        .bindPopup(buildPopupHTML(court), {
          maxWidth: 300,
          minWidth: 260,
        })
        .on('click', () => {
          onSelectCourt && onSelectCourt(court)
        })

      markersRef.current[court.id] = marker
    })
  }, [courts, selectedCourtId])

  // 飛到選中球場
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedCourtId) return
    const court = courts.find(c => c.id === selectedCourtId)
    if (!court?.lat) return
    map.flyTo([court.lat, court.lng], 15, { duration: 1.1, easeLinearity: 0.25 })
    setTimeout(() => markersRef.current[selectedCourtId]?.openPopup(), 1300)
  }, [selectedCourtId])

  // 使用者位置 marker
  useEffect(() => {
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L || !userPos) return

    userMarkRef.current?.remove()
    userMarkRef.current = L.marker([userPos.lat, userPos.lng], {
      icon: createUserIcon(L),
      zIndexOffset: 1000,
    })
      .addTo(map)
      .bindPopup('<div style="color:#F8FAFC;font-size:13px;font-weight:600;padding:2px 0">📍 你在這裡</div>')

    map.flyTo([userPos.lat, userPos.lng], 13, { duration: 1.5 })
  }, [userPos])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', borderRadius: 24, minHeight: 480 }}
    />
  )
}
