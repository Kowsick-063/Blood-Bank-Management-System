import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiLogOut, FiUsers, FiDroplet, FiShield, FiArrowRight, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import '../styles/dashboard.css'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

// Mock data for demo
const mockRequests = [
  { id: 1, name: 'Ravi Kumar', blood: 'O+', hospital: 'Apollo Hospital', units: 2, status: 'urgent' },
  { id: 2, name: 'Priya S.', blood: 'A-', hospital: 'AIIMS Delhi', units: 1, status: 'normal' },
  { id: 3, name: 'Ahmed Khan', blood: 'B+', hospital: 'Fortis', units: 3, status: 'fulfilled' },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A'

  const stats = [
    { icon: '👥', label: 'Total Donors', value: '0', iconClass: 'blue' },
    { icon: '🩸', label: 'Blood Units', value: '0', iconClass: 'red' },
    { icon: '📋', label: 'Requests', value: '0', iconClass: 'purple' },
    { icon: '✅', label: 'Fulfilled', value: '0', iconClass: 'green' },
  ]

  const actions = [
    { icon: '👥', label: 'Manage Donors', desc: 'View and manage donor accounts' },
    { icon: '🩸', label: 'Blood Inventory', desc: 'Track blood units by group' },
    { icon: '📋', label: 'Blood Requests', desc: 'Handle incoming blood requests' },
    { icon: '📊', label: 'Reports', desc: 'Generate system reports' },
    { icon: '🏥', label: 'Camp Management', desc: 'Manage blood donation camps' },
    { icon: '🔔', label: 'Notifications', desc: 'Send donor notifications' },
  ]

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="nav-brand-drop">🩸</span>
          Blood Bank
        </div>
        <div className="nav-actions">
          <span className="nav-role-badge admin">Admin</span>
          <div className="nav-avatar" style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)' }}>{initials}</div>
          <button className="btn-logout" onClick={handleLogout}>
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          <motion.div className="dashboard-greeting" variants={itemVariants}>
            <h1>Admin Panel 🛡️</h1>
            <p>Welcome back, {user?.name}. Manage your blood bank system.</p>
          </motion.div>

          {/* Stats */}
          <motion.div className="stats-grid" variants={itemVariants}>
            {stats.map((s) => (
              <motion.div key={s.label} className="stat-card" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <div className={`stat-icon ${s.iconClass}`}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Profile + Actions */}
          <motion.div className="profile-section" variants={itemVariants}>
            {/* Profile */}
            <div className="profile-card">
              <div className="profile-card-header" style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)' }}>
                <div className="profile-avatar" style={{ fontSize: 28 }}>{initials}</div>
                <div className="profile-name">{user?.name}</div>
                <div className="profile-email">{user?.email}</div>
                <div className="blood-badge" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <FiShield size={14} /> Administrator
                </div>
              </div>
              <div className="profile-card-body">
                {[
                  { key: 'Role', val: 'Administrator' },
                  { key: 'Email Verified', val: user?.is_verified ? '✅ Verified' : '❌ Not Verified' },
                  { key: 'Account Status', val: user?.is_approved ? '✅ Approved' : '⏳ Pending Approval' },
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
              <div className="card-title">⚙️ Admin Controls</div>
              <div className="action-items">
                {actions.map((a) => (
                  <motion.div key={a.label} className="action-item" whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                    <span className="action-item-icon">{a.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)' }}>{a.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{a.desc}</div>
                    </div>
                    <FiArrowRight className="action-item-arrow" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Requests Table */}
          <motion.div variants={itemVariants} className="actions-card" style={{ marginBottom: 0 }}>
            <div className="card-title">📋 Recent Blood Requests</div>
            <table className="info-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Blood Group</th>
                  <th>Hospital</th>
                  <th>Units</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockRequests.map((r) => (
                  <motion.tr key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: r.id * 0.1 }}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td>
                      <span style={{ background: '#fff0f0', color: 'var(--primary)', padding: '2px 10px', borderRadius: 99, fontWeight: 700, fontSize: 12 }}>
                        {r.blood}
                      </span>
                    </td>
                    <td>{r.hospital}</td>
                    <td>{r.units}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                        background: r.status === 'urgent' ? '#fff5f5' : r.status === 'fulfilled' ? '#f0fdf4' : '#fffbeb',
                        color: r.status === 'urgent' ? 'var(--error)' : r.status === 'fulfilled' ? 'var(--success)' : '#b45309',
                      }}>
                        {r.status === 'urgent' ? '🔴 Urgent' : r.status === 'fulfilled' ? '✅ Fulfilled' : '🟡 Normal'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
