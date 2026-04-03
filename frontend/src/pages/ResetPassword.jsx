import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'
import { authAPI } from '../services/api'
import AuthLeft from '../components/AuthLeft'
import '../styles/auth.css'

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword'],
})

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [showPass, setShowPass]   = useState(false)
  const [showConf, setShowConf]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [apiError, setApiError]   = useState('')
  const [done, setDone]           = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ password }) => {
    if (!token) { setApiError('Invalid or expired reset link.'); return }
    setLoading(true)
    setApiError('')
    try {
      await authAPI.resetPassword({ token, password })
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Reset failed. Link may have expired.')
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
            {!done ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="auth-header">
                  <h2>Reset password 🔒</h2>
                  <p>Create a new secure password for your account</p>
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

                {!token && (
                  <div className="alert alert-error">
                    <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
                    Invalid reset link. Please request a new one.
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><FiLock /></span>
                      <input
                        {...register('password')}
                        type={showPass ? 'text' : 'password'}
                        className={`form-input ${errors.password ? 'error-input' : ''}`}
                        placeholder="Min. 6 characters"
                        autoFocus
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPass(p => !p)}>
                        {showPass ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.password && <p className="form-error"><FiAlertCircle size={12} />{errors.password.message}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><FiLock /></span>
                      <input
                        {...register('confirmPassword')}
                        type={showConf ? 'text' : 'password'}
                        className={`form-input ${errors.confirmPassword ? 'error-input' : ''}`}
                        placeholder="Re-enter password"
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowConf(p => !p)}>
                        {showConf ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="form-error"><FiAlertCircle size={12} />{errors.confirmPassword.message}</p>}
                  </div>

                  <motion.button type="submit" className="btn-primary" disabled={loading || !token} whileTap={{ scale: 0.98 }}>
                    {loading ? <><div className="btn-spinner" /><span>Resetting…</span></> : 'Reset Password'}
                  </motion.button>
                </form>

                <p className="auth-switch" style={{ marginTop: 20 }}>
                  <Link to="/login">← Back to Login</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="done" className="success-state"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
                <motion.div className="success-icon"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}>
                  🎉
                </motion.div>
                <h3>Password Updated!</h3>
                <p>Your password has been reset successfully.<br />Redirecting to login…</p>
                <div className="btn-spinner" style={{ margin: '16px auto', borderColor: 'var(--primary)', borderTopColor: 'var(--primary)' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
