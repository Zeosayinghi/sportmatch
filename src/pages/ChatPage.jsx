import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { EmptyState } from '../components/ui/Badges.jsx'

export default function ChatPage({ openChatFriendId, setOpenChatFriendId }) {
  const {
    currentUser, myFriends, myPendingRequests,
    acceptFriendRequest, declineFriendRequest,
    getMessages, sendMessage, getConversations,
  } = useAuth()

  const [friends, setFriends]           = useState([])
  const [pending, setPending]           = useState([])
  const [conversations, setConversations] = useState([])
  const [activeFriendId, setActiveFriendId] = useState(null)
  const [activeMessages, setActiveMessages] = useState([])
  const [loadingPage, setLoadingPage]   = useState(true)
  // Mobile: 'list' | 'chat'
  const [mobileView, setMobileView]     = useState('list')

  async function reload() {
    const [f, p, c] = await Promise.all([myFriends(), myPendingRequests(), getConversations()])
    setFriends(f); setPending(p); setConversations(c)
    setLoadingPage(false)
  }

  useEffect(() => { reload() }, [])

  useEffect(() => {
    if (openChatFriendId) {
      setActiveFriendId(openChatFriendId)
      setMobileView('chat')
      setOpenChatFriendId(null)
    } else if (!activeFriendId && conversations.length > 0) {
      setActiveFriendId(conversations[0].id)
    }
  }, [openChatFriendId, conversations.length])

  useEffect(() => {
    if (!activeFriendId) return
    async function loadMsgs() {
      const msgs = await getMessages(activeFriendId)
      setActiveMessages(msgs)
    }
    loadMsgs()
    const interval = setInterval(loadMsgs, 3000)
    return () => clearInterval(interval)
  }, [activeFriendId])

  async function handleAccept(fromId) { await acceptFriendRequest(fromId); reload() }
  async function handleDecline(fromId) { await declineFriendRequest(fromId); reload() }
  async function handleSend(text) {
    await sendMessage(activeFriendId, text)
    const msgs = await getMessages(activeFriendId)
    setActiveMessages(msgs)
    reload()
  }

  function selectFriend(friendId) {
    setActiveFriendId(friendId)
    setMobileView('chat')
  }

  const activeFriend = friends.find(f => f.id === activeFriendId)

  if (loadingPage) return (
    <div className="page-enter flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  // ── Friend list panel (shared between mobile list view & desktop sidebar) ──
  const FriendList = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b flex-shrink-0" style={{ borderColor: '#334155' }}>
        <p className="font-bold text-white text-sm">球友對話</p>
      </div>
      <div className="overflow-y-auto flex-1">
        {friends.map(friend => {
          const conv = conversations.find(c => c.id === friend.id)
          const isActive = activeFriendId === friend.id
          return (
            <button key={friend.id} onClick={() => selectFriend(friend.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b text-left transition-all"
              style={{ borderColor: '#1E293B', background: isActive ? '#1E3A5F' : 'transparent' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#1E293B' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: '#0F172A' }}>
                {friend.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white text-sm">{friend.displayName}</span>
                  {conv?.lastTime && <span className="text-xs text-slate-500">{conv.lastTime}</span>}
                </div>
                {conv?.lastMsg
                  ? <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMsg}</p>
                  : <p className="text-xs text-slate-600 mt-0.5 italic">開始對話吧</p>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="page-enter flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>

      {/* Header — only show on desktop or mobile list view */}
      <div className={`mb-4 flex items-center gap-3 flex-wrap ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        <h1 className="text-3xl font-extrabold text-white">訊息中心</h1>
        {pending.length > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
            {pending.length} 個球友邀請
          </span>
        )}
      </div>

      {/* Pending requests — only show on desktop or mobile list view */}
      {pending.length > 0 && mobileView !== 'chat' && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: '#1E293B', border: '1px solid #334155' }}>
          <p className="text-sm font-semibold text-slate-300 mb-3">🤝 球友邀請</p>
          <div className="flex flex-col gap-2">
            {pending.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: '#0F172A', border: '1px solid #334155' }}>
                <span className="text-xl">{user.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold">{user.displayName}</p>
                  <p className="text-slate-500 text-xs">{user.district || ''}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(user.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: '#16A34A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    接受
                  </button>
                  <button onClick={() => handleDecline(user.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: '#334155', color: '#94A3B8', border: 'none', cursor: 'pointer' }}>
                    拒絕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {friends.length === 0 ? (
        <EmptyState icon="💬" title="還沒有球友" subtitle="到球友媒合頁面找球友，加為好友後才能聊天" />
      ) : (
        <>
          {/* ── DESKTOP layout: side-by-side ── */}
          <div className="hidden md:flex flex-1 rounded-2xl overflow-hidden min-h-0"
            style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid #1E293B' }}>
              <FriendList />
            </div>
            {activeFriend ? (
              <ChatWindow friend={activeFriend} messages={activeMessages}
                currentUserId={currentUser.id} onSend={handleSend} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <span className="text-5xl mb-3">💬</span>
                <p className="font-semibold text-slate-400">選擇一位球友開始聊天</p>
              </div>
            )}
          </div>

          {/* ── MOBILE layout: switch between list and chat ── */}
          <div className="flex md:hidden flex-1 min-h-0 overflow-hidden rounded-2xl"
            style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <AnimatePresence mode="wait" initial={false}>
              {mobileView === 'list' ? (
                <motion.div key="list" className="w-full h-full"
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <FriendList />
                </motion.div>
              ) : (
                <motion.div key="chat" className="w-full h-full flex flex-col"
                  initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {activeFriend ? (
                    <ChatWindow
                      friend={activeFriend}
                      messages={activeMessages}
                      currentUserId={currentUser.id}
                      onSend={handleSend}
                      onBack={() => setMobileView('list')}
                    />
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}

function ChatWindow({ friend, messages, currentUserId, onSend, onBack }) {
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-3 flex-shrink-0"
        style={{ borderColor: '#1E293B' }}>
        {/* Back button — mobile only */}
        {onBack && (
          <button onClick={onBack}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 md:hidden"
            style={{ background: '#0F172A', border: '1px solid #334155', cursor: 'pointer', color: '#94A3B8', fontSize: 16 }}>
            ←
          </button>
        )}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: '#0F172A' }}>
          {friend.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm">{friend.displayName}</p>
          {friend.district && <p className="text-xs text-slate-500 truncate">{friend.district}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ background: '#0A1628' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 pt-12">
            <span className="text-4xl mb-2">{friend.avatar}</span>
            <p className="text-sm">跟 {friend.displayName} 說聲嗨吧！</p>
          </div>
        )}
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.from === currentUserId ? 'justify-end' : 'justify-start'}`}>
            {msg.from !== currentUserId && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm mr-2 flex-shrink-0 self-end"
                style={{ background: '#1E293B' }}>
                {friend.avatar}
              </div>
            )}
            <div className="max-w-[72%]">
              <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.from === currentUserId ? 'rounded-br-sm text-white' : 'rounded-bl-sm text-slate-200'
              }`} style={{
                background: msg.from === currentUserId ? '#2563EB' : '#1E293B',
                border: msg.from !== currentUserId ? '1px solid #334155' : 'none',
              }}>
                {msg.text}
              </div>
              <p className={`text-xs text-slate-600 mt-1 ${msg.from === currentUserId ? 'text-right' : 'text-left'}`}>
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t flex gap-2 items-center flex-shrink-0"
        style={{ borderColor: '#1E293B', background: '#111827' }}>
        <input
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="輸入訊息…"
          className="flex-1 h-10 px-4 rounded-xl text-sm focus:outline-none"
          style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', minWidth: 0 }}
        />
        <button onClick={send} disabled={!input.trim()}
          className="h-10 px-4 rounded-xl font-bold text-sm flex-shrink-0"
          style={{
            background: input.trim() ? '#2563EB' : '#1E293B',
            color: input.trim() ? '#fff' : '#475569',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            border: 'none',
          }}>
          送出
        </button>
      </div>
    </div>
  )
}
