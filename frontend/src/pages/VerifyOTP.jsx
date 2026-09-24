import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axiosInstance from '../api/axios'
import { useAuth } from '../contexts/AuthContext'

export default function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()
  const [email, setEmail] = useState(location.state?.email || '')

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(600)       // OTP expiry countdown
  const [resendTimer, setResendTimer] = useState(60) // Resend cooldown

  // OTP expiry countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Resend cooldown countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 0) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits')
      setLoading(false)
      return
    }

    try {
      const res = await axiosInstance.post('/auth/verify-otp', {
        email,
        otp: otpString
      })

      // Set user in AuthContext
      setUser(res.data.data)
      setSuccess('Account verified successfully!')
      setTimeout(() => navigate('/dashboard'), 1500)

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address to resend OTP')
      return
    }
    try {
      await axiosInstance.post('/auth/resend-otp', { email })
      setResendTimer(60) // Reset resend cooldown
      setTimer(600)      // Reset OTP expiry
      setSuccess('New OTP sent to your email!')
      setError('')
      setOtp(['', '', '', '', '', '']) // Clear OTP inputs
      document.getElementById('otp-0')?.focus()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center font-body-md">
      <div className="w-full max-w-md glass-card rounded-[32px] p-8 md:p-12 primary-glow">
        <div className="mb-10 text-center">
          <h2 className="font-headline-lg text-on-surface mb-2">Verify Your Email</h2>
          {email ? (
            <p className="font-body-md text-on-surface-variant">
              We sent a 6 digit code to <b>{email}</b>
            </p>
          ) : (
            <div className="mt-3 text-left">
              <label className="text-xs font-bold text-on-surface mb-1 block">Email Address</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:border-primary"
              />
            </div>
          )}
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

        <form onSubmit={handleVerify}>
          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold bg-surface-container-low border-2 border-outline-variant rounded-xl focus:border-primary focus:outline-none transition-all"
              />
            ))}
          </div>

          {/* OTP Expiry Timer */}
          <p className="text-center text-on-surface-variant font-body-md mb-6">
            Code expires in{' '}
            <span className={`font-bold ${timer < 60 ? 'text-red-500' : 'text-primary'}`}>
              {formatTime(timer)}
            </span>
          </p>

          <button
            className="w-full bg-primary text-on-primary font-label-md py-4 rounded-2xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 primary-glow mb-4"
            type="submit"
            disabled={loading || timer === 0}
          >
            {loading ? 'Verifying...' : timer === 0 ? 'OTP Expired' : 'Verify Account'}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="font-body-md text-on-surface-variant">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              className={`font-bold transition-all ${
                resendTimer > 0
                  ? 'text-outline cursor-not-allowed'
                  : 'text-primary hover:underline cursor-pointer'
              }`}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </p>
        </div>

        {/* OTP Expired Message */}
        {timer === 0 && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-body-md text-sm text-center">
            OTP expired. Please{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-bold underline"
            >
              register again
            </button>
            {' '}or resend OTP.
          </div>
        )}
      </div>
    </div>
  )
}