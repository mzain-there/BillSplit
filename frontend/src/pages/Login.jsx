import React, { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // ── State ────────────────────────────────────────────
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.noticeMessage || '')
  const [loading, setLoading] = useState(false)

  // ── Mouse hover glow effect ──────────────────────────
  useEffect(() => {
    const card = document.querySelector('.glass-card.primary-glow')
    if (!card) return
    const onMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
        card.style.boxShadow = `${(x - rect.width / 2) / 16}px ${(y - rect.height / 2) / 16}px 40px -5px rgba(99, 102, 241, 0.3)`
      } else {
        card.style.boxShadow = ''
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

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
    <div className="bg-background text-on-background min-h-screen flex flex-col justify-between font-body-md overflow-x-hidden selection:bg-primary selection:text-on-primary">
      
      {/* ── Main Full-Spacious Centered Viewport Section ── */}
      <main className="flex-grow flex items-center justify-center w-full max-w-container-max mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full max-w-7xl">
          
          {/* Left Column: Extra Bold Headline & VIP Illustration */}
          <div className="lg:col-span-7 flex flex-col justify-center relative overflow-hidden text-left">
            <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-primary/15 rounded-full blur-[140px] pointer-events-none"></div>
            
            <div className="relative z-10 space-y-8">
              <h1 className="font-display-xl text-5xl sm:text-6xl lg:text-7xl font-bold text-on-surface leading-[1.08] tracking-tight">
                Split bills. <br />
                <span className="text-primary italic font-extrabold">Not friendships.</span>
              </h1>
              
              <p className="font-body-lg text-lg sm:text-xl text-on-surface-variant max-w-xl leading-relaxed font-medium">
                Effortless expense sharing with high-end financial transparency. Designed for the modern era of collaborative living.
              </p>
              
              {/* VIP Bill Separation Picture */}
              <div className="relative w-full max-w-xl aspect-video rounded-[32px] overflow-hidden glass-card p-3.5 animate-float group border-2 border-primary/30 shadow-2xl">
                <div
                  className="w-full h-full bg-cover bg-center rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
                  style={{ backgroundImage: `url('/vip_bill_split.png')` }}
                  data-alt="VIP Bill Separation"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Grand Glass Form Card */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="w-full max-w-lg glass-card rounded-[36px] p-8 sm:p-10 md:p-12 primary-glow border-2 border-outline-variant/30 shadow-2xl">
              
              <div className="mb-8 text-left space-y-2">
                <h2 className="font-headline-lg text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">Welcome Back</h2>
                <p className="font-body-md text-base text-on-surface-variant font-medium">Enter your credentials to continue splitting.</p>
              </div>

              {/* Notice Message */}
              {notice && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-body-md text-sm font-medium leading-relaxed text-left">
                  {notice}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-500 font-body-md text-sm font-semibold text-left">
                  {error}
                </div>
              )}

              <form className="space-y-6 text-left" onSubmit={handleSubmit}>
                
                {/* ── Email Field Left-Aligned ── */}
                <div className="flex flex-col text-left">
                  <label className="text-sm font-bold text-on-surface mb-2 tracking-wide" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="w-full text-left px-4 py-3.5 bg-surface-container-low/70 border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all placeholder:text-outline-variant/60"
                    placeholder="cameron@billings.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* ── Password Field Left-Aligned ── */}
                <div className="flex flex-col text-left">
                  <label className="text-sm font-bold text-on-surface mb-2 tracking-wide" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="w-full text-left px-4 py-3.5 bg-surface-container-low/70 border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all placeholder:text-outline-variant/60"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between font-label-sm text-sm pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-on-surface-variant hover:text-primary font-medium transition-colors">
                    <input className="w-4 h-4 rounded-sm border-outline text-primary focus:ring-primary/20" type="checkbox" />
                    Remember me
                  </label>
                  <a className="text-primary hover:underline transition-all font-bold" href="#">Forgot Password?</a>
                </div>

                <div className="space-y-4 pt-2">
                  <button
                    className="w-full bg-primary text-on-primary font-bold py-4 rounded-2xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 primary-glow flex items-center justify-center gap-2 text-lg shadow-xl shadow-primary/30"
                    type="submit"
                    disabled={loading}
                  >
                    <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    {!loading && <span className="material-symbols-outlined text-2xl">arrow_forward</span>}
                  </button>

                  <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-outline-variant/40"></div>
                    <span className="flex-shrink mx-4 text-outline font-label-sm text-xs font-bold uppercase tracking-wider">OR</span>
                    <div className="flex-grow border-t border-outline-variant/40"></div>
                  </div>

                  <button className="w-full glass-card text-on-surface font-semibold py-3.5 rounded-2xl transition-all duration-300 ease-out hover:bg-surface-container-low flex items-center justify-center gap-3 border border-outline-variant/30 text-base shadow-sm" type="button">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              </form>

              <p className="mt-10 text-center font-body-md text-base text-on-surface-variant font-medium">
                Don't have an account?{' '}
                <Link className="text-primary font-bold hover:underline" to="/register">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

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
    </div>
  )
}