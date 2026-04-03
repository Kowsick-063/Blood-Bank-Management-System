import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiLogOut, FiDroplet, FiCalendar, FiHeart, FiAward, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import '../styles/dashboard.css'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function DonorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'D'

  const stats = [
    { icon: '🩸', label: 'Total Donations', value: '0', iconClass: 'red' },
    { icon: '📅', label: 'Last Donation', value: 'N/A', iconClass: 'blue' },
    { icon: '❤️', label: 'Lives Saved', value: '0', iconClass: 'red' },
    { icon: '🏆', label: 'Donor Level', value: 'New', iconClass: 'purple' },
  ]

  const actions = [
    { icon: '📋', label: 'Request Blood', desc: 'Submit a blood request for a patient', badge: null },
    { icon: '🩸', label: 'Donate Blood', desc: 'Schedule your next donation appointment', badge: 'Available' },
    { icon: '🏥', label: 'Find Blood Bank', desc: 'Locate nearby blood banks', badge: null },
    { icon: '📊', label: 'My History', desc: 'View your donation history', badge: null },
  ]

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="nav-brand-drop">🩸</span>
          Blood Bank
        </div>
        <div className="nav-actions">
          <span className={`nav-role-badge donor`}>Donor</span>
          <div className="nav-avatar">{initials}</div>
          <button className="btn-logout" onClick={handleLogout}>
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="dashboard-content">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          {/* Greeting */}
          <motion.div className="dashboard-greeting" variants={itemVariants}>
            <h1>Hello, {user?.name?.split(' ')[0]} 👋</h1>
            <p>Welcome to your donor dashboard. Every drop counts!</p>
          </motion.div>

          {/* Stats */}
          <motion.div className="stats-grid" variants={itemVariants}>
            {stats.map((s) => (
              <motion.div
                key={s.label}
                className="stat-card"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`stat-icon ${s.iconClass}`}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Profile + Actions */}
          <motion.div className="profile-section" variants={itemVariants}>
            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar">{initials}</div>
                <div className="profile-name">{user?.name}</div>
                <div className="profile-email">{user?.email}</div>
                {user?.blood_group && (
                  <div className="blood-badge">
                    <FiDroplet size={14} /> {user.blood_group}
                  </div>
                )}
              </div>
              <div className="profile-card-body">
                {[
                  { key: 'Age', val: user?.age ? `${user.age} years` : 'Not set' },
                  { key: 'Phone', val: user?.phone || 'Not set' },
                  { key: 'Blood Group', val: user?.blood_group || 'Not set' },
                  { key: 'Email Verified', val: user?.is_verified ? '✅ Verified' : '❌ Not Verified' },
                  { key: 'Member Since', val: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A' },
                ].map(f => (
                  <div key={f.key} className="profile-field">
                    <span className="profile-field-key">{f.key}</span>
                    <span className="profile-field-val">{f.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="actions-card">
              <div className="card-title">⚡ Quick Actions</div>
              <div className="action-items">
                {actions.map((a) => (
                  <motion.div
                    key={a.label}
                    className="action-item"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="action-item-icon">{a.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)' }}>{a.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{a.desc}</div>
                    </div>
                    {a.badge && (
                      <span style={{
                        background: '#f0fdf4', color: '#16a34a',
                        borderRadius: 99, padding: '2px 10px',
                        fontSize: 11, fontWeight: 600
                      }}>{a.badge}</span>
                    )}
                    <FiArrowRight className="action-item-arrow" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Info Banner */}
          <motion.div
            variants={itemVariants}
            style={{
              background: 'linear-gradient(135deg, #C0392B, #922B21)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 32px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              boxShadow: 'var(--shadow-red)',
            }}
          >
            <div style={{ fontSize: 48 }}>🩸</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                Ready to donate again?
              </div>
              <div style={{ fontSize: 14, opacity: 0.85 }}>
                You can donate blood every 56 days. Schedule your next appointment and save up to 3 lives!
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              style={{
                background: 'white', color: 'var(--primary)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                padding: '11px 24px', fontWeight: 700,
                fontSize: 14, cursor: 'pointer', flexShrink: 0,
              }}
            >
              Schedule Now →
            </motion.button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
