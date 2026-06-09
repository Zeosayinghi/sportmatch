import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

const iStyle = {
  background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC',
  borderRadius: 10, padding: '8px 12px', fontSize: 14, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
const lStyle = {
  fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 5,
  display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em',
}

const SPORT_LABELS = {
  basketball: '🏀 籃球', badminton: '🏸 羽球', tennis: '🎾 網球',
  volleyball: '🏐 排球', football: '⚽ 足球', tabletennis: '🏓 桌球',
}
const STATUS_COLOR = {
  confirmed: { bg: '#14532D', text: '#86EFAC', label: '已確認' },
  cancelled: { bg: '#450A0A', text: '#FCA5A5', label: '已取消' },
  pending:   { bg: '#431407', text: '#FED7AA', label: '待確認' },
}


function TimeSlotManager({ slots = [], onChange }) {
  const [newSlot, setNewSlot] = useState('')

  const QUICK_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
  ]

  function addSlot(slot) {
    if (!slot || slots.includes(slot)) return
    onChange([...slots, slot].sort())
  }

  function removeSlot(slot) {
    onChange(slots.filter(s => s !== slot))
  }

  const iStyle2 = {
    background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC',
    borderRadius: 10, padding: '8px 12px', fontSize: 13, outline: 'none',
  }

  return (
    <div>
      {/* Quick add */}
      <p style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>快速新增</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {QUICK_SLOTS.filter(s => !(Array.isArray(slots) ? slots : []).includes(s)).map(s => (
          <button key={s} onClick={() => addSlot(s)} type="button"
            style={{ padding: '5px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: '#0F172A', color: '#64748B', border: '1px solid #334155' }}>
            + {s}
          </button>
        ))}
      </div>

      {/* Custom add */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input type="time" value={newSlot} onChange={e => setNewSlot(e.target.value)}
          style={{ ...iStyle2, flex: 1 }} />
        <button onClick={() => { addSlot(newSlot); setNewSlot('') }} type="button"
          style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#2563EB', color: '#fff', border: 'none', cursor: 'pointer' }}>
          新增
        </button>
      </div>

      {/* Current slots */}
      {slots.length === 0 ? (
        <p style={{ color: '#475569', fontSize: 12, fontStyle: 'italic' }}>尚未設定時段</p>
      ) : (
        <div>
          <p style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>已設定時段（{slots.length}）</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {slots.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, background: '#1E3A5F', border: '1px solid #2563EB' }}>
                <span style={{ color: '#60A5FA', fontSize: 12, fontWeight: 600 }}>{s}</span>
                <button onClick={() => removeSlot(s)} type="button"
                  style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 14, padding: '0 0 0 4px', lineHeight: 1 }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function VenueDashboard({ showToast }) {
  const { currentUser, logout, getVenueInfo, updateVenueInfo, getVenueBookings, updateBookingStatus } = useAuth()

  const [venue, setVenue]         = useState(null)
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('bookings') // 'bookings' | 'settings'
  const [saving, setSaving]       = useState(false)

  // Settings form
  const [form, setForm] = useState({
    venue_name: '', address: '', sports: [],
    is_open: false, open_time: '08:00', close_time: '22:00', time_slots: [],
  })

  // Booking filters
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [v, b] = await Promise.all([getVenueInfo(), getVenueBookings()])
    setVenue(v)
    setBookings(b)
    if (v) {
      setForm({
        venue_name:  v.venue_name  || '',
        address:     v.address     || '',
        sports:      Array.isArray(v.sports) ? v.sports : [],
        is_open:     v.is_open     ?? false,
        open_time:   v.open_time   || '08:00',
        close_time:  v.close_time  || '22:00',
        time_slots:  Array.isArray(v.time_slots) ? v.time_slots : [],
      })
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    await updateVenueInfo(form)
    await loadData()
    setSaving(false)
    showToast('✅ 球場資料已更新')
  }

  async function handleToggleOpen() {
    const newVal = !form.is_open
    setForm(p => ({ ...p, is_open: newVal }))
    await updateVenueInfo({ ...form, is_open: newVal })
    showToast(newVal ? '🟢 球場已設為營業中' : '🔴 球場已設為休息中')
    loadData()
  }

  async function handleBookingStatus(bookingId, status) {
    await updateBookingStatus(bookingId, status)
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
    showToast(status === 'confirmed' ? '✅ 已確認預約' : '❌ 已取消預約')
  }

  function toggleSport(s) {
    setForm(p => ({
      ...p,
      sports: p.sports.includes(s) ? p.sports.filter(x => x !== s) : [...p.sports, s],
    }))
  }

  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (dateFilter && b.booking_date !== dateFilter) return false
    return true
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const todayCount    = bookings.filter(b => b.booking_date === todayStr && b.status === 'confirmed').length
  const pendingCount  = bookings.filter(b => b.status === 'pending').length
  const totalCount    = bookings.length

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#94A3B8' }}>載入中...</div>
    </div>
  )

  const isOpen = venue?.is_open ?? form.is_open

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A' }}>
      {/* Top bar */}
      <div style={{ background: '#111827', borderBottom: '1px solid #1E293B', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🏟️</span>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>
              {venue?.venue_name || '球場後台'}
            </p>
            <p style={{ color: '#64748B', fontSize: 11, margin: 0 }}>管理員：{currentUser?.displayName || currentUser?.display_name}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Open/Close toggle */}
          <button onClick={handleToggleOpen}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', border: 'none',
              background: isOpen ? '#14532D' : '#1E293B',
              color: isOpen ? '#86EFAC' : '#94A3B8',
              transition: 'all 0.2s',
            }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOpen ? '#22C55E' : '#475569', display: 'inline-block' }} />
            {isOpen ? '營業中' : '休息中'}
          </button>
          <button onClick={logout}
            style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, background: '#0F172A', color: '#EF4444', border: '1px solid #334155', cursor: 'pointer' }}>
            登出
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: '今日預約', value: todayCount, icon: '📅', color: '#2563EB' },
            { label: '待確認',   value: pendingCount, icon: '⏳', color: '#D97706' },
            { label: '總預約數', value: totalCount,   icon: '📊', color: '#0891B2' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: '16px 20px' }}>
              <p style={{ color: '#64748B', fontSize: 12, margin: '0 0 6px' }}>{icon} {label}</p>
              <p style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#1E293B', borderRadius: 12, padding: 4, marginBottom: 20, border: '1px solid #334155', width: 'fit-content' }}>
          {[['bookings', '📋 預約記錄'], ['settings', '⚙️ 球場設定']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{
                padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: activeTab === id ? '#2563EB' : 'transparent',
                color: activeTab === id ? '#fff' : '#64748B',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                style={{ ...iStyle, width: 'auto' }} />
              {['all', 'confirmed', 'pending', 'cancelled'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', border: '1px solid #334155',
                    background: statusFilter === s ? '#2563EB' : '#0F172A',
                    color: statusFilter === s ? '#fff' : '#64748B',
                  }}>
                  {s === 'all' ? '全部' : STATUS_COLOR[s]?.label}
                  {s !== 'all' && ` (${bookings.filter(b => b.status === s).length})`}
                </button>
              ))}
              {dateFilter && (
                <button onClick={() => setDateFilter('')}
                  style={{ padding: '8px 12px', borderRadius: 10, fontSize: 12, background: '#0F172A', color: '#94A3B8', border: '1px solid #334155', cursor: 'pointer' }}>
                  ✕ 清除日期
                </button>
              )}
            </div>

            {/* Table */}
            <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1fr 1.2fr', gap: 0, background: '#0F172A', padding: '12px 20px', borderBottom: '1px solid #334155' }}>
                {['預約者', '日期', '時間', '場地', '狀態', '操作'].map(h => (
                  <span key={h} style={{ color: '#64748B', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center', color: '#475569' }}>
                  <p style={{ fontSize: 32, margin: '0 0 8px' }}>📋</p>
                  <p style={{ margin: 0 }}>尚無預約記錄</p>
                </div>
              ) : (
                filteredBookings.map((b, i) => {
                  const sc = STATUS_COLOR[b.status] || STATUS_COLOR.pending
                  return (
                    <div key={b.id}
                      style={{
                        display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1fr 1.2fr',
                        gap: 0, padding: '14px 20px', alignItems: 'center',
                        borderBottom: i < filteredBookings.length - 1 ? '1px solid #1E293B' : 'none',
                        background: i % 2 === 0 ? 'transparent' : '#15253A',
                      }}>
                      <div>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{b.user_name}</p>
                        <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>@{b.user_id}</p>
                      </div>
                      <span style={{ color: '#CBD5E1', fontSize: 13 }}>{b.booking_date}</span>
                      <span style={{ color: '#CBD5E1', fontSize: 13 }}>{b.booking_time}</span>
                      <span style={{ color: '#CBD5E1', fontSize: 13 }}>{b.court_name}</span>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text }}>
                        {sc.label}
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {b.status === 'pending' && (
                          <>
                            <button onClick={() => handleBookingStatus(b.id, 'confirmed')}
                              style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: '#14532D', color: '#86EFAC', border: 'none', cursor: 'pointer' }}>
                              確認
                            </button>
                            <button onClick={() => handleBookingStatus(b.id, 'cancelled')}
                              style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: '#450A0A', color: '#FCA5A5', border: 'none', cursor: 'pointer' }}>
                              取消
                            </button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button onClick={() => handleBookingStatus(b.id, 'cancelled')}
                            style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, background: '#1E293B', color: '#94A3B8', border: '1px solid #334155', cursor: 'pointer' }}>
                            取消
                          </button>
                        )}
                        {b.status === 'cancelled' && (
                          <button onClick={() => handleBookingStatus(b.id, 'confirmed')}
                            style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, background: '#1E293B', color: '#94A3B8', border: '1px solid #334155', cursor: 'pointer' }}>
                            恢復
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Basic info */}
              <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 24 }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 20px' }}>基本資料</p>
                <div style={{ marginBottom: 14 }}>
                  <label style={lStyle}>球場名稱</label>
                  <input style={iStyle} value={form.venue_name} placeholder="例：大安運動中心"
                    onChange={e => setForm(p => ({ ...p, venue_name: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lStyle}>地址</label>
                  <input style={iStyle} value={form.address} placeholder="例：台北市大安區..."
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div>
                  <label style={lStyle}>提供運動項目</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(SPORT_LABELS).map(([val, label]) => (
                      <button key={val} type="button" onClick={() => toggleSport(val)}
                        style={{
                          padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid',
                          background: form.sports.includes(val) ? '#1E3A5F' : '#0F172A',
                          borderColor: form.sports.includes(val) ? '#2563EB' : '#334155',
                          color: form.sports.includes(val) ? '#60A5FA' : '#64748B',
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Business hours */}
              <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 24 }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 20px' }}>營業設定</p>

                {/* Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '14px 16px', background: '#0F172A', borderRadius: 12, border: '1px solid #334155' }}>
                  <div>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>目前狀態</p>
                    <p style={{ color: form.is_open ? '#22C55E' : '#64748B', fontSize: 12, margin: '2px 0 0' }}>
                      {form.is_open ? '● 營業中' : '● 休息中'}
                    </p>
                  </div>
                  <button onClick={() => setForm(p => ({ ...p, is_open: !p.is_open }))}
                    style={{
                      width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                      background: form.is_open ? '#22C55E' : '#334155',
                      position: 'relative', transition: 'background 0.2s',
                    }}>
                    <span style={{
                      position: 'absolute', top: 3, width: 22, height: 22, borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                      left: form.is_open ? 27 : 3,
                    }} />
                  </button>
                </div>

                {/* Time range */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lStyle}>開始時間</label>
                    <input type="time" style={iStyle} value={form.open_time}
                      onChange={e => setForm(p => ({ ...p, open_time: e.target.value }))} />
                  </div>
                  <div>
                    <label style={lStyle}>結束時間</label>
                    <input type="time" style={iStyle} value={form.close_time}
                      onChange={e => setForm(p => ({ ...p, close_time: e.target.value }))} />
                  </div>
                </div>

                <div style={{ marginTop: 16, padding: '12px 14px', background: '#0F172A', borderRadius: 10, border: '1px solid #334155' }}>
                  <p style={{ color: '#94A3B8', fontSize: 12, margin: 0 }}>
                    ⏰ 營業時間：{form.open_time} — {form.close_time}
                  </p>
                </div>
              </div>

              {/* Time slots card */}
              <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 24, marginTop: 20 }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 16px' }}>可預約時段</p>
                <p style={{ color: '#64748B', fontSize: 12, margin: '0 0 12px' }}>設定開放給使用者預約的時段</p>
                <TimeSlotManager
                  slots={form.time_slots}
                  onChange={slots => setForm(p => ({ ...p, time_slots: slots }))}
                />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              style={{
                marginTop: 20, padding: '12px 32px', borderRadius: 12, fontSize: 14,
                fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                background: saving ? '#1E293B' : '#2563EB', color: '#fff',
              }}>
              {saving ? '儲存中...' : '💾 儲存設定'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
