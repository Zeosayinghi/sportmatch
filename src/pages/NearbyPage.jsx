import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { EmptyState } from '../components/ui/Badges.jsx'
import { SPORT_ICONS, SPORT_LABELS, LEVEL_CONFIG } from '../utils/constants.js'

// Haversine formula - returns km
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

function formatLastSeen(isoStr) {
  if (!isoStr) return ''
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000 / 60 // minutes
  if (diff < 2)  return '剛剛在線'
  if (diff < 60) return `${Math.round(diff)} 分鐘前`
  if (diff < 1440) return `${Math.round(diff / 60)} 小時前`
  return `${Math.round(diff / 1440)} 天前`
}

function isOnline(isoStr) {
  if (!isoStr) return false
  return (Date.now() - new Date(isoStr).getTime()) < 10 * 60 * 1000 // 10 min
}

function NearbyCard({ user, dist, onInvite, isFriend, onAddFriend, hasSent }) {
  const levelCfg = LEVEL_CONFIG[user.level] || LEVEL_CONFIG.beginner
  const online = isOnline(user.last_seen)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#1E293B', border: '1px solid #334155' }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #1E3A5F, #1E293B)' }}>
              {user.avatar}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
              style={{
                background: online ? '#22C55E' : '#475569',
                borderColor: '#1E293B',
              }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm">{user.displayName}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${levelCfg.bg} ${levelCfg.text}`}>
                {levelCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-slate-500">
                {SPORT_ICONS[user.sport]} {SPORT_LABELS[user.sport] || user.sport}
              </span>
              {dist != null && (
                <span className="text-xs font-semibold" style={{ color: '#60A5FA' }}>
                  📍 約 {formatDist(dist)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs" style={{ color: online ? '#22C55E' : '#475569' }}>
              {online ? '● 在線中' : formatLastSeen(user.last_seen)}
            </p>
          </div>
        </div>

        {user.bio && (
          <p className="text-xs text-slate-500 mb-3 leading-relaxed line-clamp-2">{user.bio}</p>
        )}

        <div className="flex gap-2">
          {isFriend ? (
            <button onClick={() => onInvite(user)}
              className="flex-1 h-9 rounded-xl text-xs font-bold transition-all"
              style={{ background: '#2563EB', color: '#fff', border: 'none', cursor: 'pointer' }}>
              🏀 邀約打球
            </button>
          ) : hasSent ? (
            <button disabled className="flex-1 h-9 rounded-xl text-xs font-bold"
              style={{ background: '#1E3A5F', color: '#60A5FA', border: 'none', cursor: 'default' }}>
              ⏳ 已送出邀請
            </button>
          ) : (
            <>
              <button onClick={() => onAddFriend(user)}
                className="flex-1 h-9 rounded-xl text-xs font-bold"
                style={{ background: '#0F172A', color: '#60A5FA', border: '1px solid #334155', cursor: 'pointer' }}>
                ➕ 加球友
              </button>
              <button onClick={() => onInvite(user)}
                className="flex-1 h-9 rounded-xl text-xs font-bold"
                style={{ background: '#2563EB', color: '#fff', border: 'none', cursor: 'pointer' }}>
                🏀 邀約打球
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function NearbyPage({ showToast, setActivePage, setOpenChatFriendId }) {
  const { currentUser, updateLocation, getNearbyUsers, isFriend, hasSentRequest, sendFriendRequest } = useAuth()

  const [myPos, setMyPos]         = useState(null)
  const [locError, setLocError]   = useState(null)
  const [locLoading, setLocLoading] = useState(false)
  const [nearbyUsers, setNearbyUsers] = useState([])
  const [friendStatus, setFriendStatus] = useState({}) // { userId: 'friend' | 'sent' | 'none' }
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [filterOnline, setFilterOnline] = useState(false)
  const [radiusKm, setRadiusKm] = useState(10)
  const intervalRef = useRef(null)

  // Request location on mount
  useEffect(() => {
    requestLocation()
    return () => clearInterval(intervalRef.current)
  }, [])

  // Reload nearby users when position changes
  useEffect(() => {
    if (myPos) loadNearby()
  }, [myPos, radiusKm])

  // Poll every 30s to refresh online status
  useEffect(() => {
    if (!myPos) return
    intervalRef.current = setInterval(() => {
      updateLocation(myPos.lat, myPos.lng)
      loadNearby()
    }, 30000)
    return () => clearInterval(intervalRef.current)
  }, [myPos])

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocError('您的瀏覽器不支援定位功能')
      return
    }
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setMyPos({ lat, lng })
        setLocLoading(false)
        await updateLocation(lat, lng)
      },
      (err) => {
        setLocLoading(false)
        if (err.code === 1) setLocError('已拒絕定位授權，請在瀏覽器設定中開啟')
        else setLocError('無法取得您的位置，請確認定位已開啟')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }

  async function loadNearby() {
    if (!myPos) return
    setLoadingUsers(true)
    const users = await getNearbyUsers()
    // Compute distance for each user that has location
    const withDist = users
      .map(u => ({
        ...u,
        dist: (u.lat && u.lng) ? calcDistance(myPos.lat, myPos.lng, u.lat, u.lng) : null,
      }))
      .filter(u => u.dist == null || u.dist <= radiusKm)
      .sort((a, b) => {
        if (a.dist == null && b.dist == null) return 0
        if (a.dist == null) return 1
        if (b.dist == null) return -1
        return a.dist - b.dist
      })

    setNearbyUsers(withDist)

    // Load friend/sent status
    const statuses = {}
    await Promise.all(withDist.map(async u => {
      if (await isFriend(u.id)) statuses[u.id] = 'friend'
      else if (await hasSentRequest(u.id)) statuses[u.id] = 'sent'
      else statuses[u.id] = 'none'
    }))
    setFriendStatus(statuses)
    setLoadingUsers(false)
  }

  function handleInvite(user) {
    setOpenChatFriendId(user.id)
    setActivePage('messages')
    showToast(`📨 已開啟與 ${user.displayName} 的對話，快去邀約打球！`)
  }

  async function handleAddFriend(user) {
    await sendFriendRequest(user.id)
    setFriendStatus(prev => ({ ...prev, [user.id]: 'sent' }))
    showToast(`🤝 已送出球友邀請給 ${user.displayName}！`)
  }

  const displayed = filterOnline
    ? nearbyUsers.filter(u => isOnline(u.last_seen))
    : nearbyUsers

  const onlineCount = nearbyUsers.filter(u => isOnline(u.last_seen)).length

  return (
    <div className="page-enter">
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold text-white">附近球友</h1>
        <p className="text-slate-500 text-sm mt-1">
          {myPos ? `顯示 ${radiusKm} km 內的球友` : '需要開啟定位才能使用此功能'}
        </p>
      </div>

      {/* Location status card */}
      <div className="rounded-2xl p-4 mb-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
        {locLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
            <span className="text-slate-400 text-sm">正在取得您的位置...</span>
          </div>
        ) : locError ? (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="text-red-400 text-sm">{locError}</span>
            </div>
            <button onClick={requestLocation}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#2563EB', color: '#fff', border: 'none', cursor: 'pointer' }}>
              重新授權
            </button>
          </div>
        ) : myPos ? (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="text-green-400 text-sm font-semibold">定位已開啟</span>
              <span className="text-slate-500 text-xs">· 你的位置已分享給附近球友（僅顯示距離，不顯示具體位置）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">範圍</span>
              {[3, 5, 10, 20].map(km => (
                <button key={km} onClick={() => setRadiusKm(km)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    background: radiusKm === km ? '#2563EB' : '#0F172A',
                    color: radiusKm === km ? '#fff' : '#64748B',
                    border: '1px solid #334155', cursor: 'pointer',
                  }}>
                  {km}km
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Filter bar */}
      {myPos && !locError && (
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <button onClick={() => setFilterOnline(false)}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: !filterOnline ? '#2563EB' : '#1E293B',
              color: !filterOnline ? '#fff' : '#64748B',
              border: '1px solid #334155', cursor: 'pointer',
            }}>
            全部 ({nearbyUsers.length})
          </button>
          <button onClick={() => setFilterOnline(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: filterOnline ? '#16A34A' : '#1E293B',
              color: filterOnline ? '#fff' : '#64748B',
              border: '1px solid #334155', cursor: 'pointer',
            }}>
            ● 在線中 ({onlineCount})
          </button>
          <button onClick={loadNearby}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155', cursor: 'pointer' }}>
            🔄 重新整理
          </button>
        </div>
      )}

      {/* Content */}
      {!myPos && !locLoading && !locError ? null :
        locLoading ? null :
        locError ? (
          <EmptyState icon="📍" title="需要定位授權" subtitle="請允許瀏覽器取得您的位置，才能顯示附近球友" />
        ) : loadingUsers ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState
            icon="🏙️"
            title={filterOnline ? '附近目前沒有在線球友' : `${radiusKm} km 內暫無球友`}
            subtitle="試試擴大搜尋範圍，或等待更多人加入 SportMatch"
          />
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {displayed.map(user => (
              <NearbyCard
                key={user.id}
                user={user}
                dist={user.dist}
                isFriend={friendStatus[user.id] === 'friend'}
                hasSent={friendStatus[user.id] === 'sent'}
                onInvite={handleInvite}
                onAddFriend={handleAddFriend}
              />
            ))}
          </div>
        )
      }

      {/* Privacy note */}
      {myPos && (
        <p className="text-xs text-slate-600 mt-6 text-center">
          🔒 隱私保護：只顯示相對距離，不顯示具體位置。你可以隨時關閉瀏覽器定位來停止分享。
        </p>
      )}
    </div>
  )
}
