import React, { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import Logo from '../components/ui/Logo'
import PasswordInput from '../components/ui/PasswordInput'
import PrimaryButton from '../components/ui/PrimaryButton'

/* ── inline style objects ────────────────────────────── */
const page = {
  minHeight: '100vh',
  background: 'var(--bg)',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  overflow: 'hidden',
}

const toggleWrap = {
  position: 'fixed', top: 20, right: 20, zIndex: 50,
}

const mainDesktop = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 40px',
  width: '100%',
  maxWidth: 1120,
  margin: '0 auto',
  gap: 64,
}

const leftCol = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 28,
}

const rightCol = {
  width: 420,
  minWidth: 380,
  flexShrink: 0,
}

const card = {
  background: 'var(--card)',
  borderRadius: 24,
  padding: 32,
  boxShadow: 'var(--shadow)',
  border: '1px solid var(--card-border)',
}

const h1Style = {
  fontSize: 'clamp(34px, 5.4vw, 60px)',
  fontWeight: 800,
  letterSpacing: '-0.03em',
  lineHeight: 1.08,
  color: 'var(--ink)',
  margin: 0,
}

const gradientText = {
  background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const subText = {
  fontSize: 16,
  color: 'var(--muted)',
  lineHeight: 1.6,
  maxWidth: 420,
  fontWeight: 500,
}

const cardTitle = {
  fontSize: 26,
  fontWeight: 800,
  color: 'var(--ink)',
  margin: '0 0 4px',
}

const cardSub = {
  fontSize: 15,
  color: 'var(--muted)',
  margin: '0 0 24px',
  fontWeight: 500,
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--ink)',
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'var(--input-bg)',
  border: '1.5px solid var(--line)',
  borderRadius: 14,
  fontSize: 15,
  fontWeight: 500,
  color: 'var(--ink)',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const rowBetween = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: 13,
  marginTop: 4,
}

const checkboxLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  color: 'var(--muted)',
  fontWeight: 600,
  fontSize: 13,
}

const checkboxInput = {
  width: 16, height: 16, accentColor: 'var(--primary)',
  borderRadius: 4,
}

const dividerRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  margin: '16px 0',
}

const dividerLine = {
  flex: 1, height: 1, background: 'var(--line)',
}

const dividerLabel = {
  fontSize: 12, fontWeight: 700, color: 'var(--divider-text)',
  letterSpacing: '0.05em',
}

const googleBtn = {
  width: '100%',
  padding: '12px 24px',
  borderRadius: 14,
  border: '1.5px solid var(--google-btn-border)',
  background: 'var(--google-btn-bg)',
  color: 'var(--ink)',
  fontSize: 15,
  fontWeight: 600,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  transition: 'all 0.2s ease',
}

const footer = {
  textAlign: 'center',
  fontSize: 14,
  color: 'var(--muted)',
  marginTop: 24,
  fontWeight: 500,
}

/* ── Showcase panel styles ─────────────────────────── */
const showcasePanel = {
  borderRadius: 26,
  background: 'var(--showcase-bg)',
  padding: 32,
  position: 'relative',
  overflow: 'hidden',
  minHeight: 260,
}

const glassCardBase = {
  borderRadius: 16,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '18px 22px',
  position: 'absolute',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
}

const floatingCard1 = {
  ...glassCardBase,
  background: 'rgba(255,255,255,0.08)',
  top: 32, left: 24, width: 220,
  animation: 'floatCard 7s ease-in-out infinite',
  transform: 'rotate(-6deg)',
}

const floatingCard2 = {
  ...glassCardBase,
  background: 'rgba(79,70,229,0.15)',
  bottom: 28, right: 24, width: 180,
  animation: 'floatCard2 6s ease-in-out infinite',
  transform: 'rotate(4deg)',
}

const glow1 = {
  position: 'absolute', width: 120, height: 120, borderRadius: '50%',
  background: 'rgba(79,70,229,0.25)', filter: 'blur(50px)',
  top: -20, right: 40, pointerEvents: 'none',
}

const glow2 = {
  position: 'absolute', width: 100, height: 100, borderRadius: '50%',
  background: 'rgba(124,58,237,0.20)', filter: 'blur(45px)',
  bottom: -10, left: 30, pointerEvents: 'none',
}

const cardInnerTitle = {
  color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 700, marginBottom: 6,
}

const cardInnerAmount = {
  color: '#ffffff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em',
}

const cardInnerSub = {
  color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, marginTop: 4,
}

/* ── Component ───────────────────────────────────────── */
export default function Login() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // ── State ────────────────────────────────────────────
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.noticeMessage || '')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 860)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Google OAuth Login ────────────────────────────────
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('')
      setGoogleLoading(true)
      try {
        await googleLogin({ token: tokenResponse.access_token, mode: 'login' })
        navigate('/dashboard')
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed. Please try again.')
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: (errorResponse) => {
      console.error('Google Sign-In Error:', errorResponse)
      setError('Google sign-in was cancelled or encountered an error.')
    }
  })

  // ── Submit Handler ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={page}>

      <main style={{
        ...mainDesktop,
        ...(isMobile ? { flexDirection: 'column', padding: '32px 20px', gap: 32 } : {}),
      }} className="auth-page-enter">

        {/* ── LEFT: Showcase Column ── */}
        <div style={{
          ...leftCol,
          ...(isMobile ? { paddingRight: 0, alignItems: 'center', textAlign: 'center' } : {}),
        }}>
          <Logo size={36} />

          <h1 style={h1Style}>
            Split bills.<br />
            <span style={gradientText}>Not friendships.</span>
          </h1>

          <p style={{ ...subText, ...(isMobile ? { maxWidth: 340, margin: '0 auto' } : {}) }}>
            Shared expenses with total clarity. Track, split and settle with your people — in real time.
          </p>

          {/* Showcase visual — hidden on mobile */}
          {!isMobile && (
            <div style={showcasePanel}>
              <div style={glow1} />
              <div style={glow2} />
              <div style={floatingCard1}>
                <div style={cardInnerTitle}>Dinner split</div>
                <div style={cardInnerAmount}>Rs. 10,000</div>
                <div style={cardInnerSub}>4 people</div>
              </div>
              <div style={floatingCard2}>
                <div style={cardInnerTitle}>Your share</div>
                <div style={{ ...cardInnerAmount, fontSize: 20 }}>Rs. 2,500</div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Form Card ── */}
        <div style={isMobile ? { width: '100%', maxWidth: 420 } : rightCol}>
          <div style={card}>
            <h2 style={cardTitle}>Welcome back</h2>
            <p style={cardSub}>Enter your credentials to continue.</p>

            {/* Notice */}
            {notice && (
              <div style={{
                padding: '12px 16px', borderRadius: 14, marginBottom: 16,
                background: 'var(--notice-bg)', border: '1px solid var(--notice-border)',
                color: 'var(--notice-text)', fontSize: 13, fontWeight: 600,
              }}>
                {notice}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: 14, marginBottom: 16,
                background: 'var(--error-bg)', border: '1px solid var(--error-border)',
                color: 'var(--danger)', fontSize: 13, fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Email */}
              <div>
                <label htmlFor="email" style={labelStyle}>Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--primary)'
                    e.target.style.boxShadow = '0 0 0 3px var(--focus-ring)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--line)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Password */}
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                showPassword={showPassword}
                onToggleShow={() => setShowPassword(prev => !prev)}
              />

              {/* Remember / Forgot */}
              <div style={rowBetween}>
                <label style={checkboxLabel}>
                  <input type="checkbox" style={checkboxInput} />
                  Remember me
                </label>
                <Link to="/forgot-password" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <PrimaryButton loading={loading} disabled={loading}>
                Sign in
              </PrimaryButton>

              {/* Divider */}
              <div style={dividerRow}>
                <div style={dividerLine} />
                <span style={dividerLabel}>or</span>
                <div style={dividerLine} />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading || googleLoading}
                style={{
                  ...googleBtn,
                  ...(loading || googleLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
                }}
                onMouseEnter={e => { if (!loading && !googleLoading) e.currentTarget.style.background = 'var(--google-btn-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--google-btn-bg)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>
            </form>

            {/* Footer */}
            <p style={footer}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}