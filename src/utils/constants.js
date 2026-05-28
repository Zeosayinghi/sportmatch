export const SPORT_ICONS = {
  basketball: '🏀',
  badminton:  '🏸',
  tennis:     '🎾',
  volleyball: '🏐',
  football:   '⚽',
  baseball:   '⚾',
  tabletennis:'🏓',
}

export const SPORT_LABELS = {
  basketball: '籃球',
  badminton:  '羽球',
  tennis:     '網球',
  volleyball: '排球',
  football:   '足球',
  baseball:   '棒球',
  tabletennis:'桌球',
}

export const SPORT_COLORS = {
  basketball: '#F97316',
  badminton:  '#22C55E',
  tennis:     '#A855F7',
  volleyball: '#EAB308',
  football:   '#3B82F6',
  baseball:   '#EF4444',
  tabletennis:'#06B6D4',
}

export const STATUS_CONFIG = {
  free:     { label:'空閒',   color:'#22C55E', glow:'glow-green',  bg:'bg-green-500/20',  text:'text-green-400',  border:'border-green-500/30' },
  moderate: { label:'適中',   color:'#EAB308', glow:'glow-yellow', bg:'bg-yellow-500/20', text:'text-yellow-400', border:'border-yellow-500/30' },
  busy:     { label:'擁擠',   color:'#EF4444', glow:'glow-red',    bg:'bg-red-500/20',    text:'text-red-400',    border:'border-red-500/30' },
  booked:   { label:'已預約', color:'#3B82F6', glow:'glow-blue',   bg:'bg-blue-500/20',   text:'text-blue-400',   border:'border-blue-500/30' },
}

export const LEVEL_CONFIG = {
  beginner:     { label:'新手',   bg:'bg-slate-700',   text:'text-slate-300' },
  intermediate: { label:'中階',   bg:'bg-blue-900',    text:'text-blue-300' },
  advanced:     { label:'高階',   bg:'bg-purple-900',  text:'text-purple-300' },
  pro:          { label:'職業',   bg:'bg-orange-900',  text:'text-orange-300' },
}

export const CITIES = ['全部','台北市','新北市','桃園市','新竹市','台中市','彰化縣','嘉義市','台南市','高雄市','宜蘭縣']

export function getSportLabel(sport) {
  return `${SPORT_ICONS[sport] || '🏟️'} ${SPORT_LABELS[sport] || sport}`
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}
