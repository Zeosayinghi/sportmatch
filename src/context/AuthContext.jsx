import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

const AVATARS = ['🏀','🏸','🎾','🏐','⚽','⚾','🏓']

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sportmatch_session')
    if (saved) {
      try { setCurrentUser(JSON.parse(saved)) } catch {}
    }
    setLoading(false)
  }, [])

  function saveSession(user) {
    if (user) localStorage.setItem('sportmatch_session', JSON.stringify(user))
    else localStorage.removeItem('sportmatch_session')
    setCurrentUser(user)
  }

  // ── Auth ────────────────────────────────────────────────────────────────

  async function register({ username, password, displayName, sport, level, district, bio, slots }) {
    // Check if username taken
    const { data: existing } = await supabase
      .from('users').select('id').eq('id', username).single()
    if (existing) return { error: '此用戶名稱已被使用' }

    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]
    const { error } = await supabase.from('users').insert({
      id: username,
      username,
      password,
      display_name: displayName,
      avatar,
      sport,
      level,
      district: district || '',
      bio: bio || '',
      slots: slots || [],
    })
    if (error) return { error: error.message }

    const user = { id: username, username, displayName, display_name: displayName, avatar, sport, level, district, bio, slots }
    saveSession(user)
    return { success: true, user }
  }

  async function login(username, password) {
    const { data: user, error } = await supabase
      .from('users').select('*').eq('id', username).single()
    if (error || !user) return { error: '找不到此帳號' }
    if (user.password !== password) return { error: '密碼錯誤' }
    const normalized = { ...user, displayName: user.display_name }
    saveSession(normalized)
    return { success: true, user: normalized }
  }

  function logout() {
    saveSession(null)
  }

  async function updateProfile(updates) {
    if (!currentUser) return
    const dbUpdates = {}
    if (updates.displayName) dbUpdates.display_name = updates.displayName
    if (updates.sport)       dbUpdates.sport = updates.sport
    if (updates.level)       dbUpdates.level = updates.level
    if (updates.district !== undefined) dbUpdates.district = updates.district
    if (updates.bio !== undefined)      dbUpdates.bio = updates.bio
    if (updates.slots)       dbUpdates.slots = updates.slots

    await supabase.from('users').update(dbUpdates).eq('id', currentUser.id)
    const updated = { ...currentUser, ...updates, ...dbUpdates }
    saveSession(updated)
  }

  // ── Users ───────────────────────────────────────────────────────────────

  async function getOtherUsers() {
    if (!currentUser) return []
    const { data } = await supabase
      .from('users').select('*').neq('id', currentUser.id)
    return (data || []).map(u => ({ ...u, displayName: u.display_name }))
  }

  // ── Friends ─────────────────────────────────────────────────────────────

  async function myFriends() {
    if (!currentUser) return []
    const { data } = await supabase
      .from('friends').select('friend_id').eq('user_id', currentUser.id)
    if (!data || data.length === 0) return []
    const ids = data.map(r => r.friend_id)
    const { data: users } = await supabase.from('users').select('*').in('id', ids)
    return (users || []).map(u => ({ ...u, displayName: u.display_name }))
  }

  async function myFriendIds() {
    if (!currentUser) return new Set()
    const { data } = await supabase
      .from('friends').select('friend_id').eq('user_id', currentUser.id)
    return new Set((data || []).map(r => r.friend_id))
  }

  async function isFriend(userId) {
    if (!currentUser) return false
    const { data } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('friend_id', userId)
      .single()
    return !!data
  }

  async function myPendingRequests() {
    if (!currentUser) return []
    const { data } = await supabase
      .from('friend_requests').select('from_id').eq('to_id', currentUser.id)
    if (!data || data.length === 0) return []
    const ids = data.map(r => r.from_id)
    const { data: users } = await supabase.from('users').select('*').in('id', ids)
    return (users || []).map(u => ({ ...u, displayName: u.display_name }))
  }

  async function sendFriendRequest(toId) {
    if (!currentUser || toId === currentUser.id) return
    await supabase.from('friend_requests').upsert({
      from_id: currentUser.id,
      to_id: toId,
    }, { onConflict: 'from_id,to_id', ignoreDuplicates: true })
  }

  async function hasSentRequest(toId) {
    if (!currentUser) return false
    const { data } = await supabase
      .from('friend_requests')
      .select('id')
      .eq('from_id', currentUser.id)
      .eq('to_id', toId)
      .single()
    return !!data
  }

  async function acceptFriendRequest(fromId) {
    if (!currentUser) return
    // Add both directions
    await supabase.from('friends').upsert([
      { user_id: currentUser.id, friend_id: fromId },
      { user_id: fromId, friend_id: currentUser.id },
    ], { onConflict: 'user_id,friend_id', ignoreDuplicates: true })
    // Remove request
    await supabase.from('friend_requests')
      .delete()
      .eq('from_id', fromId)
      .eq('to_id', currentUser.id)
  }

  async function declineFriendRequest(fromId) {
    if (!currentUser) return
    await supabase.from('friend_requests')
      .delete()
      .eq('from_id', fromId)
      .eq('to_id', currentUser.id)
  }

  async function removeFriend(friendId) {
    if (!currentUser) return
    await supabase.from('friends')
      .delete()
      .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUser.id})`)
  }

  // ── Messages ─────────────────────────────────────────────────────────────

  async function getMessages(withUserId) {
    if (!currentUser) return []
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_id.eq.${currentUser.id},to_id.eq.${withUserId}),and(from_id.eq.${withUserId},to_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true })
    return (data || []).map(m => ({
      id: m.id,
      from: m.from_id,
      text: m.text,
      time: new Date(m.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(m.created_at).getTime(),
    }))
  }

  async function sendMessage(toId, text) {
    if (!currentUser) return
    const { data } = await supabase.from('messages').insert({
      from_id: currentUser.id,
      to_id: toId,
      text,
    }).select().single()
    return data
  }

  async function getConversations() {
    if (!currentUser) return []
    const friends = await myFriends()
    const convs = await Promise.all(friends.map(async friend => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(from_id.eq.${currentUser.id},to_id.eq.${friend.id}),and(from_id.eq.${friend.id},to_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: false })
        .limit(1)
      const last = data?.[0]
      return {
        id: friend.id,
        friend,
        lastMsg: last?.text || '',
        lastTime: last ? new Date(last.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '',
        lastTimestamp: last ? new Date(last.created_at).getTime() : 0,
      }
    }))
    return convs.sort((a, b) => b.lastTimestamp - a.lastTimestamp)
  }


  // ── Location ─────────────────────────────────────────────────────────────

  async function updateLocation(lat, lng) {
    if (!currentUser) return
    await supabase.from('users').update({
      lat, lng,
      last_seen: new Date().toISOString(),
    }).eq('id', currentUser.id)
  }

  async function getNearbyUsers() {
    if (!currentUser) return []
    const { data } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUser.id)
    return (data || []).map(u => ({ ...u, displayName: u.display_name }))
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#94A3B8', fontSize: 16 }}>載入中...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      register, login, logout, updateProfile,
      getOtherUsers,
      myFriends, myFriendIds, isFriend, myPendingRequests,
      sendFriendRequest, hasSentRequest, acceptFriendRequest, declineFriendRequest, removeFriend,
      getMessages, sendMessage, getConversations,
      updateLocation, getNearbyUsers,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
