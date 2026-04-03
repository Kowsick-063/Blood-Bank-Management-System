import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  FiUser, FiMail, FiLock, FiPhone, FiCalendar,
  FiEye, FiEyeOff, FiAlertCircle, FiDroplet
} from 'react-icons/fi'
import { authAPI } from '../services/api'
import AuthLeft from '../components/AuthLeft'
import '../styles/auth.css'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const donorSchema = z.object({
  name:          z.string().min(2, 'Name must be at least 2 characters'),
  age:           z.coerce.number().min(18, 'Must be at least 18').max(65, 'Must be 65 or below'),
  blood_group:   z.string().min(1, 'Select a blood group'),
  phone:         z.string().min(7, 'Enter a valid phone number'),
  email:         z.string().email('Enter a valid email'),
  password:      z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword']
})

const adminSchema = z.object({
  name:          z.string().min(2, 'Name must be at least 2 characters'),
  email:         z.string().email('Enter a valid email'),
  password:      z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword']
})

function getStrength(password) {
  if (!password) return { level: 0, label: '', cls: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const levels = [
    { label: '', cls: '' },
    { label: 'Weak', cls: 'weak' },
    { label: 'Fair', cls: 'fair' },
    { label: 'Good', cls: 'good' },
    { label: 'Strong', cls: 'strong' },
  ]
  return { level: score, ...levels[score] }
}

export default function Signup() {
  const navigate = useNavigate()
  const [role, setRole]           = useState('donor')
  const [showPass, setShowPass]   = useState(false)
  const [showConf, setShowConf]   = useState(false)
  const [apiError, setApiError]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [password, setPassword]   = useState('')

  const strength = getStrength(password)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(role === 'donor' ? donorSchema : adminSchema),
  })

  // Watch password for strength meter
  const watchedPass = watch('password', '')
  useEffect(() => { setPassword(watchedPass || '') }, [watchedPass])

  const handleRoleChange = (r) => {
    setRole(r)
    setApiError('')
    reset()
    setPassword('')
  }

  const onSubmit = async (data) => {
    setApiError('')
    setLoading(true)
    try {
      const payload = { ...data, role }
      delete payload.confirmPassword
      await authAPI.signup(payload)
      toast.success('Account created! Check your email for the OTP.')
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`

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
          <div className="auth-header">
            <h2>Create account ✨</h2>
            <p>Join the blood bank network today</p>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs">
            {['donor', 'admin'].map(r => (
              <button
                key={r}
                type="button"
                className={`role-tab ${role === r ? 'active' : ''}`}
                onClick={() => handleRoleChange(r)}
              >
                <span className="role-tab-icon">{r === 'donor' ? '🩸' : '🛡️'}</span>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Admin note */}
          <AnimatePresence>
            {role === 'admin' && (
              <motion.div
                className="alert alert-info"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                Admin accounts require approval before login access is granted.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error alert */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                className="alert alert-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name <span>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon"><FiUser /></span>
                <input
                  {...register('name')}
                  type="text"
                  className={`form-input ${errors.name ? 'error-input' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="form-error"><FiAlertCircle size={12} />{errors.name.message}</p>}
            </div>

            {/* Donor-only fields */}
            <AnimatePresence>
              {role === 'donor' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Age + Blood Group */}
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Age <span>*</span></label>
                      <div className="input-wrapper">
                        <span className="input-icon"><FiCalendar /></span>
                        <input
                          {...register('age')}
                          type="number"
                          className={`form-input ${errors.age ? 'error-input' : ''}`}
                          placeholder="25"
                          min="18" max="65"
                        />
                      </div>
                      {errors.age && <p className="form-error"><FiAlertCircle size={12} />{errors.age.message}</p>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Blood Group <span>*</span></label>
                      <div className="input-wrapper">
                        <span className="input-icon"><FiDroplet /></span>
                        <select
                          {...register('blood_group')}
                          className={`form-select ${errors.blood_group ? 'error-input' : ''}`}
                        >
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      {errors.blood_group && <p className="form-error"><FiAlertCircle size={12} />{errors.blood_group.message}</p>}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label className="form-label">Phone Number <span>*</span></label>
                    <div className="input-wrapper">
                      <span className="input-icon"><FiPhone /></span>
                      <input
                        {...register('phone')}
                        type="tel"
                        className={`form-input ${errors.phone ? 'error-input' : ''}`}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    {errors.phone && <p className="form-error"><FiAlertCircle size={12} />{errors.phone.message}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email address <span>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon"><FiMail /></span>
                <input
                  {...register('email')}
                  type="email"
                  className={`form-input ${errors.email ? 'error-input' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="form-error"><FiAlertCircle size={12} />{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password <span>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon"><FiLock /></span>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error-input' : ''}`}
                  placeholder="Min. 6 characters"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="form-error"><FiAlertCircle size={12} />{errors.password.message}</p>}
              {/* Strength meter */}
              {password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className={`strength-bar ${i <= strength.level ? strength.cls : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`strength-label ${strength.cls}`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password <span>*</span></label>
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

            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              style={{ marginTop: 4 }}
            >
              {loading
                ? <><div className="btn-spinner" /><span>Creating account…</span></>
                : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`
              }
            </motion.button>
          </form>

          <div className="divider">or</div>

          <motion.a href={`${GOOGLE_AUTH_URL}?role=${role}`} whileTap={{ scale: 0.98 }}>
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

          <p className="auth-switch">
            Already have an account?
            <Link to="/login"> Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
