import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { FiMail, FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import { authAPI } from '../services/api'
import AuthLeft from '../components/AuthLeft'
import '../styles/auth.css'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export default function ForgotPassword() {
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }) => {
    setLoading(true)
    setApiError('')
    try {
      await authAPI.forgotPassword({ email })
      setSentEmail(email)
      setSent(true)
      toast.success('Password reset link sent!')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to send reset link. Try again.')
    } finally {
      setLoading(false)
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
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="auth-header">
                  <h2>Forgot password? 🔑</h2>
                  <p>Enter your email and we'll send you a reset link</p>
                </div>

                <AnimatePresence>
                  {apiError && (
                    <motion.div className="alert alert-error"
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
                      {apiError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="form-group">
                    <label className="form-label">Email address</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><FiMail /></span>
                      <input
                        {...register('email')}
                        type="email"
                        className={`form-input ${errors.email ? 'error-input' : ''}`}
                        placeholder="you@example.com"
                        autoFocus
                      />
                    </div>
                    {errors.email && <p className="form-error"><FiAlertCircle size={12} />{errors.email.message}</p>}
                  </div>

                  <motion.button type="submit" className="btn-primary" disabled={loading} whileTap={{ scale: 0.98 }}>
                    {loading ? <><div className="btn-spinner" /><span>Sending…</span></> : 'Send Reset Link'}
                  </motion.button>
                </form>

                <p className="auth-switch" style={{ marginTop: 20 }}>
                  <Link to="/login"><FiArrowLeft style={{ verticalAlign: 'middle', marginRight: 4 }} />Back to Login</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                className="success-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <motion.div className="success-icon"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}>
                  📧
                </motion.div>
                <h3>Check your inbox!</h3>
                <p>
                  We sent a password reset link to<br />
                  <strong style={{ color: 'var(--gray-800)' }}>{sentEmail}</strong><br /><br />
                  The link will expire in <strong>1 hour</strong>.
                </p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <Link to="/login">
                    <button className="btn-primary">
                      <FiArrowLeft style={{ marginRight: 6 }} /> Back to Login
                    </button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
