import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV_ITEMS = [
  { id: 'map',      icon: '🗺️',  label: '地圖總覽' },
  { id: 'courts',   icon: '🏟️',  label: '附近球場' },
  { id: 'players',  icon: '👥',  label: '球友媒合' },
  { id: 'messages', icon: '💬',  label: '訊息中心' },
  { id: 'profile',  icon: '👤',  label: '我的頁面' },
]

export default function Sidebar({ activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false)
  const { currentUser, myPendingRequests } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    myPendingRequests().then(p => setPendingCount(p.length))
    const interval = setInterval(() => {
      myPendingRequests().then(p => setPendingCount(p.length))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const displayName = currentUser?.displayName || currentUser?.display_name || ''

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex sidebar-desktop top-0 h-screen flex-col z-40 transition-all duration-300"
        style={{ background: '#111827', borderRight: '1px solid #1E293B' }}>
        <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800">
          <span style={{ fontSize: 28, flexShrink: 0 }}>🏀</span>
          {!collapsed && (
            <div>
              <span className="text-white font-extrabold text-xl tracking-tight">SportMatch</span>
              <p className="text-slate-500 text-xs mt-0.5">動態運動資源調度平台</p>
            </div>
          )}
          <button onClick={() => setCollapsed(v => !v)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors text-sm">
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = activePage === item.id
            const badge = item.id === 'messages' && pendingCount > 0 ? pendingCount : 0
            return (
              <button key={item.id} onClick={() => setActivePage(item.id)}
                className="w-full flex items-center gap-3 rounded-xl mb-1 transition-all duration-200 relative group"
                style={{
                  height: 52,
                  paddingLeft: collapsed ? 0 : 16,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: active ? '#2563EB' : 'transparent',
                  color: active ? '#fff' : '#94A3B8',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#1E293B' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                {badge > 0 && (
                  <span className="absolute right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {badge}
                  </span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-lg flex-shrink-0">
              {currentUser?.avatar || '👤'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                <p className="text-slate-400 text-xs truncate">@{currentUser?.id || ''}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 md:hidden w-full"
        style={{ background: '#111827' }}>
        <div className="flex w-full item-stretch">
          {NAV_ITEMS.map(item => {
            const active = activePage === item.id
            const badge = item.id === 'messages' && pendingCount > 0 ? pendingCount : 0
            return (
              <button key={item.id} onClick={() => setActivePage(item.id)}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative transition-colors"
                style={{ color: active ? '#3B82F6' : '#64748B', minWidth: 0 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span className="text-xs font-medium text-center w-full">{item.label.slice(0, 2)}</span>
                {badge > 0 && (
                  <span className="absolute top-2 right-1/4 translate-x-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
