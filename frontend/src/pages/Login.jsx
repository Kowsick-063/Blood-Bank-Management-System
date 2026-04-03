import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import AuthLeft from '../components/AuthLeft'
import '../styles/auth.css'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [role, setRole]           = useState('donor')
  const [showPass, setShowPass]   = useState(false)
  const [apiError, setApiError]   = useState('')
  const [loading, setLoading]     = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setApiError('')
    setLoading(true)
    try {
      const res = await authAPI.login({ ...data, role })
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate(role === 'admin' ? '/admin/dashboard' : '/donor/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      if (msg.includes('verify')) {
        setApiError(msg)
        setTimeout(() => navigate(`/verify-email?email=${data.email}`), 2000)
      } else {
        setApiError(msg)
      }
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
          {/* Header */}
          <div className="auth-header">
            <h2>Welcome back 👋</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs">
            {['donor', 'admin'].map(r => (
              <button
                key={r}
                type="button"
                className={`role-tab ${role === r ? 'active' : ''}`}
                onClick={() => { setRole(r); setApiError('') }}
              >
                <span className="role-tab-icon">{r === 'donor' ? '🩸' : '🛡️'}</span>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Error alert */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                className="alert alert-error"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon"><FiMail /></span>
                <input
                  {...register('email')}
                  type="email"
                  className={`form-input ${errors.email ? 'error-input' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="form-error"><FiAlertCircle size={12} />{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><FiLock /></span>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error-input' : ''}`}
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error"><FiAlertCircle size={12} />{errors.password.message}</p>
              )}
            </div>

            {/* Forgot */}
            <div className="forgot-row">
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <><div className="btn-spinner" /><span>Signing in…</span></> : 'Sign In'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="divider">or</div>

          {/* Google */}
          <motion.a
            href={`${GOOGLE_AUTH_URL}?role=${role}`}
            whileTap={{ scale: 0.98 }}
          >
            <button type="button" className="btn-google">
              <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9L38 9.7C34.4 6.5 29.5 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c11 0 20.5-8 20.5-20.5 0-1.4-.1-2.7-.4-5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9L38 9.7C34.4 6.5 29.5 4.5 24 4.5c-7.5 0-14 4.1-17.7 10.2z"/>
                <path fill="#4CAF50" d="M24 45.5c5.4 0 10.2-1.9 13.8-5l-6.4-5.3C29.5 37 26.9 38 24 38c-5.2 0-9.6-3-11.4-7.4l-6.5 5C9.9 41.4 16.5 45.5 24 45.5z"/>
                <path fill="#1565C0" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.5 5.8l6.4 5.3c3.8-3.5 6.3-8.7 6.3-15.1 0-1.4-.1-2.7-.4-4z"/>
              </svg>
              Continue with Google
            </button>
          </motion.a>

          {/* Switch */}
          <p className="auth-switch">
            Don't have an account?
            <Link to="/signup"> Create account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
