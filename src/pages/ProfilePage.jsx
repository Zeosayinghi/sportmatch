import { useState, useEffect } from 'react'
import { Toggle } from '../components/ui/Badges.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { SPORT_ICONS, SPORT_LABELS, LEVEL_CONFIG } from '../utils/constants.js'

const TIME_SLOTS = ['平日早上','平日下午','平日晚上','週末早上','週末下午','週末晚上']

export default function ProfilePage({ showToast }) {
  const { currentUser, updateProfile, logout, myFriends, removeFriend } = useAuth()
  const [friends, setFriends] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    displayName: currentUser?.displayName || currentUser?.display_name || '',
    sport: currentUser?.sport || 'basketball',
    level: currentUser?.level || 'intermediate',
    district: currentUser?.district || '',
    bio: currentUser?.bio || '',
    slots: currentUser?.slots || [],
  })

  useEffect(() => {
    myFriends().then(setFriends)
  }, [])

  function toggleSlot(slot) {
    setForm(prev => ({
      ...prev,
      slots: prev.slots.includes(slot) ? prev.slots.filter(s => s !== slot) : [...prev.slots, slot],
    }))
  }

  async function handleSave() {
    await updateProfile(form)
    setEditing(false)
    showToast('✅ 個人資料已更新')
  }

  async function handleRemoveFriend(friend) {
    await removeFriend(friend.id)
    setFriends(prev => prev.filter(f => f.id !== friend.id))
    showToast(`已移除 ${friend.displayName}`)
  }

  const selStyle = {
    background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC',
    borderRadius: 12, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%',
  }
  const inputStyle = { ...selStyle }
  const labelStyle = { fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }

  const displayName = currentUser?.displayName || currentUser?.display_name || ''
  const levelCfg = LEVEL_CONFIG[currentUser?.level] || LEVEL_CONFIG.beginner
  const sportLabel = currentUser ? `${SPORT_ICONS[currentUser.sport] || '🏟️'} ${SPORT_LABELS[currentUser.sport] || currentUser.sport}` : ''

  return (
    <div className="page-enter max-w-4xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-white">我的頁面</h1>
          <p className="text-slate-500 text-sm mt-1">管理個人資料與球友</p>
        </div>
        <button onClick={logout}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: '#0F172A', color: '#EF4444', border: '1px solid #334155', cursor: 'pointer' }}>
          登出
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Profile card */}
        <div className="rounded-2xl p-6" style={{ background: '#1E293B', border: '1px solid #334155' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1E3A5F, #2563EB)' }}>
              {currentUser?.avatar}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">{displayName}</h2>
              <p className="text-slate-400 text-sm mt-1">@{currentUser?.id}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${levelCfg.bg} ${levelCfg.text}`}>
                  {levelCfg.label}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">
                  {sportLabel}
                </span>
              </div>
            </div>
          </div>

          {!editing ? (
            <>
              <div className="space-y-3 mb-5">
                {currentUser?.district && (
                  <div className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: '#334155' }}>
                    <span className="text-slate-400 text-sm">📍 地區</span>
                    <span className="text-white text-sm font-medium">{currentUser.district}</span>
                  </div>
                )}
                {currentUser?.bio && (
                  <div className="py-2.5 border-b" style={{ borderColor: '#334155' }}>
                    <p className="text-slate-400 text-xs mb-1">個人簡介</p>
                    <p className="text-white text-sm leading-relaxed">{currentUser.bio}</p>
                  </div>
                )}
                {currentUser?.slots?.length > 0 && (
                  <div className="py-2.5">
                    <p className="text-slate-400 text-xs mb-2">可配合時段</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentUser.slots.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-xl text-xs font-medium"
                          style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setEditing(true)}
                className="w-full h-10 rounded-xl text-sm font-bold"
                style={{ background: '#0F172A', color: '#60A5FA', border: '1px solid #334155', cursor: 'pointer' }}>
                ✏️ 編輯個人資料
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label style={labelStyle}>顯示名稱</label>
                <input style={inputStyle} value={form.displayName}
                  onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>主要運動</label>
                  <select style={selStyle} value={form.sport}
                    onChange={e => setForm(p => ({ ...p, sport: e.target.value }))}>
                    <option value="basketball">🏀 籃球</option>
                    <option value="badminton">🏸 羽球</option>
                    <option value="tennis">🎾 網球</option>
                    <option value="volleyball">🏐 排球</option>
                    <option value="football">⚽ 足球</option>
                    <option value="tabletennis">🏓 桌球</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>程度</label>
                  <select style={selStyle} value={form.level}
                    onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                    <option value="beginner">新手</option>
                    <option value="intermediate">中階</option>
                    <option value="advanced">高階</option>
                    <option value="pro">職業</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>地區</label>
                <input style={inputStyle} value={form.district}
                  onChange={e => setForm(p => ({ ...p, district: e.target.value }))} placeholder="例：台北市大安區" />
              </div>
              <div>
                <label style={labelStyle}>個人簡介</label>
                <textarea style={{ ...inputStyle, resize: 'none', height: 72 }} value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>可配合時段</label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid',
                        background: form.slots.includes(slot) ? '#1E3A5F' : '#0F172A',
                        borderColor: form.slots.includes(slot) ? '#2563EB' : '#334155',
                        color: form.slots.includes(slot) ? '#60A5FA' : '#64748B',
                      }}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(false)}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 12, background: '#0F172A', color: '#94A3B8', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: '1px solid #334155' }}>
                  取消
                </button>
                <button onClick={handleSave}
                  style={{ flex: 2, padding: '10px 0', borderRadius: 12, background: '#2563EB', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none' }}>
                  儲存
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Friends list */}
        <div className="rounded-2xl p-6" style={{ background: '#1E293B', border: '1px solid #334155' }}>
          <h3 className="text-lg font-bold text-white mb-4">我的球友 ({friends.length})</h3>
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <span className="text-4xl mb-3">🤝</span>
              <p className="text-sm">還沒有球友</p>
              <p className="text-xs mt-1 text-slate-600">到球友媒合頁面尋找球友</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map(friend => (
                <div key={friend.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: '#0F172A', border: '1px solid #334155' }}>
                  <span className="text-xl">{friend.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{friend.displayName}</p>
                    <p className="text-slate-500 text-xs">
                      {SPORT_ICONS[friend.sport]} {SPORT_LABELS[friend.sport]} · {LEVEL_CONFIG[friend.level]?.label}
                    </p>
                  </div>
                  <button onClick={() => handleRemoveFriend(friend)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 16, padding: '4px 8px' }}
                    title="移除球友">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
