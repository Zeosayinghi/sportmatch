import { useState, useMemo } from 'react'
import CourtCard from '../components/courts/CourtCard.jsx'
import { Spinner, EmptyState } from '../components/ui/Badges.jsx'
import { CITIES } from '../utils/constants.js'

export default function CourtsPage({ courts, loading, updateCourt, showToast, setActivePage, setSelectedMapCourt }) {
  const [search,       setSearch]       = useState('')
  const [sportFilter,  setSportFilter]  = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cityFilter,   setCityFilter]   = useState('all')
  const [sortBy,       setSortBy]       = useState('distance')
  const [highlighted,  setHighlighted]  = useState(null)

  const filtered = useMemo(() => {
    return courts
      .filter(c => {
        if (search && !(c.name || '').includes(search) && !(c.district || '').includes(search) && !(c.city || '').includes(search)) return false
        if (sportFilter !== 'all' && !(Array.isArray(c.sports) ? c.sports : []).includes(sportFilter)) return false
        if (statusFilter !== 'all' && c.status !== statusFilter) return false
        if (cityFilter !== 'all' && c.city !== cityFilter) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'distance')   return a.distance - b.distance
        if (sortBy === 'rating')     return b.rating - a.rating
        if (sortBy === 'freeCourts') return b.freeCourts - a.freeCourts
        return 0
      })
  }, [courts, search, sportFilter, statusFilter, cityFilter, sortBy])

  function handleBook(court, slot) {
    updateCourt(court.id, {
      status: 'booked',
      freeCourts: Math.max(0, court.freeCourts - 1),
      occupancy: court.occupancy + 1,
    })
    showToast(` 已預約 ${court.name} ${slot}`)
  }

  function handleFlyTo(court) {
    setHighlighted(court.id)
    setSelectedMapCourt && setSelectedMapCourt(court)
    setActivePage('map')
  }

  return (
    <div className="page-enter">
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold text-white">附近球場</h1>
        <p className="text-slate-500 text-sm mt-1">找到 {filtered.length} 個符合條件的球場</p>
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl p-4 mb-5 flex flex-wrap gap-2 items-center"
        style={{ background: '#1E293B', border: '1px solid #334155' }}>
        {/* Search */}
        <div className="relative" style={{ minWidth: 220, flex: '1 1 220px', maxWidth: 320 }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜尋球場名稱、地區…"
            className="w-full h-10 pl-8 pr-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }} />
        </div>

        {[
          { value: sportFilter, onChange: setSportFilter, options: [['all','所有運動'],['basketball','🏀 籃球'],['badminton','🏸 羽球'],['tennis','🎾 網球']] },
          { value: statusFilter, onChange: setStatusFilter, options: [['all','所有狀態'],['free','空閒'],['moderate','適中'],['busy','擁擠'],['booked','已預約']] },
          { value: cityFilter, onChange: setCityFilter, options: [['all','所有縣市'], ...CITIES.slice(1).map(c => [c, c])] },
          { value: sortBy, onChange: setSortBy, options: [['distance','距離最近'],['rating','評分最高'],['freeCourts','空場最多']] },
        ].map((sel, i) => (
          <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
            className="h-10 px-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }}>
            {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* Courts grid */}
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="��️" title="找不到符合條件的球場" subtitle="請調整篩選條件" />
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {filtered.map(court => (
            <CourtCard
              key={court.id}
              court={court}
              onBook={handleBook}
              onFlyTo={handleFlyTo}
              isHighlighted={highlighted === court.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
