import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import LeafletMap from '../components/map/LeafletMap.jsx'
import { MapFilters, CourtSidePanel } from '../components/map/MapControls.jsx'
import { Spinner } from '../components/ui/Badges.jsx'

export default function MapPage({
  courts,
  loading,
  userPos,
  locateUser,
  updateCourt,
  showToast,
  dataSource,
  selectedMapCourt
}) {
  const [sportFilter, setSportFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)
  const [navigateTo, setNavigateTo] = useState(null)

  useEffect(() => {
    if (selectedMapCourt) {
      setSelectedCourt(selectedMapCourt)
      setFlyTarget(selectedMapCourt)
    }
  }, [selectedMapCourt])

  useEffect(() => {
  if (userPos && selectedCourt) {
    setNavigateTo(selectedCourt)
  }
  }, [userPos])

  const filtered = useMemo(() => {
    return courts.filter(c => {
      if (sportFilter !== 'all' && !c.sports?.includes(sportFilter)) return false
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (cityFilter !== 'all' && c.city !== cityFilter) return false
      return true
    })
  }, [courts, sportFilter, statusFilter, cityFilter])

  function handleBook(court, slot) {
    updateCourt(court.id, {
      status: 'booked',
      freeCourts: Math.max(0, court.freeCourts - 1),
      occupancy: court.occupancy + 1,
    })

    showToast(`✅ 已預約 ${court.name} ${slot}`)

    setSelectedCourt(prev =>
      prev?.id === court.id
        ? { ...prev, status: 'booked', freeCourts: Math.max(0, prev.freeCourts - 1) }
        : prev
    )
  }

  const selected = selectedCourt

  return (
    <div className="page-enter">

      {/* Title */}
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold text-white">地圖總覽</h1>
        <p className="text-slate-500 text-sm mt-1">
          即時查看全台球場狀態
        </p>
      </div>

      {/* Filters */}
      <MapFilters
        sportFilter={sportFilter}
        setSportFilter={setSportFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        onLocate={() => {}}
        courtCount={filtered.length}
        selectedCourt={selectedCourt}
      />

      {/* ====== 二欄布局 ====== */}
      <div className="flex gap-4 h-[620px]">

        {/* Google Maps */}
      <div
        className="flex-1 rounded-3xl overflow-hidden border border-slate-700 h-full"
        style={{ border: '1px solid #334155', background: '#0F172A' }}
      >
        {selected?.lat && selected?.lng ? (
          <iframe
            title="google-map"
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block' }}
            loading="lazy"
            src={
              navigateTo
                ? `https://www.google.com/maps/dir/?api=1&destination=${navigateTo.lat},${navigateTo.lng}`
                : userPos
                  ? `https://www.google.com/maps?q=${selected.lat},${selected.lng}&z=15&output=embed`
                  : `https://www.google.com/maps?q=${selected.lat},${selected.lng}&z=15&output=embed`
            }
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            請選擇球場以顯示 Google Map
          </div>
        )}
      </div>

        {/* Panel */}
        <div
          className="w-[340px] h-full rounded-3xl p-5 border border-slate-700"
        >
          <CourtSidePanel
            court={selectedCourt}
            onClose={() => setSelectedCourt(null)}
            onBook={handleBook}
          />

        </div>

      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 flex-wrap">
        {[
          ['#22C55E', '空閒'],
          ['#EAB308', '適中'],
          ['#EF4444', '擁擠'],
          ['#3B82F6', '已預約']
        ].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            {l}
          </div>
        ))}
        <span className="text-xs text-slate-600 ml-auto">
          ⚠️ 擁擠程度為模擬資料，非真實人流
        </span>
      </div>

    </div>
  )
}