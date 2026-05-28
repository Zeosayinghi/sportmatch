import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Sidebar from './components/ui/Sidebar.jsx'
import { ToastContainer } from './components/ui/Toast.jsx'
import { useToast } from './hooks/useToast.js'
import { useCourts } from './hooks/useCourts.js'
import MapPage     from './pages/MapPage.jsx'
import CourtsPage  from './pages/CourtsPage.jsx'
import MatchPage   from './pages/MatchPage.jsx'
import ChatPage    from './pages/ChatPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

function AppInner() {
  const { currentUser } = useAuth()
  const [activePage, setActivePage] = useState('map')
  const [openChatFriendId, setOpenChatFriendId] = useState(null)
  const [selectedMapCourt, setSelectedMapCourt] = useState(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const { toasts, showToast, removeToast } = useToast()
  const { courts, setCourts, loading, dataSource, userPos, locateUser, updateCourt } = useCourts()

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
  }

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!currentUser) return <AuthPage />

  function renderPage() {
    switch (activePage) {
      case 'map':
        return (
          <MapPage courts={courts} loading={loading} dataSource={dataSource}
            userPos={userPos} locateUser={locateUser} updateCourt={updateCourt}
            showToast={showToast} selectedMapCourt={selectedMapCourt} />
        )
      case 'courts':
        return (
          <CourtsPage courts={courts} loading={loading} updateCourt={updateCourt}
            showToast={showToast} setActivePage={setActivePage}
            setSelectedMapCourt={setSelectedMapCourt} />
        )
      case 'players':
        return (
          <MatchPage showToast={showToast} setActivePage={setActivePage}
            setOpenChatFriendId={setOpenChatFriendId} />
        )
      case 'messages':
        return (
          <ChatPage openChatFriendId={openChatFriendId}
            setOpenChatFriendId={setOpenChatFriendId} />
        )
      case 'profile':
        return <ProfilePage showToast={showToast} />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden" style={{ background: '#0F172A' }}>
      <div className='w-[260px] flex-shrink-0'>
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
      </div>
      <main className="flex-1 min-w-0 overflow-y-auto"
        style={{ paddingBottom: isDesktop ? 32 : 90 }}>
        <div className="w-full px-4 md:px-8 py-4 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
