import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axios'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await axiosInstance.post('/auth/forgot-password', { email })
      setSuccess('Password reset link sent! Check your email inbox.')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center font-body-md">
      <div className="w-full max-w-md glass-card rounded-[32px] p-8 md:p-12 primary-glow">
        <div className="mb-10 text-center">
          <h2 className="font-headline-lg text-on-surface mb-2">Forgot Password?</h2>
          <p className="font-body-md text-on-surface-variant">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-body-md text-sm">
            {success}
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
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3.5 bg-surface-container-low border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base text-on-surface font-semibold outline-none transition-all"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full bg-primary text-on-primary font-bold py-4 rounded-2xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 primary-glow"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-8 text-center font-body-md text-on-surface-variant">
          Remember your password?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-primary font-bold hover:underline"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  )
}