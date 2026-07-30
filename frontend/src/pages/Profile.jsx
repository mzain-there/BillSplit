import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../api/axios'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [groupCount, setGroupCount] = useState(0)
  const [expenseCount, setExpenseCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.username || '',
        email: user.email || '',
      })
      setAvatarPreview(user.avatar || null)
    }
  }, [user])

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const groupsRes = await axiosInstance.get('/groups')
        setGroupCount(groupsRes.data.data.length)

        let totalExpenses = 0
        for (const group of groupsRes.data.data) {
          const expensesRes = await axiosInstance.get(`/expenses/${group._id}`)
          totalExpenses += expensesRes.data.data.length
        }
        setExpenseCount(totalExpenses)
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }
    if (user) fetchStats()
  }, [user])

  // Scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100')
          entry.target.classList.remove('translate-y-10')
        }
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.animate-fade-in').forEach(el => {
      el.classList.add('transition-all', 'duration-700', 'ease-out', 'opacity-0', 'translate-y-10')
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Toggle buttons
  useEffect(() => {
    function toggleHandler(e) {
      const btn = e.currentTarget
      const dot = btn.querySelector('div')
      if (btn.classList.contains('bg-primary')) {
        btn.classList.replace('bg-primary', 'bg-surface-container-highest')
        dot.classList.replace('translate-x-6', 'translate-x-0')
      } else {
        btn.classList.replace('bg-surface-container-highest', 'bg-primary')
        dot.classList.replace('translate-x-0', 'translate-x-6')
      }
    }
    document.querySelectorAll('button.w-14').forEach(btn => btn.addEventListener('click', toggleHandler))
    return () => document.querySelectorAll('button.w-14').forEach(btn => btn.removeEventListener('click', toggleHandler))
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const data = new FormData()
      data.append('name', formData.username)
      data.append('email', formData.email)
      if (avatar) data.append('avatar', avatar)

      const res = await axiosInstance.put('/auth/update-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUser(res.data.data)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      <Navbar />
      <main className="max-w-container-max mx-auto px-gutter py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

          {/* ── Left Sidebar ── */}
          <aside className="lg:col-span-4 space-y-gutter sticky top-28">
            <div className="glass-card rounded-xl p-8 flex flex-col items-center text-center primary-glow animate-fade-in">
              <div className="relative group">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-xl overflow-hidden mb-6 relative z-10">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt="profile"
                    src={avatarPreview || 'https://via.placeholder.com/150'}
                  />
                </div>
                <button
                  className="absolute bottom-6 right-2 z-20 bg-primary text-on-primary p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                  onClick={() => document.getElementById('avatarInput').click()}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
                </button>
                <input
                  id="avatarInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* ✅ Real user name and email */}
              <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                {user?.username}
              </h1>
              <p className="text-on-surface-variant font-label-md mb-8">
                {user?.email}
              </p>

              {/* ✅ Real stats */}
              <div className="grid grid-cols-3 w-full gap-4 pt-8 border-t border-outline-variant/30">
                <div>
                  <div className="font-headline-md text-headline-md text-primary">{groupCount}</div>
                  <div className="text-label-sm text-on-surface-variant uppercase tracking-wider">Groups</div>
                </div>
                <div>
                  <div className="font-headline-md text-headline-md text-primary">{expenseCount}</div>
                  <div className="text-label-sm text-on-surface-variant uppercase tracking-wider">Splits</div>
                </div>
                <div>
                  <div className="font-headline-md text-headline-md text-secondary">Rs. 0</div>
                  <div className="text-label-sm text-on-surface-variant uppercase tracking-wider">Settled</div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="mt-8 w-full border border-error/30 text-error py-3 rounded-lg font-bold hover:bg-error/10 transition-all"
              >
                Logout
              </button>
            </div>
          </aside>

          {/* ── Right Section ── */}
          <section className="lg:col-span-8 space-y-8">
            <div className="glass-card rounded-xl p-8 md:p-10 space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
                <h2 className="font-headline-md text-headline-md flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Personal Information
                </h2>
              </div>

              {success && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-body-md text-sm">
                  {success}
                </div>
              )}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-body-md text-sm">
                  {error}
                </div>
              )}

              {/* ✅ Real form with user data */}
              <form className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-6" onSubmit={handleSave}>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-label-md font-semibold text-on-surface-variant px-1">Full Name</label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white"
                    type="text"
                    name="name"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-label-md font-semibold text-on-surface-variant px-1">Email Address</label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button
                    className="bg-primary text-on-primary px-8 py-4 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-all primary-glow"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Section — design untouched */}
            <div className="glass-card rounded-xl p-8 md:p-10 space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h2 className="font-headline-md text-headline-md flex items-center gap-3 border-b border-outline-variant/30 pb-6">
                <span className="material-symbols-outlined text-primary">lock</span>Security
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-6">
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface-variant px-1">Current Password</label>
                  <input className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white" placeholder="••••••••" type="password" />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface-variant px-1">New Password</label>
                  <input className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white" placeholder="••••••••" type="password" />
                </div>
                <div className="md:col-span-2">
                  <button className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all">Change Password</button>
                </div>
              </div>
            </div>

            {/* Notifications — design untouched */}
            <div className="glass-card rounded-xl p-8 md:p-10 space-y-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h2 className="font-headline-md text-headline-md flex items-center gap-3 border-b border-outline-variant/30 pb-6">
                <span className="material-symbols-outlined text-primary">notifications_active</span>Notification Toggles
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-bold text-on-surface">Email Notifications</h4>
                    <p className="text-label-md text-on-surface-variant">Receive weekly expense summaries</p>
                  </div>
                  <button className="w-14 h-8 bg-primary rounded-full relative p-1 transition-colors duration-300 shadow-inner">
                    <div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-6 transition-transform duration-300" />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-bold text-on-surface">Push Notifications</h4>
                    <p className="text-label-md text-on-surface-variant">Instant alerts for new requests</p>
                  </div>
                  <button className="w-14 h-8 bg-surface-container-highest rounded-full relative p-1 transition-colors duration-300 shadow-inner">
                    <div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-0 transition-transform duration-300" />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-bold text-on-surface">Settlement Reminders</h4>
                    <p className="text-label-md text-on-surface-variant">Remind friends to pay back</p>
                  </div>
                  <button className="w-14 h-8 bg-primary rounded-full relative p-1 transition-colors duration-300 shadow-inner">
                    <div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-6 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone — design untouched */}
            <div className="bg-error-container/20 rounded-xl p-8 md:p-10 border-2 border-error/10 space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div>
                <h2 className="font-headline-md text-headline-md text-error flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined">heart_broken</span>Danger Zone
                </h2>
                <p className="text-body-md text-on-surface-variant">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button className="bg-error text-on-error px-8 py-4 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg w-full sm:w-auto">
                  Delete Account
                </button>
                <button className="text-on-surface-variant font-bold px-8 py-4 rounded-lg hover:bg-surface-container transition-all w-full sm:w-auto">
                  Deactivate Temporary
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}