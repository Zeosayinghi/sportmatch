import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { EmptyState } from '../components/ui/Badges.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { SPORT_ICONS, SPORT_LABELS, LEVEL_CONFIG } from '../utils/constants.js'

function UserCard({ user, onAddFriend, isFriend, hasSent, onMessage }) {
  const levelCfg = LEVEL_CONFIG[user.level] || LEVEL_CONFIG.beginner
  const sportLabel = `${SPORT_ICONS[user.sport] || '🏟️'} ${SPORT_LABELS[user.sport] || user.sport}`

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="card-lift rounded-2xl overflow-hidden"
      style={{ background: '#1E293B', border: '1px solid #334155' }}>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1E3A5F, #1E293B)' }}>
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white">{user.displayName}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${levelCfg.bg} ${levelCfg.text}`}>
                {levelCfg.label}
              </span>
              {isFriend && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-900 text-green-300">✓ 球友</span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              {user.district ? `📍 ${user.district} · ` : ''}{sportLabel}
            </p>
          </div>
        </div>
        {user.bio && <p className="text-sm text-slate-400 mb-4 leading-relaxed">{user.bio}</p>}
        {user.slots && user.slots.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-4">
            {user.slots.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-xl text-xs font-medium"
                style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}>{s}</span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          {isFriend ? (
            <button onClick={() => onMessage(user)} className="flex-1 h-10 rounded-xl text-xs font-bold"
              style={{ background: '#2563EB', color: '#fff', cursor: 'pointer', border: 'none' }}>
              💬 傳訊息
            </button>
          ) : hasSent ? (
            <button disabled className="flex-1 h-10 rounded-xl text-xs font-bold"
              style={{ background: '#1E3A5F', color: '#60A5FA', cursor: 'default', border: 'none' }}>
              ⏳ 已送出邀請
            </button>
          ) : (
            <button onClick={() => onAddFriend(user)} className="flex-1 h-10 rounded-xl text-xs font-bold"
              style={{ background: '#0F172A', color: '#60A5FA', cursor: 'pointer', border: '1px solid #334155' }}>
              ➕ 加球友
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function MatchPage({ showToast, setActivePage, setOpenChatFriendId }) {
  const { getOtherUsers, isFriend, hasSentRequest, sendFriendRequest } = useAuth()
  const [allUsers, setAllUsers] = useState([])
  const [friendIds, setFriendIds] = useState(new Set())
  const [sentIds, setSentIds] = useState(new Set())
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [sportFilter, setSportFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')

  useEffect(() => {
    async function load() {
      setLoadingUsers(true)
      const users = await getOtherUsers()
      setAllUsers(users)
      // Load friend/sent status for each user
      const fIds = new Set()
      const sIds = new Set()
      await Promise.all(users.map(async u => {
        if (await isFriend(u.id)) fIds.add(u.id)
        if (await hasSentRequest(u.id)) sIds.add(u.id)
      }))
      setFriendIds(fIds)
      setSentIds(sIds)
      setLoadingUsers(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => allUsers.filter(u => {
    if (sportFilter !== 'all' && u.sport !== sportFilter) return false
    if (levelFilter !== 'all' && u.level !== levelFilter) return false
    return true
  }), [allUsers, sportFilter, levelFilter])

  async function handleAddFriend(user) {
    await sendFriendRequest(user.id)
    setSentIds(prev => new Set([...prev, user.id]))
    showToast(`🤝 已送出球友邀請給 ${user.displayName}！`)
  }

  function handleMessage(user) {
    setOpenChatFriendId(user.id)
    setActivePage('messages')
  }

  const selStyle = { background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }

  return (
    <div className="page-enter">
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold text-white">球友媒合</h1>
        <p className="text-slate-500 text-sm mt-1">
          {loadingUsers ? '載入中...' : allUsers.length === 0 ? '目前還沒有其他使用者' : `找到 ${filtered.length} 位球友`}
        </p>
      </div>

      {allUsers.length > 0 && (
        <div className="rounded-2xl p-4 mb-5 flex flex-wrap gap-2"
          style={{ background: '#1E293B', border: '1px solid #334155' }}>
          <select value={sportFilter} onChange={e => setSportFilter(e.target.value)}
            className="h-10 px-3 rounded-xl text-sm" style={selStyle}>
            <option value="all">所有運動</option>
            <option value="basketball">🏀 籃球</option>
            <option value="badminton">🏸 羽球</option>
            <option value="tennis">🎾 網球</option>
            <option value="volleyball">🏐 排球</option>
            <option value="football">⚽ 足球</option>
            <option value="tabletennis">🏓 桌球</option>
          </select>
          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
            className="h-10 px-3 rounded-xl text-sm" style={selStyle}>
            <option value="all">所有程度</option>
            <option value="beginner">新手</option>
            <option value="intermediate">中階</option>
            <option value="advanced">高階</option>
            <option value="pro">職業</option>
          </select>
        </div>
      )}

      {loadingUsers ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : allUsers.length === 0 ? (
        <EmptyState icon="👥" title="目前還沒有其他使用者" subtitle="邀請朋友加入 SportMatch！" />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="找不到符合條件的球友" subtitle="請調整篩選條件" />
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filtered.map(user => (
            <UserCard key={user.id} user={user}
              isFriend={friendIds.has(user.id)}
              hasSent={sentIds.has(user.id)}
              onAddFriend={handleAddFriend}
              onMessage={handleMessage} />
          ))}
        </div>
      )}
    </div>
  )
}
