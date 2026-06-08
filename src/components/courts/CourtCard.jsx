import { useState } from 'react'
import { motion } from 'framer-motion'
import { StatusBadge, SportTag, StarRating } from '../ui/Badges.jsx'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function CourtCard({ court, onBook, onFlyTo, isHighlighted, showToast }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [booking, setBooking] = useState(false)
  const { currentUser } = useAuth()

  async function handleBook() {
    if (!selectedSlot) return
    // Venue account court → write to bookings table
    if (court.isVenueAccount) {
      setBooking(true)
      const venueId = court.id.replace('venue_', '')
      const today = new Date().toISOString().split('T')[0]
      await supabase.from('bookings').insert({
        venue_id: venueId,
        user_id: currentUser?.id || 'guest',
        user_name: currentUser?.displayName || currentUser?.display_name || '訪客',
        court_name: court.name,
        booking_date: today,
        booking_time: selectedSlot,
        status: 'pending',
      })
      setBooking(false)
      setSelectedSlot(null)
      setExpanded(false)
      showToast && showToast(\`✅ 已送出預約申請：\${court.name} \${selectedSlot}\`)
      return
    }
    onBook(court, selectedSlot)
    setSelectedSlot(null)
    setExpanded(false)
  }

  const borderColor = {
    free: '#22C55E', moderate: '#EAB308', busy: '#EF4444', booked: '#3B82F6', closed: '#475569'
  }[court.status] || '#334155'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-lift rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: '#1E293B',
        border: `1px solid ${isHighlighted ? borderColor : '#334155'}`,
        boxShadow: isHighlighted ? `0 0 0 2px ${borderColor}44` : 'none',
      }}
      onClick={() => onFlyTo && onFlyTo(court)}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-base font-bold text-white leading-tight">{court.name}</h3>
            <p className="text-slate-500 text-xs mt-1 truncate">📍 {court.district} · {court.address}</p>
          </div>
          <StatusBadge status={court.status} />
        </div>

        {/* Sport tags + distance */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {court.sports?.slice(0, 2).map(s => <SportTag key={s} sport={s} />)}
          <span className="text-xs text-slate-500 ml-auto">📏 {court.distance} km</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl p-2.5 text-center" style={{ background: '#0F172A' }}>
            <p className="text-xs text-slate-500">空場</p>
            <p className="text-base font-bold text-white">{court.freeCourts}<span className="text-xs text-slate-500">/{court.totalCourts}</span></p>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: '#0F172A' }}>
            <p className="text-xs text-slate-500">下一時段</p>
            <p className="text-sm font-bold text-white">{court.nextSlot}</p>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: '#0F172A' }}>
            <p className="text-xs text-slate-500">評分</p>
            <p className="text-sm font-bold text-yellow-400">⭐ {court.rating}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex-1 h-9 rounded-xl text-xs font-semibold transition-all btn-scale"
            style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}
          >
            {expanded ? '收起 ▲' : '查看詳情 ▼'}
          </button>
          {court.canBook && (
            <button
              onClick={() => { setExpanded(true) }}
              className="flex-1 h-9 rounded-xl text-xs font-bold transition-all btn-scale"
              style={{ background: '#2563EB', color: '#fff' }}
            >
              立即預約
            </button>
          )}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t px-5 pb-5 pt-4"
          style={{ borderColor: '#334155', background: '#0F172A' }}
          onClick={e => e.stopPropagation()}
        >
          <p className="text-xs font-semibold text-slate-400 mb-2">今日可預約時段</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(court.isVenueAccount ? (court.time_slots || []) : (court.slots || [])).map(slot => (
              <button key={slot}
                onClick={() => setSelectedSlot(slot === selectedSlot ? null : slot)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all btn-scale"
                style={{
                  background: selectedSlot === slot ? '#2563EB' : '#1E293B',
                  color: selectedSlot === slot ? '#fff' : '#94A3B8',
                  border: `1px solid ${selectedSlot === slot ? '#2563EB' : '#334155'}`,
                }}>
                {slot}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mb-1.5">🔥 尖峰時段</p>
          <div className="flex gap-1 flex-wrap mb-4">
            {court.peakHours?.map(h => (
              <span key={h} className="px-2 py-0.5 rounded-lg text-xs font-medium"
                style={{ background: '#EF444420', color: '#EF4444' }}>{h}</span>
            ))}
          </div>
          <div className="text-xs text-slate-500 mb-3">
            🕐 {court.hours}　{court.phone && `📞 ${court.phone}`}　
            💰 {court.price === 0 ? '免費' : `$${court.price}/hr`}
          </div>
          <button onClick={handleBook} disabled={!selectedSlot || booking || (court.isVenueAccount && !court.time_slots?.length)}
            className="w-full h-10 rounded-xl font-bold text-sm transition-all btn-scale"
            style={{
              background: selectedSlot ? '#2563EB' : '#1E293B',
              color: selectedSlot ? '#fff' : '#475569',
              cursor: selectedSlot ? 'pointer' : 'not-allowed',
            }}>
            {booking ? '送出中...' : selectedSlot ? `確認預約 ${selectedSlot}` : court.isVenueAccount && !(court.time_slots?.length) ? '暫無可預約時段' : '請先選擇時段'}
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
