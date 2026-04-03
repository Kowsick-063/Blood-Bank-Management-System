import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { authAPI } from '../services/api'
import AuthLeft from '../components/AuthLeft'
import '../styles/auth.css'

const OTP_LENGTH = 6

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') || ''

  const [otp, setOtp]         = useState(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [resending, setResending]   = useState(false)
  const [apiError, setApiError]     = useState('')
  const [verified, setVerified]     = useState(false)
  const [timer, setTimer]     = useState(60)
  const [canResend, setCanResend]   = useState(false)
  const inputRefs = useRef([])

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setTimer(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  const focusNext = (index) => {
    if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }
  const focusPrev = (index) => {
    if (index > 0) inputRefs.current[index - 1]?.focus()
  }

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) return
    const char = val[val.length - 1]
    const newOtp = [...otp]
    newOtp[index] = char
    setOtp(newOtp)
    setApiError('')
    focusNext(index)
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const n = [...otp]; n[index] = ''; setOtp(n)
      } else {
        focusPrev(index)
      }
    }
    if (e.key === 'ArrowLeft') focusPrev(index)
    if (e.key === 'ArrowRight') focusNext(index)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const newOtp = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((c, i) => { newOtp[i] = c })
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  const handleVerify = useCallback(async (otpVal) => {
    const code = otpVal || otp.join('')
    if (code.length < OTP_LENGTH) { setApiError('Please enter the complete 6-digit OTP'); return }
    setLoading(true)
    setApiError('')
    try {
      await authAPI.verifyEmail({ email, otp: code })
      setVerified(true)
      toast.success('Email verified successfully!')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid OTP. Please try again.')
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }, [email, otp])

  const handleResend = async () => {
    setResending(true)
    setApiError('')
    try {
      await authAPI.resendOTP({ email })
      toast.success('New OTP sent to your email!')
      setTimer(60)
      setCanResend(false)
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-page">
      <AuthLeft />

      <div className="auth-right">
        <motion.div
          className="auth-form-container"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <AnimatePresence mode="wait">
            {!verified ? (
              <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="auth-header">
                  <h2>Verify your email 📬</h2>
                  <p>
                    We sent a 6-digit code to<br />
                    <strong style={{ color: 'var(--gray-800)' }}>{email || 'your email'}</strong>
                  </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {apiError && (
                    <motion.div
                      className="alert alert-error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
                      {apiError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* OTP Inputs */}
                <div className="otp-container" onPaste={handlePaste}>
                  {otp.map((val, i) => (
                    <motion.input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={e => handleChange(e, i)}
                      onKeyDown={e => handleKeyDown(e, i)}
                      className={`otp-input ${val ? 'filled' : ''}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.07 }}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                {/* Verify button */}
                <motion.button
                  className="btn-primary"
                  onClick={() => handleVerify()}
                  disabled={loading || otp.join('').length < OTP_LENGTH}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading
                    ? <><div className="btn-spinner" /><span>Verifying…</span></>
                    : 'Verify Email'
                  }
                </motion.button>

                {/* Resend */}
                <div className="resend-row">
                  Didn't receive the code?{' '}
                  {canResend
                    ? <button className="resend-btn" onClick={handleResend} disabled={resending}>
                        {resending ? <><FiRefreshCw size={12} style={{ marginRight: 4 }} />Sending…</> : 'Resend OTP'}
                      </button>
                    : <span>Resend in <span className="timer-text">{timer}s</span></span>
                  }
                </div>

                <p className="auth-switch" style={{ marginTop: 16 }}>
                  <Link to="/login">← Back to Login</Link>
                </p>
              </motion.div>
            ) : (
              /* Success state */
              <motion.div
                key="success"
                className="success-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <motion.div
                  className="success-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                >
                  ✅
                </motion.div>
                <h3>Email Verified!</h3>
                <p>Your email has been verified successfully.<br />You can now log in to your account.</p>
                <motion.button
                  className="btn-primary"
                  onClick={() => navigate('/login')}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Go to Login →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
