import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const SPORT_OPTIONS = [
  { value: 'basketball', label: '🏀 籃球' },
  { value: 'badminton',  label: '🏸 羽球' },
  { value: 'tennis',     label: '🎾 網球' },
  { value: 'volleyball', label: '🏐 排球' },
  { value: 'football',   label: '⚽ 足球' },
  { value: 'tabletennis',label: '🏓 桌球' },
]
const LEVEL_OPTIONS = [
  { value: 'beginner',     label: '新手' },
  { value: 'intermediate', label: '中階' },
  { value: 'advanced',     label: '高階' },
  { value: 'pro',          label: '職業' },
]
const TIME_SLOTS = ['平日早上','平日下午','平日晚上','週末早上','週末下午','週末晚上']

const inputStyle = {
  background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC',
  borderRadius: 12, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%',
  boxSizing: 'border-box',
}
const labelStyle = { fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const { login, register } = useAuth()

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [regForm, setRegForm] = useState({
    username: '', password: '', confirmPassword: '',
    displayName: '', sport: 'basketball', level: 'intermediate',
    district: '', bio: '', slots: [],
    role: 'user', venueName: '',
  })
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1 or 2 for register

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    const res = await login(loginForm.username, loginForm.password)
    if (res.error) setError(res.error)
  }

  function handleRegStep1(e) {
    e.preventDefault()
    setError('')
    if (!regForm.username.trim()) return setError('請輸入用戶名稱')
    if (!regForm.password.trim()) return setError('請輸入密碼')
    if (regForm.password !== regForm.confirmPassword) return setError('兩次密碼不一致')
    if (!regForm.displayName.trim()) return setError('請輸入顯示名稱')
    if (regForm.role === 'venue') {
      // Venue accounts skip step 2
      const res = register(regForm)
      if (res.then) {
        res.then(r => {
          if (r.error) setError(r.error)
          else { setSuccess(true); setTimeout(() => login(regForm.username, regForm.password), 1500) }
        })
      } else {
        if (res.error) setError(res.error)
        else { setSuccess(true); setTimeout(() => login(regForm.username, regForm.password), 1500) }
      }
      return
    }
    setStep(2)
  }

  function handleRegister(e) {
    e.preventDefault()
    setError('')
    const res = register(regForm)
    if (res.error) setError(res.error)
    // On success, AuthContext will update currentUser automatically via login
    if (res.success) {
      login(regForm.username, regForm.password)
    }
  }

  function toggleSlot(slot) {
    setRegForm(prev => ({
      ...prev,
      slots: prev.slots.includes(slot)
        ? prev.slots.filter(s => s !== slot)
        : [...prev.slots, slot],
    }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏀</div>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 28, margin: 0 }}>SportMatch</h1>
          <p style={{ color: '#64748B', fontSize: 14, margin: '4px 0 0' }}>動態運動資源調度平台</p>
        </div>

        {/* Tab */}
        <div style={{ display: 'flex', background: '#1E293B', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid #334155' }}>
          {[['login','登入'],['register','註冊']].map(([m, l]) => (
            <button key={m} onClick={() => { setMode(m); setStep(1); setError('') }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: mode === m ? '#2563EB' : 'transparent',
                color: mode === m ? '#fff' : '#64748B',
                transition: 'all 0.2s',
              }}>
              {l}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#1E293B', borderRadius: 20, padding: 24, border: '1px solid #334155' }}>
          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>用戶名稱</label>
                <input style={inputStyle} placeholder="輸入用戶名稱" value={loginForm.username}
                  onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))} autoFocus />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>密碼</label>
                <input style={inputStyle} type="password" placeholder="輸入密碼" value={loginForm.password}
                  onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} />
              </div>
              {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, background: '#1a0a0a', padding: '8px 12px', borderRadius: 8 }}>⚠️ {error}</p>}
              <button type="submit" style={{ width: '100%', padding: '12px 0', borderRadius: 12, background: '#2563EB', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none' }}>
                登入
              </button>
            </form>
          ) : step === 1 ? (
            <form onSubmit={handleRegStep1}>
              <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 20 }}>步驟 1/2：基本資料</p>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>用戶名稱 (唯一識別碼)</label>
                <input style={inputStyle} placeholder="英文、數字，不含空格" value={regForm.username}
                  onChange={e => setRegForm(p => ({ ...p, username: e.target.value.trim() }))} autoFocus />
              </div>
              {/* Role selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>帳號類型</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[['user','👤 一般使用者'],['venue','🏟️ 球場管理員']].map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => setRegForm(p => ({ ...p, role: val }))}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13,
                        fontWeight: 600, cursor: 'pointer', border: '1px solid',
                        background: regForm.role === val ? '#1E3A5F' : '#0F172A',
                        borderColor: regForm.role === val ? '#2563EB' : '#334155',
                        color: regForm.role === val ? '#60A5FA' : '#64748B',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>顯示名稱</label>
                <input style={inputStyle} placeholder="其他用戶看到的名稱" value={regForm.displayName}
                  onChange={e => setRegForm(p => ({ ...p, displayName: e.target.value }))} />
              </div>
              {regForm.role === 'venue' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>球場名稱</label>
                  <input style={inputStyle} placeholder="例：大安運動中心" value={regForm.venueName}
                    onChange={e => setRegForm(p => ({ ...p, venueName: e.target.value }))} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>密碼</label>
                  <input style={inputStyle} type="password" placeholder="密碼" value={regForm.password}
                    onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>確認密碼</label>
                  <input style={inputStyle} type="password" placeholder="再次輸入" value={regForm.confirmPassword}
                    onChange={e => setRegForm(p => ({ ...p, confirmPassword: e.target.value }))} />
                </div>
              </div>
              {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, background: '#1a0a0a', padding: '8px 12px', borderRadius: 8 }}>⚠️ {error}</p>}
              <button type="submit" style={{ width: '100%', padding: '12px 0', borderRadius: 12, background: '#2563EB', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none' }}>
                下一步 →
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 20 }}>步驟 2/2：運動資料</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>主要運動</label>
                  <select style={inputStyle} value={regForm.sport} onChange={e => setRegForm(p => ({ ...p, sport: e.target.value }))}>
                    {SPORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>程度</label>
                  <select style={inputStyle} value={regForm.level} onChange={e => setRegForm(p => ({ ...p, level: e.target.value }))}>
                    {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>所在地區</label>
                <input style={inputStyle} placeholder="例如：台北市大安區" value={regForm.district}
                  onChange={e => setRegForm(p => ({ ...p, district: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>個人簡介</label>
                <textarea style={{ ...inputStyle, resize: 'none', height: 72 }} placeholder="介紹自己的打球風格、習慣等..." value={regForm.bio}
                  onChange={e => setRegForm(p => ({ ...p, bio: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>可配合時段 (可複選)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid',
                        background: regForm.slots.includes(slot) ? '#1E3A5F' : '#0F172A',
                        borderColor: regForm.slots.includes(slot) ? '#2563EB' : '#334155',
                        color: regForm.slots.includes(slot) ? '#60A5FA' : '#64748B',
                      }}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, background: '#1a0a0a', padding: '8px 12px', borderRadius: 8 }}>⚠️ {error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: '#0F172A', color: '#94A3B8', fontWeight: 600, fontSize: 15, cursor: 'pointer', border: '1px solid #334155' }}>
                  ← 上一步
                </button>
                <button type="submit" style={{ flex: 2, padding: '12px 0', borderRadius: 12, background: '#2563EB', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none' }}>
                  完成註冊 🎉
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 16 }}>
          SportMatch · 找到你的最佳球友
        </p>
      </div>
    </div>
  )
}
