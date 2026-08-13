import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../api/axios'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
    setError('Password must be at least 8 characters')
    return
  }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
     if (!passwordRegex.test(password)) {
      setError('Password must contain uppercase, lowercase, number and special character (@$!%*?&)')
      return
    }

    setLoading(true)

    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, { password })
      setSuccess('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center font-body-md">
      <div className="w-full max-w-md glass-card rounded-[32px] p-8 md:p-12 primary-glow">
        <div className="mb-10 text-center">
          <h2 className="font-headline-lg text-on-surface mb-2">Reset Password</h2>
          <p className="font-body-md text-on-surface-variant">
            Enter your new password below.
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-body-md text-sm">
            {success} Redirecting to login...
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-body-md text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-on-surface mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3.5 bg-surface-container-low border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-bold text-on-surface mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3.5 bg-surface-container-low border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full bg-primary text-on-primary font-bold py-4 rounded-2xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 primary-glow"
            type="submit"
            disabled={loading || !!success}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}