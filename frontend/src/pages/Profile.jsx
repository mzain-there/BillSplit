import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../api/axios'

export default function Profile() {
  const { user, setUser, logout, deactivateAccount, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [groupCount, setGroupCount] = useState(0)
  const [expenseCount, setExpenseCount] = useState(0)
  const [settledAmount, setSettledAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  })

  // Modal states for Danger Zone actions
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteInputText, setDeleteInputText] = useState('')
  const [modalError, setModalError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
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
        const fetchedGroups = groupsRes.data.data
        setGroupCount(fetchedGroups.length)

        let totalExpenses = 0
        let totalSettled = 0

        for (const group of fetchedGroups) {
          const expensesRes = await axiosInstance.get(`/expenses/${group._id}`)
          totalExpenses += expensesRes.data.data.length

          try {
            const settlementsRes = await axiosInstance.get(`/settlements/${group._id}`)
            const settlementsData = settlementsRes.data.data || []
            // Sum settlements where the current user paid
            settlementsData.forEach((s) => {
              if (s.paidBy?._id === user?._id || s.paidBy === user?._id) {
                totalSettled += s.amount || 0
              }
            })
          } catch (_) {}
        }
        setExpenseCount(totalExpenses)
        setSettledAmount(totalSettled)
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

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
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
      data.append('username', formData.username)
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setError('')
    setSuccess('')
    try {
      await axiosInstance.put('/auth/change-password', passwordForm)
      setSuccess('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Handle Deactivate Confirm
  const handleDeactivateConfirm = async () => {
    setActionLoading(true)
    setModalError('')
    try {
      const res = await deactivateAccount()
      setShowDeactivateModal(false)
      navigate('/login', {
        state: { noticeMessage: res.message || 'Your account has been temporarily deactivated.' }
      })
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to deactivate account')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete Confirm
  const handleDeleteConfirm = async (e) => {
    e.preventDefault()
    if (deleteInputText.trim().toLowerCase() !== 'delete') {
      setModalError("Please type 'delete' to confirm.")
      return
    }
    setActionLoading(true)
    setModalError('')
    try {
      const res = await deleteAccount(deleteInputText)
      setShowDeleteModal(false)
      setDeleteInputText('')
      navigate('/login', {
        state: {
          noticeMessage: res.message || 'Your account is temporary deactivated and deleted after 30 days.'
        }
      })
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to request account deletion')
    } finally {
      setActionLoading(false)
    }
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
                  <div className="font-headline-md text-headline-md text-secondary">Rs. {settledAmount.toFixed(2)}</div>
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
                    name="username"
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
              <form className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-6" onSubmit={handlePasswordSubmit}>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface-variant px-1">Current Password</label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white"
                    placeholder="••••••••"
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface-variant px-1">New Password</label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white"
                    placeholder="••••••••"
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
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

            {/* Danger Zone */}
            <div className="bg-error-container/20 rounded-xl p-8 md:p-10 border-2 border-error/10 space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div>
                <h2 className="font-headline-md text-headline-md text-error flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined">heart_broken</span>Danger Zone
                </h2>
                <p className="text-body-md text-on-surface-variant">Once you request account deletion, your account is temporarily deactivated and permanently deleted after 30 days. You can also temporarily deactivate your account anytime.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteInputText('')
                    setModalError('')
                    setShowDeleteModal(true)
                  }}
                  className="bg-error text-on-error px-8 py-4 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                  Delete Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalError('')
                    setShowDeactivateModal(true)
                  }}
                  className="text-on-surface-variant font-bold px-8 py-4 rounded-lg border border-outline-variant/40 hover:bg-surface-container transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
                  Deactivate Temporary
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── Temporary Deactivation Modal ── */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-950/95 max-w-md w-full rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 border border-white/20 text-white backdrop-blur-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500">
              <span className="material-symbols-outlined text-3xl">power_settings_new</span>
              <h3 className="font-headline-md text-xl font-bold text-white">Deactivate Account</h3>
            </div>
            
            {/* White Card */}
            <div className="p-4 rounded-xl bg-white/20 border border-white/30 backdrop-blur-md text-white text-sm leading-relaxed space-y-3">
              <p className="text-white font-semibold">
                Are you sure you want to temporarily deactivate your account? Your profile will be paused and you will be logged out.
              </p>
              <div className="p-2.5 rounded-lg bg-red-500/25 border border-red-400/40 text-white text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-red-300">info</span>
                <span>You can reactivate anytime simply by logging back in.</span>
              </div>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-red-500/25 border border-red-400/40 text-white text-xs font-semibold">
                {modalError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowDeactivateModal(false)}
                className="px-5 py-2.5 rounded-xl text-white bg-white/20 hover:bg-white/30 transition-all text-sm font-semibold border border-white/30"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeactivateConfirm}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold active:scale-95 transition-all text-sm shadow-lg shadow-red-600/30 flex items-center gap-2"
              >
                {actionLoading ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Account Deletion Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-950/95 max-w-md w-full rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 border border-red-500/50 text-white backdrop-blur-2xl animate-in zoom-in-95 duration-200 shadow-red-950/50">
            <div className="flex items-center gap-3 text-red-500">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
              <h3 className="font-headline-md text-xl font-bold text-white">Delete Account</h3>
            </div>

            {/* White Card Container */}
            <div className="p-4 rounded-xl bg-white/20 border border-white/30 backdrop-blur-md text-white text-xs leading-relaxed space-y-2">
              <p className="font-bold text-red-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">warning</span> Danger Zone Notice:
              </p>
              <p className="text-white text-sm">
                Your account will be <strong className="text-red-300 underline">temporarily deactivated</strong> immediately and permanently deleted after <strong className="text-red-300">30 days</strong>.
              </p>
              <p className="text-white/90 text-[11px] pt-1 border-t border-white/20">
                Logging back in within the 30-day grace period will automatically cancel deletion and reactivate your account.
              </p>
            </div>

            <form onSubmit={handleDeleteConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-2">
                  To confirm deletion, please type <span className="font-mono font-bold text-white bg-red-600/60 border border-red-400 px-1.5 py-0.5 rounded uppercase">delete</span> below:
                </label>
                <input
                  type="text"
                  value={deleteInputText}
                  onChange={(e) => setDeleteInputText(e.target.value)}
                  placeholder="Type delete to confirm"
                  className="w-full bg-white/20 border border-white/30 focus:border-red-500 text-white placeholder:text-white/60 rounded-xl p-3 text-sm font-mono outline-none transition-all focus:ring-1 focus:ring-red-500"
                  autoFocus
                />
              </div>

              {modalError && (
                <div className="p-3 rounded-lg bg-red-500/25 border border-red-400/40 text-white text-xs font-semibold">
                  {modalError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 rounded-xl text-white bg-white/20 hover:bg-white/30 transition-all text-sm font-semibold border border-white/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || deleteInputText.trim().toLowerCase() !== 'delete'}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all text-sm shadow-lg shadow-red-600/40 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">delete_forever</span>
                  {actionLoading ? 'Processing...' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}