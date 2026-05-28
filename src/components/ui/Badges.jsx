import { STATUS_CONFIG, LEVEL_CONFIG, SPORT_ICONS, SPORT_LABELS } from '../../utils/constants.js'

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.free
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

export function LevelBadge({ level }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.beginner
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

export function SportTag({ sport }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-700 text-slate-300">
      {SPORT_ICONS[sport] || '🏟️'} {SPORT_LABELS[sport] || sport}
    </span>
  )
}

export function PowerBar({ value, max = 10 }) {
  const pct = (value / max) * 100
  const color = pct >= 80 ? '#F97316' : pct >= 60 ? '#A855F7' : pct >= 40 ? '#3B82F6' : '#22C55E'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full power-bar-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
      <span className="text-sm font-bold w-8 text-right" style={{ color }}>{value}</span>
    </div>
  )
}

export function StarRating({ value }) {
  return (
    <span className="flex items-center gap-1 text-sm font-semibold text-yellow-400">
      ⭐ {value}
    </span>
  )
}

export function OnlineDot({ online }) {
  return online ? (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
    </span>
  ) : (
    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-slate-600" />
  )
}

export function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative inline-flex items-center rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none"
      style={{ width: 52, height: 28, background: value ? '#3B82F6' : '#334155' }}
      role="switch"
      aria-checked={value}
    >
      <span
        className="absolute bg-white rounded-full shadow-md transition-all duration-300"
        style={{ width: 22, height: 22, left: value ? 26 : 4 }}
      />
    </button>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-lg font-semibold text-slate-400">{title}</p>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
    </div>
  )
}
