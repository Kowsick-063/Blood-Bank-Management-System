import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// This page receives the token from Google OAuth redirect
export default function OAuthCallback() {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const navigate  = useNavigate()

  useEffect(() => {
    const token    = params.get('token')
    const redirect = params.get('redirect') || '/donor/dashboard'
    const error    = params.get('error')
    const userRaw  = params.get('user')

    if (error) {
      toast.error('Google sign-in failed. Please try again.')
      navigate('/login')
      return
    }

    if (!token) {
      toast.error('Authentication failed.')
      navigate('/login')
      return
    }

    try {
      const user = userRaw ? JSON.parse(decodeURIComponent(userRaw)) : {}
      login(user, token)
      toast.success(`Welcome, ${user.name || 'User'}!`)
      navigate(redirect, { replace: true })
    } catch {
      toast.error('Failed to process authentication.')
      navigate('/login')
    }
  }, [])

  return (
    <div className="page-loader">
      <div style={{ textAlign: 'center' }}>
        <div className="loader-drop" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Signing you in…</p>
      </div>
    </div>
  )
}
