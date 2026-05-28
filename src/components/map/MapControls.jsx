import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusBadge, SportTag, StarRating } from '../ui/Badges.jsx'
import { SPORT_ICONS, SPORT_LABELS, CITIES } from '../../utils/constants.js'

export function MapFilters({ sportFilter, setSportFilter, statusFilter, setStatusFilter, cityFilter, setCityFilter, onLocate, courtCount, selectedCourt }) {
  const sports = [
    { value: 'all', label: '全部' },
    { value: 'basketball', label: '🏀 籃球' },
    { value: 'badminton',  label: '🏸 羽球' },
    { value: 'tennis',     label: '🎾 網球' },
  ]

  return (
    <div className="flex flex-wrap gap-2 items-center p-4 rounded-2xl mb-4"
      style={{ background: '#1E293B', border: '1px solid #334155' }}>
      {/* Sport filter */}
      <div className="flex gap-1.5 flex-wrap">
        {sports.map(s => (
          <button key={s.value} onClick={() => setSportFilter(s.value)}
            className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all btn-scale"
            style={{
              background: sportFilter === s.value ? '#2563EB' : '#0F172A',
              color: sportFilter === s.value ? '#fff' : '#94A3B8',
              border: `1px solid ${sportFilter === s.value ? '#2563EB' : '#334155'}`,
            }}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 ml-auto flex-wrap items-center">
        {/* City filter */}
        <select
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          className="h-9 px-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }}
        >
          {CITIES.map(c => <option key={c} value={c === '全部' ? 'all' : c}>{c}</option>)}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }}
        >
          <option value="all">所有狀態</option>
          <option value="free">空閒</option>
          <option value="moderate">適中</option>
          <option value="busy">擁擠</option>
        </select>

        {/* Count */}
        <span className="text-xs text-slate-500 px-2">顯示 {courtCount} 個</span>

        {/* Locate */}
        {selectedCourt?.lat && selectedCourt?.lng && (
        <button
          onClick={() => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedCourt.lat},${selectedCourt.lng}`
            window.open(url, '_blank')
          }}
          className="ml-auto px-3 h-9 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition"
        >
          🧭 導航
        </button>
        )}

      </div>
    </div>
  )
}

export function CourtSidePanel({ court, onClose, onBook }) {
  const [selectedSlot, setSelectedSlot] = useState(null)

  if (!court) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-600">
      <span className="text-5xl mb-3">🗺️</span>
      <p className="font-semibold text-slate-400">點擊地圖上的球場</p>
      <p className="text-sm text-slate-600 mt-1">查看即時狀態與預約</p>
    </div>
  )

  function handleBook() {
    if (!selectedSlot) return
    onBook(court, selectedSlot)
    setSelectedSlot(null)
  }

  return (
    <motion.div
      key={court.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-lg font-bold text-white leading-tight">{court.name}</h3>
          <p className="text-slate-400 text-sm mt-1">📍 {court.address}</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl flex-shrink-0">✕</button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <StatusBadge status={court.status} />
        {court.sports?.map(s => <SportTag key={s} sport={s} />)}
        <span className="text-xs text-slate-500 ml-auto self-center">📏 {court.distance} km</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          ['👥 目前人數', `${court.occupancy} 人`],
          ['🏟️ 空場數',   `${court.freeCourts} / ${court.totalCourts}`],
          ['⏰ 下一時段', court.nextSlot],
          ['⭐ 評分',     court.rating],
          ['💰 費用',     court.price === 0 ? '免費' : `$${court.price}/hr`],
          ['🕐 營業時間', court.hours],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl p-3" style={{ background: '#0F172A' }}>
            <p className="text-xs text-slate-500">{k}</p>
            <p className="text-sm font-bold text-white mt-0.5">{v}</p>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-300 mb-2">選擇時段</p>
        <div className="flex flex-wrap gap-1.5">
          {court.slots?.map(slot => (
            <button key={slot} onClick={() => setSelectedSlot(slot === selectedSlot ? null : slot)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all btn-scale"
              style={{
                background: selectedSlot === slot ? '#2563EB' : '#0F172A',
                color: selectedSlot === slot ? '#fff' : '#94A3B8',
                border: `1px solid ${selectedSlot === slot ? '#2563EB' : '#334155'}`,
              }}>
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Peak hours */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-500 mb-1.5">🔥 尖峰時段</p>
        <div className="flex gap-1 flex-wrap">
          {court.peakHours?.map(h => (
            <span key={h} className="px-2 py-0.5 rounded-lg text-xs font-medium"
              style={{ background: '#EF444420', color: '#EF4444' }}>{h}</span>
          ))}
        </div>
      </div>

      {/* Book button */}
      <div className="mt-auto">
        <button onClick={handleBook} disabled={!selectedSlot}
          className="w-full h-11 rounded-xl font-bold text-sm transition-all btn-scale"
          style={{
            background: selectedSlot ? '#2563EB' : '#1E293B',
            color: selectedSlot ? '#fff' : '#475569',
            cursor: selectedSlot ? 'pointer' : 'not-allowed',
          }}>
          {selectedSlot ? `預約 ${selectedSlot} 場地` : '請先選擇時段'}
        </button>
        <p className="text-center text-xs text-slate-600 mt-2">⚠️ 擁擠程度為模擬資料，非真實人流</p>
      </div>
    </motion.div>
  )
}
