import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DonorDashboard from './pages/DonorDashboard'
import OAuthCallback from './pages/OAuthCallback'
import AdminDashboard from './pages/AdminDashboard'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="loader-drop" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/donor/dashboard'} replace />
  }
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="loader-drop" /></div>
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/donor/dashboard'} replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />

      {/* Protected routes */}
      <Route path="/donor/dashboard" element={
        <ProtectedRoute allowedRoles={['donor']}><DonorDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
