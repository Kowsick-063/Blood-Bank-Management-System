// Animated left panel used across all auth pages
import { motion } from 'framer-motion'

const drops = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: 40 + Math.random() * 80,
  left: 5 + Math.random() * 90,
  delay: Math.random() * 8,
  duration: 10 + Math.random() * 10,
}))

const features = [
  { icon: '🩸', title: 'Safe & Secure', desc: 'End-to-end encrypted data' },
  { icon: '🏥', title: 'Hospital Network', desc: 'Connected to 200+ hospitals' },
  { icon: '⚡', title: 'Instant Match', desc: 'Real-time donor matching' },
]

export default function AuthLeft({ title, subtitle }) {
  return (
    <div className="auth-left">
      {/* Animated BG drops */}
      <div className="bg-drops">
        {drops.map(d => (
          <div
            key={d.id}
            className="bg-drop"
            style={{
              width: d.size,
              height: d.size * 1.2,
              left: `${d.left}%`,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Brand */}
      <motion.div
        className="auth-brand"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="brand-icon">
          <span className="brand-drop">🩸</span>
        </div>
        <h1>Blood Bank</h1>
        <p>Connecting donors and saving lives with smart blood management</p>
      </motion.div>

      {/* Features */}
      <div className="auth-features">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="auth-feature-item"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
          >
            <span className="auth-feature-icon">{f.icon}</span>
            <div className="auth-feature-text">
              <strong>{f.title}</strong>
              <span>{f.desc}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="auth-left-footer">© 2025 Blood Bank Management System</p>
    </div>
  )
}
