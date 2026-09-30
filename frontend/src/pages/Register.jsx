import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import { Camera, Pencil } from 'lucide-react'
import Logo from '../components/ui/Logo'
import PasswordInput from '../components/ui/PasswordInput'
import PrimaryButton from '../components/ui/PrimaryButton'

/* ── Inline styles ───────────────────────────────────── */
const page = {
  minHeight: '100vh',
  background: 'var(--bg)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  padding: '24px 20px',
}

const toggleWrap = {
  position: 'fixed', top: 20, right: 20, zIndex: 50,
}

const card = {
  background: 'var(--card)',
  borderRadius: 22,
  padding: '24px 28px',
  boxShadow: 'var(--shadow)',
  border: '1px solid var(--card-border)',
  width: '100%',
  maxWidth: 440,
}

const cardTitle = {
  fontSize: 26,
  fontWeight: 800,
  color: 'var(--ink)',
  margin: '0 0 2px',
  textAlign: 'center',
}

const cardSub = {
  fontSize: 14,
  color: 'var(--muted)',
  margin: '0 0 16px',
  fontWeight: 500,
  textAlign: 'center',
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
  marginTop: 16,
  fontWeight: 500,
}

/* Avatar styles */
const avatarWrap = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: 2,
}

const avatarCircle = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  border: '2px dashed var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  overflow: 'hidden',
  position: 'relative',
  background: 'var(--soft)',
  transition: 'border-color 0.2s, background 0.2s',
}

const editBadge = {
  position: 'absolute',
  bottom: 2,
  right: 2,
  width: 24,
  height: 24,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid var(--card)',
}

/* ── Component ───────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate()
  const { register, googleLogin } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isWide, setIsWide] = useState(false)

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Google OAuth Registration / Login ─────────────────
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('')
      setGoogleLoading(true)
      try {
        await googleLogin({ token: tokenResponse.access_token, mode: 'register' })
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  // ── Avatar selection with preview ────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (formData.username.trim().length < 5 || formData.username.trim().length > 30) {
      setError('Full Name must be between 5 and 30 characters')
      setLoading(false)
      return
    }

    if (!/^[A-Z]/.test(formData.username.trim())) {
      setError('Full Name must start with an uppercase letter')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const data = new FormData()
      data.append('username', formData.username.trim())
      data.append('email', formData.email.trim())
      data.append('password', formData.password)
      if (avatar) data.append('avatar', avatar)

      await register(data)

      // Redirect to OTP verification page with email
      navigate('/verify-otp', { state: { email: formData.email.trim() } })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Char counter color
  const charCount = formData.username.length
  const counterColor = charCount === 0 ? 'var(--muted)' : charCount < 5 ? 'var(--danger)' : 'var(--success)'

  return (
    <div style={page}>

      {/* Logo above card */}
      <div style={{ marginBottom: 16 }}>
        <Logo size={34} />
      </div>

      <div style={card} className="auth-page-enter">
        <h2 style={cardTitle}>Create account</h2>
        <p style={cardSub}>Start splitting expenses effortlessly.</p>

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

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar upload */}
          <div style={avatarWrap}>
            <div
              style={avatarCircle}
              onClick={() => document.getElementById('avatarInput').click()}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-2)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
            >
              {avatarPreview ? (
                <>
                  <img src={avatarPreview} alt="avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  <div style={editBadge}>
                    <Pencil size={12} color="#fff" />
                  </div>
                </>
              ) : (
                <Camera size={28} color="var(--primary)" strokeWidth={1.5} />
              )}
            </div>
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Full Name with live counter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label htmlFor="username" style={{ ...labelStyle, marginBottom: 0 }}>Full Name</label>
              <span style={{ fontSize: 12, fontWeight: 700, color: counterColor }}>{charCount}/30</span>
            </div>
            <input
              id="username"
              type="text"
              name="username"
              minLength={5}
              maxLength={30}
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="name"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--focus-ring)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--focus-ring)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Password row — 2 columns on desktop, stacked on mobile */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isWide ? '1fr 1fr' : '1fr',
            gap: 16,
          }}>
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              showPassword={showPassword}
              onToggleShow={() => setShowPassword(prev => !prev)}
            />
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              showPassword={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(prev => !prev)}
            />
          </div>

          {/* Submit */}
          <div style={{ marginTop: 4 }}>
            <PrimaryButton loading={loading} disabled={loading}>
              Create account
            </PrimaryButton>
          </div>

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
          Already a member?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}