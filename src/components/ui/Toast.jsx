import { useEffect } from 'react'

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2800)
    return () => clearTimeout(timer)
  }, [onClose])

  const configs = {
    success: { icon: '✅', bg: 'bg-green-500' },
    error:   { icon: '❌', bg: 'bg-red-500' },
    info:    { icon: 'ℹ️', bg: 'bg-blue-500' },
    warning: { icon: '⚠️', bg: 'bg-yellow-500' },
  }
  const cfg = configs[toast.type] || configs.success

  return (
    <div
      className={`toast-anim pointer-events-auto ${cfg.bg} text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 min-w-72 max-w-sm`}
    >
      <span className="text-lg flex-shrink-0">{cfg.icon}</span>
      <span className="text-sm font-semibold flex-1">{toast.message}</span>
      <button onClick={onClose} className="text-white/70 hover:text-white text-lg leading-none flex-shrink-0">✕</button>
    </div>
  )
}
