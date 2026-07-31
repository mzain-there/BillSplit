import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const data = new FormData()
      data.append('username', formData.username)
      data.append('email', formData.email)
      data.append('password', formData.password)
      if (avatar) data.append('avatar', avatar)

      await register(data)

      const overlay = document.getElementById('successOverlay')
      if (overlay) {
        overlay.classList.remove('opacity-0', 'pointer-events-none')
        overlay.classList.add('opacity-100')
        setTimeout(() => navigate('/dashboard'), 2500)
      }
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
              <label className="text-sm font-bold text-on-surface mb-2 tracking-wide" htmlFor="username">
                Full Name
              </label>
              <input
                id="username"
                type="text"
                name="username"
                className="w-full text-left px-4 py-3.5 bg-surface-container-low/70 border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all placeholder:text-outline-variant/60"
                placeholder="Cameron Williamson"
                value={formData.username}
                onChange={handleChange}
                required
              />
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
                className="w-full text-left px-4 py-3.5 bg-surface-container-low/70 border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all placeholder:text-outline-variant/60"
                placeholder="cameron@billings.io"
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
              <input
                id="password"
                type="password"
                name="password"
                className="w-full text-left px-4 py-3.5 bg-surface-container-low/70 border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all placeholder:text-outline-variant/60"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="pt-3">
              <button
                className="w-full bg-primary text-on-primary font-bold py-4 rounded-2xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 primary-glow flex items-center justify-center gap-2 text-lg shadow-xl shadow-primary/30"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                {!loading && <span className="material-symbols-outlined text-2xl">arrow_forward</span>}
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