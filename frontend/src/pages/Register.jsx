import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'

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

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col justify-between font-body-md overflow-x-hidden selection:bg-primary selection:text-on-primary">
      
      {/* ── Main Full-Spacious Centered Viewport Section (No Navbar) ── */}
      <main className="flex-grow flex items-center justify-center w-full max-w-container-max mx-auto px-6 py-12 md:py-16">
        <div className="w-full max-w-lg glass-card rounded-[36px] p-8 sm:p-10 md:p-12 primary-glow border-2 border-outline-variant/30 shadow-2xl">
          
          <div className="text-center mb-8 space-y-2">
            <h2 className="font-headline-lg text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">Create Account</h2>
            <p className="font-body-md text-base text-on-surface-variant font-medium">Start splitting expenses effortlessly today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-500 font-body-md text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6 text-left">
            
            {/* ── Profile Picture Upload Directly Above Inputs ── */}
            <div className="flex flex-col items-center justify-center pb-2">
              <div
                className="relative group cursor-pointer w-28 h-28 rounded-full border-2 border-dashed border-outline-variant/60 hover:border-primary group-hover:bg-primary-container/10 transition-all duration-300 flex flex-col items-center justify-center p-1 overflow-hidden shadow-md bg-surface-container-low/70"
                onClick={() => document.getElementById('avatarInput').click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="flex flex-col items-center text-outline group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-4xl mb-0.5">add_a_photo</span>
                    <span className="font-label-sm text-[11px] uppercase font-bold tracking-wider">Photo</span>
                  </div>
                )}
              </div>
              <p className="font-body-md text-sm text-on-surface-variant font-medium mt-2.5">Upload profile picture</p>
              
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* ── Full Name Field Left-Aligned ── */}
            <div className="flex flex-col text-left">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-on-surface tracking-wide" htmlFor="username">
                  Full Name
                </label>
                <span className="text-xs font-semibold text-outline-variant">
                  5-30 chars
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  id="username"
                  type="text"
                  name="username"
                  minLength={5}
                  maxLength={30}
                  className="w-full text-left pl-4 pr-16 py-3.5 bg-surface-container-low/70 border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <span className={`absolute right-3.5 text-xs font-bold pointer-events-none select-none ${
                  formData.username.length === 0
                    ? 'text-outline-variant/60'
                    : formData.username.length < 5
                    ? 'text-amber-500'
                    : 'text-primary'
                }`}>
                  {formData.username.length}/30
                </span>
              </div>
            </div>

            {/* ── Email Address Field Left-Aligned ── */}
            <div className="flex flex-col text-left">
              <label className="text-sm font-bold text-on-surface mb-2 tracking-wide" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className="w-full text-left px-4 py-3.5 bg-surface-container-low/70 border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* ── Security Password Field Left-Aligned ── */}
            <div className="flex flex-col text-left">
              <label className="text-sm font-bold text-on-surface mb-2 tracking-wide" htmlFor="password">
                Security Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full text-left pl-4 pr-12 py-3.5 bg-surface-container-low/70 border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3.5 flex items-center justify-center text-outline-variant hover:text-on-surface transition-colors p-1 rounded-lg focus:outline-none"
                  tabIndex={-1}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-xl select-none">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* ── Confirm Password Field Left-Aligned ── */}
            <div className="flex flex-col text-left">
              <label className="text-sm font-bold text-on-surface mb-2 tracking-wide" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="w-full text-left pl-4 pr-12 py-3.5 bg-surface-container-low/70 border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-3.5 flex items-center justify-center text-outline-variant hover:text-on-surface transition-colors p-1 rounded-lg focus:outline-none"
                  tabIndex={-1}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-xl select-none">
                    {showConfirmPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-3 space-y-4">
              <button
                className="w-full bg-primary text-on-primary font-bold py-4 rounded-2xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 primary-glow flex items-center justify-center gap-2 text-lg shadow-xl shadow-primary/30"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                {!loading && <span className="material-symbols-outlined text-2xl">arrow_forward</span>}
              </button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-outline-variant/40"></div>
                <span className="flex-shrink mx-4 text-outline font-label-sm text-xs font-bold uppercase tracking-wider">OR</span>
                <div className="flex-grow border-t border-outline-variant/40"></div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading || googleLoading}
                className="w-full glass-card text-on-surface font-semibold py-3.5 rounded-2xl transition-all duration-300 ease-out hover:bg-surface-container-low flex items-center justify-center gap-3 border border-outline-variant/30 text-base shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>
            </div>
          </form>

          <p className="mt-10 text-center font-body-md text-base text-on-surface-variant font-medium">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline transition-all"
            >
              Sign in
            </Link>
          </p>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-5 px-6 max-w-container-max mx-auto border-t border-outline-variant/10 text-xs text-outline flex justify-between items-center">
        <p>© 2024 BillSplit Inc.</p>
        <div className="flex gap-6">
          <a className="hover:text-primary transition-colors font-medium" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors font-medium" href="#">Terms of Service</a>
          <a className="hover:text-primary transition-colors font-medium" href="#">Security</a>
        </div>
      </footer>

      {/* Success Overlay */}
      <div className="fixed inset-0 bg-surface/90 backdrop-blur-xl z-[60] flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-500" id="successOverlay">
        <div className="text-center space-y-6 max-w-xs p-8 glass-card rounded-[32px] border border-primary/20">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto animate-bounce">
            <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: `"FILL" 1` }}>check_circle</span>
          </div>
          <h2 className="font-headline-lg text-xl text-on-surface font-bold">Welcome to BillSplit</h2>
          <p className="font-body-md text-sm text-on-surface-variant">Redirecting to your dashboard...</p>
        </div>
      </div>
    </div>
  )
}