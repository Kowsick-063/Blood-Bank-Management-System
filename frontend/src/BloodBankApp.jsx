// BloodBankApp.jsx — BLOOD BEE Blood Bank Management System
// React + Tailwind (core utilities only) — No external dependencies beyond lucide-react

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Droplets, Users, UserPlus, ClipboardList,
  FilePlus, FolderOpen, ShieldCheck, BarChart3, User,
  Bell, LogOut, ChevronRight, Search, Filter, Check, X,
  AlertTriangle, TrendingUp, Activity, Package, ChevronDown,
  Eye, EyeOff, Edit, Trash2, Plus, Minus, RefreshCw, CheckCircle,
  XCircle, Clock, ArrowUpDown, Mail, Send, MapPin, UserCheck
} from "lucide-react";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const INITIAL_INVENTORY = [
  { group: "A+",  units: 80,  max: 120 },
  { group: "A-",  units: 3,   max: 40  },
  { group: "B+",  units: 72,  max: 120 },
  { group: "B-",  units: 2,   max: 20  },
  { group: "O+",  units: 110, max: 150 },
  { group: "O-",  units: 1,   max: 30  },
  { group: "AB+", units: 40,  max: 60  },
  { group: "AB-", units: 4,   max: 15  },
];

const INITIAL_DONORS = [
  { id: "DN001423", name: "Ramesh Kumar",  bg: "O+",  age: 34, gender: "Male",   city: "Coimbatore", phone: "****5621", email: "ramesh.k@email.com",   lastDonation: "2024-11-01", available: true  },
  { id: "DN002104", name: "Priya Devi",    bg: "A+",  age: 28, gender: "Female", city: "Chennai",    phone: "****8832", email: "priya.d@email.com",    lastDonation: "2024-10-12", available: true  },
  { id: "DN003892", name: "Arjun Nair",    bg: "B+",  age: 42, gender: "Male",   city: "Madurai",    phone: "****2244", email: "arjun.n@email.com",    lastDonation: "2024-09-05", available: false },
  { id: "DN004211", name: "Lakshmi Rao",   bg: "AB+", age: 31, gender: "Female", city: "Coimbatore", phone: "****7711", email: "lakshmi.r@email.com",  lastDonation: "2024-12-20", available: true  },
  { id: "DN005037", name: "Vijay Anand",   bg: "O-",  age: 25, gender: "Male",   city: "Salem",      phone: "****9900", email: "vijay.a@email.com",    lastDonation: "2024-08-14", available: true  },
  { id: "DN006654", name: "Meena Kumari",  bg: "B-",  age: 37, gender: "Female", city: "Trichy",     phone: "****4433", email: "meena.k@email.com",    lastDonation: "2024-11-30", available: false },
  { id: "DN007112", name: "Karthik Raja",  bg: "A-",  age: 29, gender: "Male",   city: "Coimbatore", phone: "****6610", email: "karthik.r@email.com",  lastDonation: "2025-01-02", available: true  },
  { id: "DN008345", name: "Sunita Sharma", bg: "O+",  age: 33, gender: "Female", city: "Chennai",    phone: "****3392", email: "sunita.s@email.com",   lastDonation: "2024-12-05", available: true  },
  { id: "DN009100", name: "Deepak Raj",    bg: "O+",  age: 30, gender: "Male",   city: "Coimbatore", phone: "****1234", email: "deepak.r@email.com",   lastDonation: "2024-12-15", available: true  },
  { id: "DN009201", name: "Anitha Balan",  bg: "A+",  age: 27, gender: "Female", city: "Coimbatore", phone: "****5678", email: "anitha.b@email.com",   lastDonation: "2025-01-05", available: true  },
  { id: "DN009302", name: "Suresh Menon",  bg: "B+",  age: 35, gender: "Male",   city: "Chennai",    phone: "****9876", email: "suresh.m@email.com",   lastDonation: "2024-11-20", available: true  },
  { id: "DN009403", name: "Kavitha Iyer",  bg: "O-",  age: 26, gender: "Female", city: "Coimbatore", phone: "****4321", email: "kavitha.i@email.com",  lastDonation: "2024-10-30", available: true  },
];

const INITIAL_REQUESTS = [
  { id: "REQ-001842", patient: "Kavya Priya",   bg: "O-",  units: 2, hospital: "PSG Hospitals",    doctor: "Dr. Meena", contact: "9876543210", urgency: "Critical", reason: "Emergency surgery",       status: "Pending",  adminNote: "", date: "2025-01-15", userId: 2, city: "Coimbatore", notifiedDonors: [] },
  { id: "REQ-001839", patient: "Suresh Babu",   bg: "AB+", units: 1, hospital: "KG Hospital",       doctor: "Dr. Raj",   contact: "9876543211", urgency: "Urgent",   reason: "Post-op transfusion",     status: "Pending",  adminNote: "", date: "2025-01-15", userId: 3, city: "Coimbatore", notifiedDonors: [] },
  { id: "REQ-001831", patient: "Divya R",        bg: "A+",  units: 3, hospital: "KMCH",              doctor: "Dr. Priya", contact: "9876543212", urgency: "Normal",   reason: "Scheduled surgery",       status: "Approved", adminNote: "Collect from ward 4", date: "2025-01-14", userId: 2, city: "Chennai", notifiedDonors: [{ id: "DN002104", name: "Priya Devi", bg: "A+" }] },
  { id: "REQ-001820", patient: "Murugan T",      bg: "B+",  units: 2, hospital: "Apollo Hospitals",  doctor: "Dr. Kumar", contact: "9876543213", urgency: "Urgent",   reason: "Trauma",                  status: "Approved", adminNote: "Urgent priority", date: "2025-01-14", userId: 3, city: "Chennai", notifiedDonors: [{ id: "DN009302", name: "Suresh Menon", bg: "B+" }] },
  { id: "REQ-001811", patient: "Rekha Devi",     bg: "O+",  units: 4, hospital: "SIMS Hospital",     doctor: "Dr. Anand", contact: "9876543214", urgency: "Critical", reason: "Internal bleeding",       status: "Rejected", adminNote: "Insufficient O+ stock", date: "2025-01-13", userId: 2, city: "Coimbatore", notifiedDonors: [{ id: "DN001423", name: "Ramesh Kumar", bg: "O+" }, { id: "DN009100", name: "Deepak Raj", bg: "O+" }] },
  { id: "REQ-001800", patient: "Anand Kumar",    bg: "A-",  units: 1, hospital: "Ganga Hospital",    doctor: "Dr. Nair",  contact: "9876543215", urgency: "Normal",   reason: "Anemia treatment",        status: "Approved", adminNote: "", date: "2025-01-13", userId: 3, city: "Coimbatore", notifiedDonors: [{ id: "DN007112", name: "Karthik Raja", bg: "A-" }] },
];

const INITIAL_USERS = [
  { id: 1, name: "Admin User",   email: "admin@bloodbee.in",   role: "admin",     phone: "+91 98765 43210", city: "Coimbatore", joined: "2024-01-10" },
  { id: 2, name: "Dr. Ramesh",   email: "ramesh@hospital.com", role: "recipient", phone: "+91 94321 00001", city: "Chennai",    joined: "2024-03-15" },
  { id: 3, name: "Priya Devi",   email: "priya.d@email.com",   role: "donor",     phone: "+91 87654 32109", city: "Madurai",    joined: "2024-05-22", bg: "A+" },
  { id: 4, name: "Karthik Raja", email: "karthik@blood.org",   role: "admin",     phone: "+91 76543 21098", city: "Coimbatore", joined: "2024-07-01" },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, msg: "Your blood request REQ-001831 has been approved. Collect 3 units of A+ from ward 4.", type: "success", time: "2 hours ago",  read: false },
  { id: 2, msg: "ALERT: O- stock critically low — only 1 unit remaining.", type: "danger",  time: "5 hours ago", read: false },
  { id: 3, msg: "New donor DN007112 (Karthik Raja, A-) registered in Coimbatore.", type: "info",    time: "1 day ago",   read: false },
  { id: 4, msg: "Your request REQ-001811 was rejected. Reason: Insufficient O+ stock.", type: "danger", time: "2 days ago",  read: true  },
  { id: 5, msg: "📧 Donor alert: 2 donors notified for REQ-001811 (O+ in Coimbatore).", type: "info", time: "2 days ago", read: true },
];

const ACTIVITY_DATA = [
  { day: "Mon", donors: 12, requests: 4 }, { day: "Tue", donors: 8,  requests: 7 },
  { day: "Wed", donors: 15, requests: 5 }, { day: "Thu", donors: 6,  requests: 3 },
  { day: "Fri", donors: 19, requests: 9 }, { day: "Sat", donors: 22, requests: 6 },
  { day: "Sun", donors: 11, requests: 3 },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

const getStockStatus = (units) => {
  if (units < 5)  return { label: "Critical", color: "#b91c1c", bg: "#fee2e2", textColor: "#7f1d1d" };
  if (units < 15) return { label: "Low",      color: "#d97706", bg: "#fef3c7", textColor: "#78350f" };
  return                  { label: "OK",       color: "#16a34a", bg: "#dcfce7", textColor: "#14532d" };
};

const bgPillStyle = (group) => {
  const map = {
    "A+": { bg: "#fee2e2", color: "#7f1d1d" }, "A-": { bg: "#fee2e2", color: "#7f1d1d" },
    "B+": { bg: "#dbeafe", color: "#1e3a5f" }, "B-": { bg: "#dbeafe", color: "#1e3a5f" },
    "O+": { bg: "#dcfce7", color: "#14532d" }, "O-": { bg: "#dcfce7", color: "#14532d" },
    "AB+":{ bg: "#f3e8ff", color: "#4c1d95" }, "AB-":{ bg: "#f3e8ff", color: "#4c1d95" },
  };
  return map[group] || { bg: "#f1f5f9", color: "#334155" };
};

const urgencyStyle = (u) => ({
  Critical: { color: "#b91c1c", bg: "#fee2e2" },
  Urgent:   { color: "#c2410c", bg: "#ffedd5" },
  Normal:   { color: "#64748b", bg: "#f1f5f9" },
}[u] || { color: "#64748b", bg: "#f1f5f9" });

const statusStyle = (s) => ({
  Approved: { color: "#15803d", bg: "#dcfce7" },
  Rejected: { color: "#b91c1c", bg: "#fee2e2" },
  Pending:  { color: "#b45309", bg: "#fef3c7" },
}[s] || { color: "#64748b", bg: "#f1f5f9" });

const initials = (name) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const genId = (prefix) => prefix + Math.floor(100000 + Math.random() * 900000);

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────

const C = {
  crimson: "#b91c1c", crimsonDark: "#7f1d1d", crimsonLight: "#fee2e2",
  crimsonMid: "#ef4444", gold: "#f59e0b", goldLight: "#fef3c7",
  green: "#16a34a", greenLight: "#dcfce7",
  blue: "#1d4ed8", blueLight: "#dbeafe",
  surface: "#f8fafc", surface2: "#f1f5f9",
  border: "#e2e8f0", borderMid: "#cbd5e1",
  text: "#0f172a", textMuted: "#64748b", textLight: "#94a3b8",
};

// ─── BASE COMPONENTS ────────────────────────────────────────────────────────

const Card = ({ children, style = {}, className = "" }) => (
  <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", ...style }} className={className}>
    {children}
  </div>
);

const Badge = ({ children, status }) => {
  const s = status === "Approved" ? statusStyle("Approved")
          : status === "Rejected" ? statusStyle("Rejected")
          : status === "Pending"  ? statusStyle("Pending")
          : status === "Critical" ? urgencyStyle("Critical")
          : status === "Urgent"   ? urgencyStyle("Urgent")
          : status === "success"  ? { bg: "#dcfce7", color: "#15803d" }
          : status === "danger"   ? { bg: "#fee2e2", color: "#b91c1c" }
          : status === "info"     ? { bg: "#dbeafe", color: "#1e40af" }
          : status === "warning"  ? { bg: "#fef3c7", color: "#92400e" }
          : { bg: C.surface2, color: C.textMuted };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
};

const BloodGroupPill = ({ group }) => {
  const s = bgPillStyle(group);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", fontWeight: 800, fontSize: 11, fontFamily: "system-ui", background: s.bg, color: s.color, flexShrink: 0 }}>
      {group}
    </span>
  );
};

const Btn = ({ children, variant = "outline", onClick, size = "md", disabled = false, style = {} }) => {
  const base = { padding: size === "sm" ? "5px 12px" : "9px 18px", borderRadius: 8, fontSize: size === "sm" ? 12 : 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", transition: "opacity 0.15s", opacity: disabled ? 0.5 : 1, ...style };
  const variants = {
    primary: { background: C.crimson, color: "#fff" },
    success: { background: C.green, color: "#fff" },
    danger:  { background: C.crimson, color: "#fff" },
    gold:    { background: C.gold, color: C.crimsonDark },
    outline: { background: "transparent", border: `1px solid ${C.border}`, color: C.text },
    ghost:   { background: "transparent", border: "none", color: C.textMuted },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>;
};

const Input = ({ label, required, type = "text", ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPwd = type === "password";
  const inputType = isPwd && showPwd ? "text" : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}{required && <span style={{ color: C.crimson }}> *</span>}</label>}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input style={{ padding: "9px 12px", paddingRight: isPwd ? 36 : 12, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, color: C.text, outline: "none", background: "#fff", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} type={inputType} {...props} />
        {isPwd && (
          <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: 8, background: "transparent", border: "none", cursor: "pointer", color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

const Select = ({ label, required, children, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}{required && <span style={{ color: C.crimson }}> *</span>}</label>}
    <select style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, color: C.text, outline: "none", background: "#fff", fontFamily: "inherit" }} {...props}>{children}</select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</label>}
    <textarea style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, color: C.text, outline: "none", background: "#fff", fontFamily: "inherit", resize: "vertical", minHeight: 76 }} {...props} />
  </div>
);

const StatCard = ({ label, value, note, accent = C.crimson, icon: Icon }) => (
  <Card style={{ padding: "18px 20px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: "12px 12px 0 0" }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: "4px 0 2px", fontFamily: "system-ui" }}>{value}</div>
        {note && <div style={{ fontSize: 11, color: C.textLight }}>{note}</div>}
      </div>
      {Icon && <div style={{ width: 36, height: 36, borderRadius: 8, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={18} color={accent} /></div>}
    </div>
  </Card>
);

const Alert = ({ type, children }) => {
  const styles = {
    warning: { bg: "#fef3c7", border: "#f59e0b", color: "#78350f" },
    danger:  { bg: "#fee2e2", border: "#ef4444", color: "#7f1d1d" },
    success: { bg: "#dcfce7", border: "#22c55e", color: "#14532d" },
    info:    { bg: "#dbeafe", border: "#3b82f6", color: "#1e3a8a" },
  };
  const s = styles[type] || styles.info;
  return (
    <div style={{ padding: "10px 14px", borderRadius: 8, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 13, display: "flex", alignItems: "flex-start", gap: 8 }}>
      <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
};

const Modal = ({ open, onClose, title, children, width }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: width || 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Table = ({ headers, children }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>{headers.map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.6px", color: C.textMuted, background: C.surface2, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const Tr = ({ children, onClick }) => (
  <tr onClick={onClick} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.1s", cursor: onClick ? "pointer" : "default" }}
    onMouseEnter={e => e.currentTarget.style.background = C.surface2}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
    {children}
  </tr>
);

const Td = ({ children, style = {} }) => <td style={{ padding: "11px 14px", verticalAlign: "middle", color: C.text, ...style }}>{children}</td>;

const BarChart = ({ data, valueKey, color, label }) => {
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 130, paddingTop: 8 }}>
      {data.map(d => (
        <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: C.text }}>{d[valueKey]}</span>
          <div style={{ width: "100%", background: color, borderRadius: "4px 4px 0 0", height: Math.max(8, (d[valueKey] / max) * 90) }} />
          <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
};

const ProgressBar = ({ value, max, color }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ height: 5, background: C.surface2, borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.5s" }} />
    </div>
  );
};

// ─── PAGE COMPONENTS ────────────────────────────────────────────────────────

// LOGIN
const LoginPage = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState("admin"); // "admin", "donor", "recipient"
  const [email, setEmail] = useState("admin@bloodbee.in");
  const [pwd, setPwd] = useState("admin123");
  const [view, setView] = useState("login"); // "login", "register", "forgot"
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "", city: "", role: "recipient", bg: "" });

  const [fStep, setFStep] = useState(1);
  const [fEmail, setFEmail] = useState("");
  const [fOtp, setFOtp] = useState("");
  const [fGeneratedOtp] = useState("1234");
  const [fPwd, setFPwd] = useState("");
  const [fConfirmPwd, setFConfirmPwd] = useState("");

  const switchLoginMode = (mode) => {
    setLoginMode(mode);
    if (mode === "admin") { setEmail("admin@bloodbee.in"); }
    else if (mode === "recipient") { setEmail("ramesh@hospital.com"); }
    else { setEmail("priya.d@email.com"); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 50%, #0f172a 100%)", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 40, width: "100%", maxWidth: view === "register" ? 500 : 460, boxShadow: "0 24px 64px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 28 }}>🐝</span>
          <div style={{ fontWeight: 800, fontSize: 26, color: C.crimson, fontFamily: "system-ui", letterSpacing: -0.5 }}>BLOOD BEE</div>
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24, marginTop: 2 }}>Blood Bank Management System</div>

        {view === "login" && (
          <>
            {/* Role Toggle */}
            <div style={{ display: "flex", background: C.surface2, borderRadius: 10, padding: 4, gap: 4, marginBottom: 22 }}>
              {[
                { id: "admin", label: "🛡️ Admin", desc: "Manage Bank" },
                { id: "recipient", label: "🏥 Recipient", desc: "Request Blood" },
                { id: "donor", label: "🩸 Donor", desc: "Donate Blood" }
              ].map(mode => (
                <button key={mode.id} onClick={() => switchLoginMode(mode.id)} style={{ flex: 1, padding: "10px 4px", borderRadius: 8, border: "none", background: loginMode === mode.id ? "#fff" : "transparent", boxShadow: loginMode === mode.id ? "0 2px 8px rgba(0,0,0,0.1)" : "none", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: loginMode === mode.id ? C.crimson : C.textMuted }}>{mode.label}</div>
                  <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>{mode.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 20 }}>Sign In as {loginMode === "admin" ? "Admin" : loginMode === "recipient" ? "Recipient" : "Donor"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
              <Input label="Password" type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" />
            </div>
            <Btn variant="primary" onClick={() => onLogin({ id: loginMode === "admin" ? 1 : loginMode === "recipient" ? 2 : 3, name: loginMode === "admin" ? "Admin User" : loginMode === "recipient" ? "Dr. Ramesh" : "Priya Devi", email, role: loginMode, bg: loginMode === "donor" ? "A+" : undefined })} style={{ width: "100%", marginTop: 20, padding: "12px", fontSize: 14 }}>
              Sign In →
            </Btn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <div style={{ fontSize: 13, color: C.textMuted }}>
                No account? <span onClick={() => setView("register")} style={{ color: C.crimson, cursor: "pointer", fontWeight: 600 }}>Register</span>
              </div>
              <div onClick={() => setView("forgot")} style={{ fontSize: 13, color: C.blue, cursor: "pointer", fontWeight: 600 }}>
                Forgot Password?
              </div>
            </div>
          </>
        )}

        {view === "register" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 20, color: C.text, marginBottom: 20 }}>Create {loginMode === "admin" ? "Admin" : loginMode === "donor" ? "Donor" : "Recipient"} Account</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Full Name" required placeholder="Dr. Ramesh Kumar" onChange={e => setForm({...form, name: e.target.value})} />
              <Input label="Email" required type="email" placeholder="you@example.com" onChange={e => setForm({...form, email: e.target.value})} />
              <Input label="Password" required type="password" placeholder="Min 8 characters" onChange={e => setForm({...form, password: e.target.value})} />
              <Input label="Confirm Password" required type="password" placeholder="Re-enter password" onChange={e => setForm({...form, confirmPassword: e.target.value})} />
              <Input label="Mobile Num" type="tel" placeholder="+91 98765 43210" onChange={e => setForm({...form, phone: e.target.value})} />
              <Input label="Location (City)" required placeholder="Coimbatore" onChange={e => setForm({...form, city: e.target.value})} />
              {loginMode === "donor" && (
                <Select label="Blood Group" required value={form.bg} onChange={e => setForm({...form, bg: e.target.value})}>
                  <option value="">Select</option>
                  {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
              )}
            </div>
            <Btn variant="primary" onClick={() => {
              if(!form.name || !form.email || !form.city || !form.password || (loginMode === "donor" && !form.bg)) return alert("Fill required fields");
              if(form.password !== form.confirmPassword) return alert("Passwords do not match!");
              onLogin({ id: Date.now(), name: form.name, email: form.email, role: loginMode, city: form.city, bg: form.bg, phone: form.phone, isNew: true });
            }} style={{ width: "100%", marginTop: 20, padding: "12px", fontSize: 14 }}>
              Create Account →
            </Btn>
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.textMuted }}>
              Already have an account?{" "}
              <span onClick={() => setView("login")} style={{ color: C.crimson, cursor: "pointer", fontWeight: 600 }}>Sign in</span>
            </div>
          </>
        )}

        {view === "forgot" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 20, color: C.text, marginBottom: 20 }}>Reset Password</div>
            {fStep === 1 && (
              <>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>Enter your email and we'll send you an OTP to reset your password.</div>
                <Input label="Email Address" type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="Enter your email" />
                <Btn variant="primary" onClick={() => {
                  if (!fEmail) return alert("Please enter email");
                  alert("OTP Sent to " + fEmail + " (Mock OTP: 1234)");
                  setFStep(2);
                }} style={{ width: "100%", marginTop: 20, padding: "12px", fontSize: 14 }}>Send OTP</Btn>
              </>
            )}
            {fStep === 2 && (
              <>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>Enter the 4-digit OTP sent to {fEmail}.</div>
                <Input label="Enter OTP" value={fOtp} onChange={e => setFOtp(e.target.value)} placeholder="1234" />
                <Btn variant="primary" onClick={() => {
                  if (fOtp !== fGeneratedOtp) return alert("Invalid OTP! Try 1234");
                  setFStep(3);
                }} style={{ width: "100%", marginTop: 20, padding: "12px", fontSize: 14 }}>Verify OTP</Btn>
              </>
            )}
            {fStep === 3 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Input label="New Password" type="password" value={fPwd} onChange={e => setFPwd(e.target.value)} placeholder="Min 8 chars" />
                  <Input label="Confirm Password" type="password" value={fConfirmPwd} onChange={e => setFConfirmPwd(e.target.value)} placeholder="Confirm new password" />
                </div>
                <Btn variant="primary" onClick={() => {
                  if (!fPwd || fPwd !== fConfirmPwd) return alert("Passwords do not match!");
                  alert("Password updated successfully!");
                  setView("login");
                  setFStep(1); setFOtp(""); setFPwd(""); setFConfirmPwd(""); setFEmail("");
                }} style={{ width: "100%", marginTop: 20, padding: "12px", fontSize: 14 }}>Update Password</Btn>
              </>
            )}
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 13 }}>
              <span onClick={() => { setView("login"); setFStep(1); }} style={{ color: C.textMuted, cursor: "pointer", fontWeight: 600 }}>← Back to Login</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ADMIN DASHBOARD
const Dashboard = ({ inventory, donors, requests, onNavigate }) => {
  const critical = inventory.filter(i => i.units < 5);
  const pending = requests.filter(r => r.status === "Pending");
  const approved = requests.filter(r => r.status === "Approved");
  const availDonors = donors.filter(d => d.available);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>Dashboard</h2>
        <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>Blood bank overview & critical alerts</p>
      </div>

      {critical.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Alert type="danger">
            <strong>Critical Stock:</strong> {critical.map(i => `${i.group} (${i.units}u)`).join(", ")} — immediate restocking required.
          </Alert>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Donors" value={donors.length} note={`${availDonors.length} available`} accent={C.crimson} icon={Users} />
        <StatCard label="Total Requests" value={requests.length} note={`${pending.length} pending`} accent={C.blue} icon={ClipboardList} />
        <StatCard label="Pending Approval" value={pending.length} note={`${requests.filter(r=>r.urgency==="Critical"&&r.status==="Pending").length} critical`} accent={C.gold} icon={Clock} />
        <StatCard label="Approved" value={approved.length} note="requests fulfilled" accent={C.green} icon={CheckCircle} />
        <StatCard label="Available Donors" value={availDonors.length} note={`${Math.round(availDonors.length/donors.length*100)}% availability`} accent="#7c3aed" icon={UserPlus} />
        <StatCard label="Critical Stock" value={critical.length} note="blood groups < 5 units" accent="#ea580c" icon={AlertTriangle} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Blood Inventory</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>All 8 blood groups</div>
            </div>
            <Btn variant="outline" size="sm" onClick={() => onNavigate("inventory")}>View all →</Btn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {inventory.map(inv => {
              const st = getStockStatus(inv.units);
              return (
                <div key={inv.group} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <BloodGroupPill group={inv.group} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{inv.group}</span>
                      <Badge status={st.label === "OK" ? "success" : st.label === "Low" ? "warning" : "danger"}>{inv.units} units · {st.label}</Badge>
                    </div>
                    <ProgressBar value={inv.units} max={inv.max} color={st.color} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Recent Requests</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Latest 5 blood requests</div>
            </div>
            <Btn variant="outline" size="sm" onClick={() => onNavigate("requests")}>View all →</Btn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {requests.slice(0, 5).map(r => {
              const dot = r.status === "Approved" ? "#16a34a" : r.status === "Rejected" ? "#b91c1c" : "#d97706";
              return (
                <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${dot}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {r.status === "Approved" ? <Check size={12} color={dot} /> : r.status === "Rejected" ? <X size={12} color={dot} /> : <Clock size={12} color={dot} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.patient} — {r.bg} ({r.units}u)</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{r.hospital} · <span style={{ color: urgencyStyle(r.urgency).color }}>{r.urgency}</span></div>
                  </div>
                  <Badge status={r.status}>{r.status}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>Donation Activity (7 Days)</div>
          <BarChart data={ACTIVITY_DATA} valueKey="donors" color={C.crimson} label="Donors" />
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>Recent Donors</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {donors.slice(0, 4).map(d => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.crimsonLight, color: C.crimsonDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{initials(d.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{d.city} · {d.id}</div>
                </div>
                <BloodGroupPill group={d.bg} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// INVENTORY PAGE
const InventoryPage = ({ inventory, setInventory }) => {
  const [form, setForm] = useState({ group: "", units: "", reason: "" });
  const [toast, setToast] = useState("");

  const handleUpdate = () => {
    if (!form.group || !form.units) { setToast("Please fill all required fields."); setTimeout(() => setToast(""), 3000); return; }
    const units = parseInt(form.units);
    setInventory(prev => prev.map(i => i.group === form.group ? { ...i, units: Math.max(0, i.units + units) } : i));
    setToast(`✓ ${form.group} updated by ${units > 0 ? "+" : ""}${units} units`);
    setForm({ group: "", units: "", reason: "" });
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>Blood Inventory</h2>
        <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>Real-time stock across all 8 blood groups · API: GET /api/inventory</p>
      </div>

      {toast && <div style={{ marginBottom: 16 }}><Alert type="success">{toast}</Alert></div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
        {inventory.map(inv => {
          const st = getStockStatus(inv.units);
          const pct = Math.round((inv.units / inv.max) * 100);
          return (
            <Card key={inv.group} style={{ textAlign: "center", padding: 16 }}>
              <Badge status={st.label === "OK" ? "success" : st.label === "Low" ? "warning" : "danger"}>{st.label}</Badge>
              <div style={{ margin: "10px auto", width: 52, height: 52, borderRadius: "50%", background: bgPillStyle(inv.group).bg, color: bgPillStyle(inv.group).color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>{inv.group}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: "system-ui" }}>{inv.units}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>units available</div>
              <ProgressBar value={inv.units} max={inv.max} color={st.color} />
              <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>{pct}% of max</div>
            </Card>
          );
        })}
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>Update Inventory · API: PUT /api/inventory/update</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Select label="Blood Group" required value={form.group} onChange={e => setForm({...form, group: e.target.value})}>
            <option value="">Select group</option>
            {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g} value={g}>{g}</option>)}
          </Select>
          <Input label="Units (+ to add, - to deduct)" required type="number" value={form.units} onChange={e => setForm({...form, units: e.target.value})} placeholder="e.g. 10 or -5" />
          <Input label="Reason" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Donation drive, emergency..." />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="outline" onClick={() => setForm({ group: "", units: "", reason: "" })}>Clear</Btn>
          <Btn variant="primary" onClick={handleUpdate}>Update Stock</Btn>
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>Inventory Log</div>
        <Table headers={["Date", "Blood Group", "Change", "Units After", "By", "Reason"]}>
          {[
            { date: "2025-01-15 10:30", group: "O-",  change: -5,  after: 1,  by: "Dr. Arjun", reason: "Emergency surgery" },
            { date: "2025-01-15 09:00", group: "A+",  change: +20, after: 80, by: "Admin",     reason: "January donation drive" },
            { date: "2025-01-14 16:45", group: "B+",  change: -8,  after: 72, by: "Dr. Priya", reason: "REQ-001831 approved" },
            { date: "2025-01-14 11:20", group: "AB-", change: -2,  after: 4,  by: "Admin",     reason: "Critical patient" },
          ].map((row, i) => (
            <Tr key={i}>
              <Td><span style={{ fontSize: 11, color: C.textMuted, fontFamily: "monospace" }}>{row.date}</span></Td>
              <Td><BloodGroupPill group={row.group} /></Td>
              <Td><span style={{ fontWeight: 700, color: row.change > 0 ? C.green : C.crimson }}>{row.change > 0 ? "+" : ""}{row.change}</span></Td>
              <Td><strong>{row.after}</strong></Td>
              <Td>{row.by}</Td>
              <Td style={{ color: C.textMuted, fontSize: 12 }}>{row.reason}</Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

// DONORS PAGE
const DonorsPage = ({ donors, onNavigate }) => {
  const [search, setSearch] = useState("");
  const [bgFilter, setBgFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [availFilter, setAvailFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const filtered = useMemo(() => donors.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.city.toLowerCase().includes(q);
    const matchBg = !bgFilter || d.bg === bgFilter;
    const matchCity = !cityFilter || d.city === cityFilter;
    const matchAvail = !availFilter || (availFilter === "Available" ? d.available : !d.available);
    return matchSearch && matchBg && matchCity && matchAvail;
  }), [donors, search, bgFilter, cityFilter, availFilter]);

  const cities = [...new Set(donors.map(d => d.city))];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>Donor Registry</h2>
          <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>API: GET /api/donors?blood_group=&city=&available=</p>
        </div>
        <Btn variant="primary" onClick={() => onNavigate("register-donor")}><Plus size={14} style={{ marginRight: 6 }} />Register Donor</Btn>
      </div>

      <Card style={{ marginBottom: 20, padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, city, donor ID..." style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          </div>
          <Select onChange={e => setBgFilter(e.target.value)} style={{ minWidth: 130 }}>
            <option value="">All Blood Groups</option>
            {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g}>{g}</option>)}
          </Select>
          <Select onChange={e => setCityFilter(e.target.value)} style={{ minWidth: 130 }}>
            <option value="">All Cities</option>
            {cities.map(c => <option key={c}>{c}</option>)}
          </Select>
          <Select onChange={e => setAvailFilter(e.target.value)} style={{ minWidth: 130 }}>
            <option value="">Availability</option>
            <option>Available</option><option>Unavailable</option>
          </Select>
          <div style={{ display: "flex", background: C.surface2, borderRadius: 8, padding: 4, gap: 2 }}>
            {["grid", "table"].map(v => (
              <button key={v} onClick={() => setViewMode(v)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer", background: viewMode === v ? "#fff" : "transparent", color: viewMode === v ? C.crimson : C.textMuted, boxShadow: viewMode === v ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
                {v === "grid" ? "⊞ Grid" : "≡ Table"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {filtered.map(d => (
            <Card key={d.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.crimsonLight, color: C.crimsonDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{initials(d.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "monospace" }}>{d.id}</div>
                </div>
                <BloodGroupPill group={d.bg} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {[`${d.gender}, ${d.age}y`, d.city, d.phone].map(t => (
                  <span key={t} style={{ background: C.surface2, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: C.textMuted }}>{t}</span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: C.textLight }}>Last: {d.lastDonation}</span>
                <Badge status={d.available ? "success" : ""}>{d.available ? "✓ Available" : "✗ Unavailable"}</Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ padding: 0 }}>
          <Table headers={["Donor ID", "Name", "Blood Group", "Age", "City", "Phone", "Last Donation", "Status"]}>
            {filtered.map(d => (
              <Tr key={d.id}>
                <Td><span style={{ fontFamily: "monospace", fontSize: 12, color: C.blue }}>{d.id}</span></Td>
                <Td><strong>{d.name}</strong></Td>
                <Td><BloodGroupPill group={d.bg} /></Td>
                <Td>{d.age}</Td>
                <Td>{d.city}</Td>
                <Td>{d.phone}</Td>
                <Td style={{ fontSize: 12, color: C.textMuted }}>{d.lastDonation}</Td>
                <Td><Badge status={d.available ? "success" : ""}>{d.available ? "Available" : "Unavailable"}</Badge></Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 13, color: C.textMuted }}>
        <span>Showing <strong>{filtered.length}</strong> of <strong>{donors.length}</strong> donors</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" size="sm">← Prev</Btn>
          <Btn variant="primary" size="sm">Next →</Btn>
        </div>
      </div>
    </div>
  );
};

// REGISTER DONOR PAGE
const RegisterDonorPage = ({ onRegister }) => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ name: "", age: "", gender: "Male", bg: "", available: "Yes", lastDonation: "", conditions: "", phone: "", email: "", city: "" });
  const [success, setSuccess] = useState("");

  const f = (k) => (e) => setForm({...form, [k]: e.target.value});
  const tabs = ["Personal Info", "Medical Details", "Contact & Location"];

  const handleSubmit = () => {
    if (!form.name || !form.age || !form.bg || !form.phone || !form.city) {
      alert("Please fill all required fields."); return;
    }
    const donorId = genId("DN");
    onRegister({ id: donorId, name: form.name, bg: form.bg, age: parseInt(form.age), gender: form.gender, city: form.city, phone: "****" + form.phone.slice(-4), email: form.email || `${form.name.toLowerCase().replace(/\s/g,".")}@email.com`, lastDonation: form.lastDonation || "—", available: form.available === "Yes" });
    setSuccess(`Donor registered! ID: ${donorId}`);
  };

  if (success) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}><CheckCircle size={36} color={C.green} /></div>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8, color: C.text }}>Donor Registered!</h2>
      <p style={{ color: C.textMuted, marginBottom: 20 }}>{success}</p>
      <p style={{ fontFamily: "monospace", fontSize: 12, color: C.textMuted, background: C.surface2, padding: "10px 20px", borderRadius: 8, marginBottom: 24 }}>POST /api/donors/register → 201 Created</p>
      <Btn variant="primary" onClick={() => setSuccess("")}>Register Another</Btn>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>Register New Donor</h2>
        <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>API: POST /api/donors/register (protected)</p>
      </div>
      <Card>
        <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${C.border}`, marginBottom: 24 }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{ padding: "10px 20px", border: "none", background: "transparent", fontWeight: 600, fontSize: 13, cursor: "pointer", color: tab === i ? C.crimson : C.textMuted, borderBottom: tab === i ? `2px solid ${C.crimson}` : "2px solid transparent", marginBottom: -2, fontFamily: "inherit" }}>
              {i + 1}. {t}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input label="Full Name" required value={form.name} onChange={f("name")} placeholder="Ramesh Kumar" />
            <Input label="Age" required type="number" value={form.age} onChange={f("age")} placeholder="25" min="18" max="65" />
            <Select label="Gender" required value={form.gender} onChange={f("gender")}>
              <option>Male</option><option>Female</option><option>Other</option>
            </Select>
            <Select label="Blood Group" required value={form.bg} onChange={f("bg")}>
              <option value="">Select</option>
              {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g}>{g}</option>)}
            </Select>
            <Select label="Available to Donate" value={form.available} onChange={f("available")}>
              <option>Yes</option><option>No</option>
            </Select>
            <Input label="Last Donation Date" type="date" value={form.lastDonation} onChange={f("lastDonation")} />
          </div>
        )}

        {tab === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Textarea label="Medical Conditions" value={form.conditions} onChange={f("conditions")} placeholder="List any chronic conditions, medications, or health notes..." />
            <Select label="Recent Illness (past 6 months)">
              <option>None</option><option>Fever</option><option>Infection</option><option>Surgery</option><option>Other</option>
            </Select>
            <Select label="Currently on Medication">
              <option>No</option><option>Yes</option>
            </Select>
            <Alert type="warning">Donors must wait 56 days between whole blood donations. Plasma: 28 days. Platelets: 7 days.</Alert>
          </div>
        )}

        {tab === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input label="Phone" required value={form.phone} onChange={f("phone")} placeholder="+91 98765 43210" />
            <Input label="Email" type="email" value={form.email} onChange={f("email")} placeholder="donor@email.com" />
            <Input label="City" required value={form.city} onChange={f("city")} placeholder="Coimbatore" />
            <Input label="State" placeholder="Tamil Nadu" />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="outline" onClick={() => setTab(Math.max(0, tab - 1))} disabled={tab === 0}>← Back</Btn>
            {tab < 2 && <Btn variant="primary" onClick={() => setTab(tab + 1)}>Next →</Btn>}
          </div>
          {tab === 2 && <Btn variant="primary" onClick={handleSubmit}>🩸 Register Donor</Btn>}
        </div>
      </Card>
    </div>
  );
};

// REQUESTS PAGE (Admin)
const RequestsPage = ({ requests, inventory, setRequests, setInventory, addNotification }) => {
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [bgFilter, setBgFilter] = useState("");
  const [search, setSearch] = useState("");
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [note, setNote] = useState("");

  const filtered = useMemo(() => requests.filter(r => {
    const q = search.toLowerCase();
    return (!q || r.patient.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.hospital.toLowerCase().includes(q))
      && (!statusFilter || r.status === statusFilter)
      && (!urgencyFilter || r.urgency === urgencyFilter)
      && (!bgFilter || r.bg === bgFilter);
  }).sort((a, b) => {
    const uOrder = { Critical: 0, Urgent: 1, Normal: 2 };
    return uOrder[a.urgency] - uOrder[b.urgency] || new Date(b.date) - new Date(a.date);
  }), [requests, statusFilter, urgencyFilter, bgFilter, search]);

  const handleApprove = () => {
    const r = approveModal;
    setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: "Approved", adminNote: note } : x));
    setInventory(prev => prev.map(i => i.group === r.bg ? { ...i, units: Math.max(0, i.units - r.units) } : i));
    addNotification({ msg: `Request ${r.id} approved. Collect ${r.units} units of ${r.bg} from ${r.hospital}.`, type: "success" });
    setApproveModal(null); setNote("");
  };

  const handleReject = () => {
    const r = rejectModal;
    setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: "Rejected", adminNote: note } : x));
    addNotification({ msg: `Request ${r.id} rejected. Reason: ${note || "No reason given."}`, type: "danger" });
    setRejectModal(null); setNote("");
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>Blood Requests</h2>
        <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>API: GET /api/requests (admin) — ordered by urgency</p>
      </div>

      <Card style={{ marginBottom: 16, padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, hospital, request ID..." style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          </div>
          <Select onChange={e => setStatusFilter(e.target.value)} style={{ minWidth: 120 }}>
            <option value="">All Status</option>
            <option>Pending</option><option>Approved</option><option>Rejected</option>
          </Select>
          <Select onChange={e => setUrgencyFilter(e.target.value)} style={{ minWidth: 120 }}>
            <option value="">All Urgency</option>
            <option>Critical</option><option>Urgent</option><option>Normal</option>
          </Select>
          <Select onChange={e => setBgFilter(e.target.value)} style={{ minWidth: 120 }}>
            <option value="">All Groups</option>
            {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g}>{g}</option>)}
          </Select>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <Table headers={["Request ID", "Patient", "Group", "Units", "Hospital", "Urgency", "Status", "Donors Notified", "Date", "Actions"]}>
          {filtered.map(r => (
            <Tr key={r.id}>
              <Td><span style={{ fontFamily: "monospace", fontSize: 12, color: C.blue }}>{r.id}</span></Td>
              <Td><strong>{r.patient}</strong><div style={{ fontSize: 11, color: C.textMuted }}>{r.doctor}</div></Td>
              <Td><BloodGroupPill group={r.bg} /></Td>
              <Td><strong>{r.units}</strong></Td>
              <Td style={{ fontSize: 12, maxWidth: 160 }}>{r.hospital}</Td>
              <Td>
                <span style={{ fontWeight: 600, fontSize: 12, color: urgencyStyle(r.urgency).color }}>● {r.urgency}</span>
              </Td>
              <Td><Badge status={r.status}>{r.status}</Badge></Td>
              <Td>
                {r.notifiedDonors && r.notifiedDonors.length > 0 ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#dbeafe", color: "#1e40af" }}>
                    <Mail size={11} /> {r.notifiedDonors.length} notified
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: C.textLight }}>—</span>
                )}
              </Td>
              <Td style={{ fontSize: 11, color: C.textMuted }}>{r.date}</Td>
              <Td>
                {r.status === "Pending" ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="success" size="sm" onClick={() => { setApproveModal(r); setNote(""); }}><Check size={12} /></Btn>
                    <Btn variant="danger" size="sm" onClick={() => { setRejectModal(r); setNote(""); }}><X size={12} /></Btn>
                  </div>
                ) : (
                  <Btn variant="ghost" size="sm"><Eye size={13} /></Btn>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Approve Modal */}
      <Modal open={!!approveModal} onClose={() => setApproveModal(null)} title="✅ Approve Blood Request">
        {approveModal && (
          <>
            <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>
              <strong>{approveModal.id}</strong> — {approveModal.patient} needs <strong>{approveModal.units} units of {approveModal.bg}</strong> at {approveModal.hospital}
            </div>
            <Textarea label="Admin Note (optional)" value={note} onChange={e => setNote(e.target.value)} placeholder="Any instructions for the patient or hospital..." />
            <div style={{ marginTop: 12, marginBottom: 16 }}>
              <Alert type="warning">Approving will deduct {approveModal.units} units of {approveModal.bg} from inventory. Current stock: {inventory.find(i => i.group === approveModal.bg)?.units} units.</Alert>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="outline" onClick={() => setApproveModal(null)}>Cancel</Btn>
              <Btn variant="success" onClick={handleApprove}>✅ Confirm Approve</Btn>
            </div>
          </>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="❌ Reject Blood Request">
        {rejectModal && (
          <>
            <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>
              <strong>{rejectModal.id}</strong> — {rejectModal.patient} · {rejectModal.bg} · {rejectModal.units} units
            </div>
            <Textarea label="Reason for Rejection" required value={note} onChange={e => setNote(e.target.value)} placeholder="Explain why this request is being rejected..." />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <Btn variant="outline" onClick={() => setRejectModal(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={handleReject}>❌ Confirm Reject</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

// ─── NEW REQUEST PAGE (with Nearby Donors Feature) ──────────────────────────
const NewRequestPage = ({ inventory, addRequest, donors, addNotification }) => {
  const [form, setForm] = useState({ patient: "", age: "", bg: "", units: "", hospital: "", doctor: "", contact: "", urgency: "Normal", reason: "", city: "" });
  const [success, setSuccess] = useState("");
  const [notifiedIds, setNotifiedIds] = useState(new Set());
  const [emailModal, setEmailModal] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [submittedNotified, setSubmittedNotified] = useState([]);
  const f = k => e => setForm({...form, [k]: e.target.value});

  // Find nearby donors: same city + same blood group + available
  const nearbyDonors = useMemo(() => {
    if (!form.bg || !form.city) return [];
    return donors.filter(d =>
      d.available &&
      d.bg === form.bg &&
      d.city.toLowerCase() === form.city.toLowerCase()
    );
  }, [form.bg, form.city, donors]);

  const stockCheck = useMemo(() => {
    if (!form.bg || !form.units) return null;
    const inv = inventory.find(i => i.group === form.bg);
    if (!inv) return null;
    const u = parseInt(form.units);
    return { ok: inv.units >= u, available: inv.units, requested: u, group: form.bg };
  }, [form.bg, form.units, inventory]);

  const handleNotifyOne = (donor) => {
    setEmailModal(donor);
  };

  const confirmSendEmail = (donor) => {
    setEmailSending(true);
    setTimeout(() => {
      setNotifiedIds(prev => new Set([...prev, donor.id]));
      addNotification({
        msg: `📧 Email alert sent to ${donor.name} (${donor.bg}) at ${donor.email} — blood needed in ${form.city}.`,
        type: "info"
      });
      setEmailSending(false);
      setEmailModal(null);
    }, 800);
  };

  const handleNotifyAll = () => {
    const toNotify = nearbyDonors.filter(d => !notifiedIds.has(d.id));
    if (toNotify.length === 0) return;
    const newIds = new Set([...notifiedIds, ...toNotify.map(d => d.id)]);
    setNotifiedIds(newIds);
    addNotification({
      msg: `📧 Bulk alert: ${toNotify.length} donors (${form.bg}) in ${form.city} notified about blood requirement for ${form.patient || "patient"}.`,
      type: "info"
    });
  };

  const handleSubmit = () => {
    if (!form.patient || !form.bg || !form.units || !form.hospital || !form.contact || !form.city) { alert("Fill all required fields including city."); return; }
    const reqId = genId("REQ-");
    // Collect notified donors info for tracking
    const notifiedList = donors.filter(d => notifiedIds.has(d.id)).map(d => ({ id: d.id, name: d.name, bg: d.bg }));
    addRequest({
      id: reqId,
      ...form,
      units: parseInt(form.units),
      status: "Pending",
      adminNote: "",
      date: new Date().toISOString().slice(0,10),
      userId: 1,
      notifiedDonors: notifiedList
    });
    // Auto-notify remaining nearby donors on submission
    const unnotified = nearbyDonors.filter(d => !notifiedIds.has(d.id));
    const allNotified = [...notifiedList, ...unnotified.map(d => ({ id: d.id, name: d.name, bg: d.bg }))];
    if (unnotified.length > 0) {
      addNotification({
        msg: `📧 Auto-alert on submission: ${unnotified.length} additional ${form.bg} donors in ${form.city} notified for ${reqId}.`,
        type: "info"
      });
    }
    if (allNotified.length > 0) {
      addNotification({
        msg: `📋 Request ${reqId} submitted with ${allNotified.length} nearby donors notified (${form.bg} in ${form.city}).`,
        type: "success"
      });
    }
    setSubmittedNotified(allNotified);
    setSuccess(reqId);
  };

  if (success) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}><CheckCircle size={36} color={C.green} /></div>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8, color: C.text }}>Request Submitted!</h2>
      <p style={{ color: C.textMuted, marginBottom: 8 }}>Request ID: <strong style={{ fontFamily: "monospace" }}>{success}</strong></p>
      <p style={{ color: C.textMuted, marginBottom: 20 }}>You'll receive a notification once it's reviewed.</p>
      {submittedNotified.length > 0 && (
        <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, borderRadius: 10, padding: "14px 20px", marginBottom: 20, maxWidth: 420, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontWeight: 700, fontSize: 13, color: "#14532d" }}>
            <Mail size={14} /> {submittedNotified.length} Nearby Donor{submittedNotified.length > 1 ? "s" : ""} Notified
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {submittedNotified.map(d => (
              <span key={d.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 500, color: "#14532d", border: "1px solid #bbf7d0" }}>
                <UserCheck size={11} /> {d.name} ({d.bg})
              </span>
            ))}
          </div>
        </div>
      )}
      <p style={{ fontFamily: "monospace", fontSize: 12, color: C.textMuted, background: C.surface2, padding: "10px 20px", borderRadius: 8, marginBottom: 24 }}>POST /api/requests → 201 Created</p>
      <Btn variant="primary" onClick={() => { setSuccess(""); setNotifiedIds(new Set()); setSubmittedNotified([]); setForm({ patient: "", age: "", bg: "", units: "", hospital: "", doctor: "", contact: "", urgency: "Normal", reason: "", city: "" }); }}>New Request</Btn>
    </div>
  );

  const cities = [...new Set(donors.map(d => d.city))];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>Submit Blood Request</h2>
        <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>API: POST /api/requests (protected)</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>Patient Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Patient Name" required value={form.patient} onChange={f("patient")} placeholder="Kavya Priya" />
              <Input label="Patient Age" type="number" value={form.age} onChange={f("age")} placeholder="35" />
              <Select label="Blood Group Required" required value={form.bg} onChange={f("bg")}>
                <option value="">Select</option>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g}>{g}</option>)}
              </Select>
              <Input label="Units Required" required type="number" value={form.units} onChange={f("units")} placeholder="2" min="1" />
              <Select label="Urgency Level" required value={form.urgency} onChange={f("urgency")}>
                <option>Normal</option><option>Urgent</option><option>Critical</option>
              </Select>
              <Input label="Contact Number" required value={form.contact} onChange={f("contact")} placeholder="+91 98765 43210" />
              <Select label="City / Location" required value={form.city} onChange={f("city")}>
                <option value="">Select City</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <div />
              <div style={{ gridColumn: "1 / -1" }}>
                <Textarea label="Reason for Request" value={form.reason} onChange={f("reason")} placeholder="Describe the medical condition..." />
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>Hospital Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Hospital Name" required value={form.hospital} onChange={f("hospital")} placeholder="PSG Hospitals, Coimbatore" />
              <Input label="Doctor / Consultant" value={form.doctor} onChange={f("doctor")} placeholder="Dr. Meena Kumari" />
            </div>
          </Card>

          {/* ─── NEARBY DONORS PANEL ─── */}
          {form.bg && form.city && (
            <Card style={{ border: nearbyDonors.length > 0 ? `1.5px solid ${C.green}` : `1.5px solid ${C.border}`, background: nearbyDonors.length > 0 ? "#f0fdf4" : "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: nearbyDonors.length > 0 ? "#dcfce7" : C.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MapPin size={16} color={nearbyDonors.length > 0 ? C.green : C.textMuted} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>
                      Nearby Donors — {form.bg} in {form.city}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>
                      {nearbyDonors.length} available donor{nearbyDonors.length !== 1 ? "s" : ""} found
                    </div>
                  </div>
                </div>
                {nearbyDonors.length > 0 && (
                  <Btn
                    variant="success"
                    size="sm"
                    onClick={handleNotifyAll}
                    disabled={nearbyDonors.every(d => notifiedIds.has(d.id))}
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <Send size={12} />
                    {nearbyDonors.every(d => notifiedIds.has(d.id)) ? "All Notified ✓" : `Notify All (${nearbyDonors.filter(d => !notifiedIds.has(d.id)).length})`}
                  </Btn>
                )}
              </div>

              {nearbyDonors.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>No available {form.bg} donors found in {form.city}</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Try selecting a different city or blood group</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {nearbyDonors.map(d => {
                    const isSent = notifiedIds.has(d.id);
                    return (
                      <div key={d.id} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                        borderRadius: 10, background: isSent ? "#dcfce7" : "#fff",
                        border: `1px solid ${isSent ? "#bbf7d0" : C.border}`,
                        transition: "all 0.2s"
                      }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.crimsonLight, color: C.crimsonDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {initials(d.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{d.name}</div>
                          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>
                            {d.email} · Last donation: {d.lastDonation}
                          </div>
                        </div>
                        <BloodGroupPill group={d.bg} />
                        {isSent ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: "#bbf7d0", color: "#14532d" }}>
                            <CheckCircle size={12} /> Sent
                          </span>
                        ) : (
                          <Btn variant="outline" size="sm" onClick={() => handleNotifyOne(d)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Mail size={12} /> Notify
                          </Btn>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {notifiedIds.size > 0 && (
                <div style={{ marginTop: 12, padding: "8px 12px", background: "#dcfce7", borderRadius: 8, fontSize: 12, color: "#14532d", display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle size={13} />
                  <span><strong>{notifiedIds.size}</strong> donor{notifiedIds.size > 1 ? "s" : ""} notified via email</span>
                </div>
              )}
            </Card>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 12 }}>📦 Inventory Check</div>
            {!stockCheck ? (
              <p style={{ fontSize: 13, color: C.textMuted }}>Select blood group and units to check availability.</p>
            ) : stockCheck.ok ? (
              <Alert type="success">{stockCheck.group} has {stockCheck.available} units available. Your request for {stockCheck.requested} units can be fulfilled.</Alert>
            ) : (
              <Alert type="danger">{stockCheck.group} has only {stockCheck.available} units. You requested {stockCheck.requested}. Request will still be submitted but may face delays.</Alert>
            )}
            <div style={{ marginTop: 14 }}>
              {inventory.map(inv => {
                const st = getStockStatus(inv.units);
                return (
                  <div key={inv.group} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{inv.group}</span>
                    <Badge status={st.label === "OK" ? "success" : st.label === "Low" ? "warning" : "danger"}>{inv.units}u</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Nearby Donors Summary (Right panel) */}
          {form.bg && form.city && nearbyDonors.length > 0 && (
            <Card style={{ border: `1.5px solid #3b82f6`, background: "#eff6ff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontWeight: 700, fontSize: 13, color: "#1e40af" }}>
                <MapPin size={14} /> Donor Match Summary
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.textMuted }}>Blood Group</span>
                  <strong>{form.bg}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.textMuted }}>City</span>
                  <strong>{form.city}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.textMuted }}>Matching Donors</span>
                  <strong style={{ color: C.green }}>{nearbyDonors.length}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.textMuted }}>Notified</span>
                  <strong style={{ color: "#1e40af" }}>{notifiedIds.size} / {nearbyDonors.length}</strong>
                </div>
              </div>
            </Card>
          )}

          <Card style={{ background: "#fff5f5", borderColor: "#fca5a5" }}>
            <div style={{ fontSize: 13, color: C.crimsonDark, lineHeight: 1.6 }}>
              <strong>⚠️ Important Notice</strong><br />
              Requests will be reviewed by admin within 2-4 hours. Critical requests are prioritized. You'll receive a notification once approved or rejected.
              {nearbyDonors.length > 0 && (
                <>
                  <br /><br />
                  <strong>📧 Donor Notifications:</strong> Nearby matching donors will be automatically emailed when you submit. You can also manually notify them before submission.
                </>
              )}
            </div>
          </Card>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => { setForm({ patient: "", age: "", bg: "", units: "", hospital: "", doctor: "", contact: "", urgency: "Normal", reason: "", city: "" }); setNotifiedIds(new Set()); }}>Clear</Btn>
            <Btn variant="primary" onClick={handleSubmit}>📋 Submit Request</Btn>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      <Modal open={!!emailModal} onClose={() => setEmailModal(null)} title="📧 Email Notification Preview" width={560}>
        {emailModal && (
          <>
            <div style={{ background: C.surface2, borderRadius: 10, padding: "16px 18px", marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12, fontSize: 12 }}>
                <span style={{ color: C.textMuted, fontWeight: 600, minWidth: 40 }}>To:</span>
                <span style={{ color: C.text, fontWeight: 500 }}>{emailModal.email}</span>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12, fontSize: 12 }}>
                <span style={{ color: C.textMuted, fontWeight: 600, minWidth: 40 }}>From:</span>
                <span style={{ color: C.text, fontWeight: 500 }}>alerts@bloodbee.in</span>
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
                <span style={{ color: C.textMuted, fontWeight: 600, minWidth: 40 }}>Subject:</span>
                <span style={{ color: C.crimson, fontWeight: 600 }}>🩸 Urgent: Blood Donation Needed — {form.bg} in {form.city}</span>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, padding: "20px", border: `1px solid ${C.border}`, fontSize: 13, lineHeight: 1.7, color: C.text }}>
              <p style={{ margin: "0 0 12px" }}>Dear <strong>{emailModal.name}</strong>,</p>
              <p style={{ margin: "0 0 12px" }}>
                We have an <strong style={{ color: urgencyStyle(form.urgency).color }}>{form.urgency.toLowerCase()}</strong> need for
                <strong> {form.units || "—"} unit(s) of {form.bg}</strong> blood in <strong>{form.city}</strong>.
              </p>
              <div style={{ background: C.crimsonLight, borderRadius: 8, padding: "12px 16px", margin: "12px 0", borderLeft: `4px solid ${C.crimson}` }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: C.crimsonDark, marginBottom: 6 }}>Request Details</div>
                <div style={{ fontSize: 12, color: C.crimsonDark }}>
                  • Patient: <strong>{form.patient || "Not specified"}</strong><br/>
                  • Hospital: <strong>{form.hospital || "Not specified"}</strong><br/>
                  • Doctor: <strong>{form.doctor || "Not specified"}</strong><br/>
                  • Blood Group: <strong>{form.bg}</strong> · Units: <strong>{form.units || "—"}</strong><br/>
                  • Urgency: <strong>{form.urgency}</strong>
                </div>
              </div>
              <p style={{ margin: "12px 0" }}>
                As a registered {form.bg} donor in {form.city}, your donation could save a life. Please contact the hospital or reply to this email if you're available to donate.
              </p>
              <p style={{ margin: "12px 0 0", fontSize: 12, color: C.textMuted }}>
                — BLOOD BEE Blood Bank Management System<br/>
                <span style={{ fontSize: 11 }}>This is an automated notification. Contact support@bloodbee.in for questions.</span>
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <Btn variant="outline" onClick={() => setEmailModal(null)}>Cancel</Btn>
              <Btn variant="success" onClick={() => confirmSendEmail(emailModal)} disabled={emailSending} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {emailSending ? (
                  <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Sending...</>
                ) : (
                  <><Send size={13} /> Send Email</>
                )}
              </Btn>
            </div>
          </>
        )}
      </Modal>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// MY REQUESTS (with Donor Alerts section)
const MyRequestsPage = ({ requests }) => {
  const myReqs = requests.filter(r => r.userId <= 2);
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>My Requests</h2>
        <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>API: GET /api/requests/my (protected)</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {myReqs.map(r => {
          const accent = r.status === "Approved" ? C.green : r.status === "Rejected" ? C.crimson : C.gold;
          return (
            <Card key={r.id} style={{ borderLeft: `4px solid ${accent}`, borderRadius: "0 12px 12px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: C.blue }}>{r.id}</span>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginTop: 2 }}>{r.patient}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{r.hospital} · {r.doctor}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Badge status={r.status}>{r.status}</Badge>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{r.date}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><BloodGroupPill group={r.bg} /><span>{r.bg} · {r.units} units</span></div>
                <span style={{ fontWeight: 600, color: urgencyStyle(r.urgency).color }}>● {r.urgency}</span>
                {r.adminNote && <span style={{ fontSize: 12, color: C.textMuted }}>Note: {r.adminNote}</span>}
              </div>

              {/* ─── DONOR ALERTS SECTION ─── */}
              {r.notifiedDonors && r.notifiedDonors.length > 0 && (
                <div style={{ marginTop: 14, padding: "12px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontWeight: 700, fontSize: 12, color: "#14532d" }}>
                    <Mail size={13} />
                    Donors Notified ({r.notifiedDonors.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {r.notifiedDonors.map(d => (
                      <div key={d.id} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "#fff", borderRadius: 8, padding: "6px 12px",
                        border: "1px solid #bbf7d0", fontSize: 12
                      }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.crimsonLight, color: C.crimsonDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 9, flexShrink: 0 }}>
                          {initials(d.name)}
                        </div>
                        <span style={{ fontWeight: 500, color: C.text }}>{d.name}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: bgPillStyle(d.bg).bg, color: bgPillStyle(d.bg).color, borderRadius: 12, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{d.bg}</span>
                        <CheckCircle size={12} color={C.green} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ADMIN USERS
const AdminUsersPage = ({ users, setUsers }) => {
  const [search, setSearch] = useState("");
  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const toggleRole = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u));
  const deleteUser = (id) => { if (window.confirm("Delete this user?")) setUsers(prev => prev.filter(u => u.id !== id)); };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>User Management</h2>
        <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>API: GET /api/admin/users · PUT /api/admin/users/:id/role</p>
      </div>
      <Card style={{ marginBottom: 16, padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          </div>
        </div>
      </Card>
      <Card style={{ padding: 0 }}>
        <Table headers={["ID", "Name", "Email", "Role", "Phone", "City", "Joined", "Actions"]}>
          {filtered.map(u => (
            <Tr key={u.id}>
              <Td style={{ color: C.textMuted, fontSize: 12 }}>#{u.id}</Td>
              <Td>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: u.role === "admin" ? C.crimsonLight : C.blueLight, color: u.role === "admin" ? C.crimsonDark : C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>{initials(u.name)}</div>
                  <strong>{u.name}</strong>
                </div>
              </Td>
              <Td style={{ fontSize: 12 }}>{u.email}</Td>
              <Td><Badge status={u.role === "admin" ? "danger" : "info"}>{u.role}</Badge></Td>
              <Td style={{ fontSize: 12 }}>{u.phone}</Td>
              <Td>{u.city}</Td>
              <Td style={{ fontSize: 12, color: C.textMuted }}>{u.joined}</Td>
              <Td>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn variant="outline" size="sm" onClick={() => toggleRole(u.id)}><RefreshCw size={11} style={{ marginRight: 4 }} />Role</Btn>
                  <Btn variant="danger" size="sm" onClick={() => deleteUser(u.id)}><Trash2 size={11} /></Btn>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

// REPORTS PAGE
const ReportsPage = () => {
  const [period, setPeriod] = useState("7");
  const bgStats = [
    { group: "O+",  requests: 89, units: 178, pct: 65 },
    { group: "A+",  requests: 62, units: 124, pct: 45 },
    { group: "B+",  requests: 48, units: 96,  pct: 35 },
    { group: "AB+", requests: 21, units: 42,  pct: 15 },
  ];
  const cityStats = [
    { city: "Coimbatore", count: 312, pct: 78, color: C.crimson },
    { city: "Chennai",    count: 221, pct: 55, color: C.blue },
    { city: "Madurai",    count: 153, pct: 38, color: C.green },
    { city: "Salem",      count: 96,  pct: 24, color: "#ea580c" },
    { city: "Trichy",     count: 72,  pct: 18, color: "#7c3aed" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>Reports & Analytics</h2>
          <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>API: GET /api/admin/reports/donations?period={period}days</p>
        </div>
        <Select value={period} onChange={e => setPeriod(e.target.value)} style={{ minWidth: 140 }}>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </Select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="New Donors" value="84" note={`Last ${period} days`} accent={C.crimson} icon={UserPlus} />
        <StatCard label="Requests Filed" value="37" note={`Last ${period} days`} accent={C.blue} icon={ClipboardList} />
        <StatCard label="Approval Rate" value="81%" note="30 approved" accent={C.green} icon={CheckCircle} />
        <StatCard label="Units Dispensed" value="148" note={`Last ${period} days`} accent="#ea580c" icon={Droplets} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>Daily Donor Registrations</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>New donors per day</div>
          <BarChart data={ACTIVITY_DATA} valueKey="donors" color={C.crimson} />
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>Daily Request Volume</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>Blood requests filed per day</div>
          <BarChart data={ACTIVITY_DATA} valueKey="requests" color={C.blue} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>Requests by Blood Group</div>
          <Table headers={["Blood Group", "Requests", "Units", "Share"]}>
            {bgStats.map(row => (
              <Tr key={row.group}>
                <Td><BloodGroupPill group={row.group} /></Td>
                <Td><strong>{row.requests}</strong></Td>
                <Td>{row.units}</Td>
                <Td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 80, height: 6, background: C.surface2, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${row.pct}%`, height: "100%", background: C.crimson, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{row.pct}%</span>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        </Card>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>Donors by City (Top 5)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cityStats.map(row => (
              <div key={row.city} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 88, fontSize: 12, color: C.textMuted, flexShrink: 0 }}>{row.city}</div>
                <div style={{ flex: 1, height: 10, background: C.surface2, borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ width: `${row.pct}%`, height: "100%", background: row.color, borderRadius: 5 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, minWidth: 30, textAlign: "right" }}>{row.count}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// PROFILE PAGE
const ProfilePage = ({ currentUser }) => {
  const [form, setForm] = useState({ name: currentUser.name, phone: "+91 98765 43210", city: "Coimbatore" });
  const [saved, setSaved] = useState(false);
  const f = k => e => setForm({...form, [k]: e.target.value});

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>My Profile</h2>
        <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>API: GET /api/auth/me (protected)</p>
      </div>

      {saved && <div style={{ marginBottom: 16 }}><Alert type="success">Profile updated successfully!</Alert></div>}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        <Card style={{ textAlign: "center", padding: "28px 20px" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.crimson, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 28, margin: "0 auto 14px" }}>{initials(currentUser.name)}</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: C.text }}>{currentUser.name}</div>
          <div style={{ margin: "8px 0" }}><Badge status={currentUser.role === "admin" ? "danger" : "info"}>{currentUser.role}</Badge></div>
          <div style={{ fontSize: 12, color: C.textMuted }}>Member since Jan 2024</div>
          <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 16, paddingTop: 16 }}>
            {[["Email", currentUser.email], ["Phone", "+91 98765 43210"], ["City", "Coimbatore"], ["Role", currentUser.role]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0" }}>
                <span style={{ color: C.textMuted }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>Update Profile</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Full Name" value={form.name} onChange={f("name")} />
              <Input label="Phone" type="tel" value={form.phone} onChange={f("phone")} />
              <div style={{ gridColumn: "1 / -1" }}><Input label="City" value={form.city} onChange={f("city")} /></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <Btn variant="primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>Save Changes</Btn>
            </div>
          </Card>

          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>Change Password</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <Input label="New Password" type="password" placeholder="Min 8 chars" />
              <Input label="Confirm Password" type="password" placeholder="Repeat" />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <Btn variant="outline">Update Password</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── NOTIFICATION PANEL ──────────────────────────────────────────────────────

const NotificationPanel = ({ open, onClose, notifications, markAllRead }) => {
  if (!open) return null;
  const typeColor = { success: C.green, danger: C.crimson, info: C.blue, warning: C.gold };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ position: "fixed", top: 64, right: 0, width: 380, background: "#fff", borderLeft: `1px solid ${C.border}`, height: "calc(100vh - 64px)", display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>🔔 Notifications</span>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="outline" size="sm" onClick={markAllRead}>Mark all read</Btn>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {notifications.map(n => {
            const isEmailAlert = n.msg.includes("📧") || n.msg.includes("Donor alert") || n.msg.includes("Email alert") || n.msg.includes("Bulk alert") || n.msg.includes("Auto-alert");
            return (
              <div key={n.id} style={{ padding: "12px", borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${typeColor[n.type] || C.blue}`, background: n.read ? "transparent" : C.surface2, fontSize: 13, lineHeight: 1.5, cursor: "pointer" }}>
                {isEmailAlert && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <Mail size={11} color={C.blue} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: "0.5px" }}>Donor Alert</span>
                  </div>
                )}
                <p style={{ margin: 0, color: C.text }}>{n.msg}</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: C.textMuted }}>{n.time}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── SIDEBAR ────────────────────────────────────────────────────────────────

// ─── ROLE-BASED NAVIGATION ─────────────────────────────────────────────────

const ADMIN_NAV = [
  { section: "Overview", items: [{ id: "dashboard", label: "Dashboard", Icon: LayoutDashboard }] },
  { section: "Blood Bank", items: [
    { id: "inventory",       label: "Blood Inventory", Icon: Droplets },
    { id: "donors",          label: "Donor Registry",  Icon: Users },
    { id: "register-donor",  label: "Register Donor",  Icon: UserPlus },
  ]},
  { section: "Requests", items: [
    { id: "requests",        label: "All Requests",    Icon: ClipboardList },
    { id: "admin-reports",   label: "Reports",         Icon: BarChart3 },
  ]},
  { section: "Administration", items: [
    { id: "admin-users",     label: "Manage Users",    Icon: ShieldCheck },
  ]},
  { section: "Account", items: [
    { id: "profile",         label: "My Profile",      Icon: User },
  ]},
];

const RECIPIENT_NAV = [
  { section: "Overview", items: [{ id: "recipient-home", label: "Home", Icon: LayoutDashboard }] },
  { section: "Blood Requests", items: [
    { id: "new-request",     label: "New Request",     Icon: FilePlus },
    { id: "my-requests",     label: "My Requests",     Icon: FolderOpen },
  ]},
  { section: "Account", items: [
    { id: "profile",         label: "My Profile",      Icon: User },
  ]},
];

const DONOR_NAV = [
  { section: "Overview", items: [{ id: "donor-home", label: "Dashboard", Icon: LayoutDashboard }] },
  { section: "Blood Requests", items: [
    { id: "incoming-requests", label: "Recipient Requests", Icon: ClipboardList },
  ]},
  { section: "Account", items: [
    { id: "profile",         label: "My Profile",      Icon: User },
  ]},
];

// ─── RECIPIENT HOME PAGE ────────────────────────────────────────────────────────

const RecipientHomePage = ({ requests, inventory, onNavigate }) => {
  const myReqs = requests.filter(r => r.userId <= 2);
  const pending = myReqs.filter(r => r.status === "Pending");
  const approved = myReqs.filter(r => r.status === "Approved");
  const rejected = myReqs.filter(r => r.status === "Rejected");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>Welcome Back! 🐝</h2>
        <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>Your blood request dashboard</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="My Requests" value={myReqs.length} note="total submitted" accent={C.blue} icon={ClipboardList} />
        <StatCard label="Pending" value={pending.length} note="awaiting review" accent={C.gold} icon={Clock} />
        <StatCard label="Approved" value={approved.length} note="requests fulfilled" accent={C.green} icon={CheckCircle} />
        <StatCard label="Rejected" value={rejected.length} note="not fulfilled" accent={C.crimson} icon={XCircle} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Quick Actions</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Common tasks</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => onNavigate("new-request")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.crimsonLight; e.currentTarget.style.borderColor = C.crimson; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = C.border; }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.crimsonLight, display: "flex", alignItems: "center", justifyContent: "center" }}><FilePlus size={18} color={C.crimson} /></div>
              <div><div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>Request Blood</div><div style={{ fontSize: 11, color: C.textMuted }}>Submit a new blood request</div></div>
              <ChevronRight size={16} color={C.textLight} style={{ marginLeft: "auto" }} />
            </button>
            <button onClick={() => onNavigate("my-requests")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.blueLight; e.currentTarget.style.borderColor = C.blue; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = C.border; }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center" }}><FolderOpen size={18} color={C.blue} /></div>
              <div><div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>Track Requests</div><div style={{ fontSize: 11, color: C.textMuted }}>View status of your requests</div></div>
              <ChevronRight size={16} color={C.textLight} style={{ marginLeft: "auto" }} />
            </button>
            <button onClick={() => onNavigate("profile")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.greenLight; e.currentTarget.style.borderColor = C.green; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = C.border; }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.greenLight, display: "flex", alignItems: "center", justifyContent: "center" }}><User size={18} color={C.green} /></div>
              <div><div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>My Profile</div><div style={{ fontSize: 11, color: C.textMuted }}>Update your information</div></div>
              <ChevronRight size={16} color={C.textLight} style={{ marginLeft: "auto" }} />
            </button>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Recent Requests</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Your latest blood requests</div>
            </div>
            <Btn variant="outline" size="sm" onClick={() => onNavigate("my-requests")}>View all →</Btn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {myReqs.slice(0, 4).map(r => {
              const dot = r.status === "Approved" ? "#16a34a" : r.status === "Rejected" ? "#b91c1c" : "#d97706";
              return (
                <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${dot}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {r.status === "Approved" ? <Check size={12} color={dot} /> : r.status === "Rejected" ? <X size={12} color={dot} /> : <Clock size={12} color={dot} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.patient} — {r.bg} ({r.units}u)</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{r.hospital} · {r.date}</div>
                  </div>
                  <Badge status={r.status}>{r.status}</Badge>
                </div>
              );
            })}
            {myReqs.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", color: C.textMuted, fontSize: 13 }}>No requests yet. Submit your first request!</div>
            )}
          </div>
        </Card>
      </div>

      {/* Blood availability overview for donors */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>Blood Availability Overview</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>Current stock levels across all blood groups</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10 }}>
          {inventory.map(inv => {
            const st = getStockStatus(inv.units);
            return (
              <div key={inv.group} style={{ textAlign: "center", padding: "12px 8px", borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}` }}>
                <BloodGroupPill group={inv.group} />
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginTop: 6 }}>{inv.units}</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>units</div>
                <Badge status={st.label === "OK" ? "success" : st.label === "Low" ? "warning" : "danger"}>{st.label}</Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ─── DONOR DASHBOARD (INCOMING REQUESTS) ──────────────────────────────────
const DonorIncomingPage = ({ requests, currentUser, onNavigate }) => {
  // Only show requests matching donor's city and blood group
  const incomingReqs = requests.filter(r => r.status !== "Approved" && r.city === currentUser.city && r.bg === currentUser.bg);
  const acceptedReqs = requests.filter(r => r.status === "Approved" && r.city === currentUser.city && r.bg === currentUser.bg);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: 0 }}>Incoming Urgent Requests</h2>
        <p style={{ color: C.textMuted, fontSize: 13.5, marginTop: 4 }}>Showing recipients in {currentUser.city} needing {currentUser.bg} blood.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        <Card style={{ background: C.crimsonLight, borderColor: C.crimson }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.crimsonDark }}>Patients Needing Help</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.crimson, marginTop: 10 }}>{incomingReqs.length}</div>
          <div style={{ fontSize: 12, color: C.crimsonDark, opacity: 0.8 }}>Local matches for {currentUser.bg}</div>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Recipient Requests (Nearby)</div>
        </div>
        
        {incomingReqs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>You're all caught up!</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>No active requests require your blood type right now.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {incomingReqs.map(r => (
              <div key={r.id} style={{ display: "flex", gap: 14, padding: "16px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.crimsonLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Droplets size={24} color={C.crimson} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{r.hospital}</div>
                    <Badge status={r.urgency}>{r.urgency}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>
                    Patient: <strong>{r.patient}</strong> · Units Required: <strong>{r.units}u</strong>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                    Contact: {r.contact} · {r.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const Sidebar = ({ currentPage, onNavigate, user, onLogout }) => {
  const nav = user.role === "admin" ? ADMIN_NAV : user.role === "donor" ? DONOR_NAV : RECIPIENT_NAV;
  return (
    <aside style={{ width: 240, background: "#7f1d1d", color: "#fff", display: "flex", flexDirection: "column", height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 100 }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 20 }}>🐝</span>
          <div style={{ fontWeight: 800, fontSize: 19, fontFamily: "system-ui", letterSpacing: -0.5 }}>BLOOD BEE</div>
        </div>
        <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{user.role === "admin" ? "Admin Portal" : user.role === "recipient" ? "Recipient Portal" : "Donor Portal"}</div>
      </div>
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {nav.map(({ section, items }) => (
          <div key={section}>
            <div style={{ padding: "10px 20px 4px", fontSize: 10, textTransform: "uppercase", letterSpacing: "1.2px", opacity: 0.4, fontWeight: 600 }}>{section}</div>
            {items.map(({ id, label, Icon }) => {
              const active = currentPage === id;
              return (
                <button key={id} onClick={() => onNavigate(id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 20px", width: "100%", background: "transparent", border: "none", color: active ? "#fff" : "rgba(255,255,255,0.68)", cursor: "pointer", fontSize: 13.5, fontWeight: active ? 600 : 400, opacity: 1, borderLeft: `3px solid ${active ? "#f59e0b" : "transparent"}`, fontFamily: "inherit", textAlign: "left" }}>
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f59e0b", color: "#7f1d1d", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{initials(user.name)}</div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>{user.role === "admin" ? "Administrator" : user.role === "donor" ? "Donor" : "Recipient"}</div>
          </div>
          <button onClick={onLogout} title="Logout" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4 }}><LogOut size={15} /></button>
        </div>
      </div>
    </aside>
  );
};

// ─── TOPBAR ────────────────────────────────────────────────────────────────

const PAGE_TITLES = {
  dashboard: "Admin Dashboard", "recipient-home": "Home", "donor-home": "Donor Dashboard",
  "incoming-requests": "Incoming Requests", inventory: "Blood Inventory", donors: "Donor Registry",
  "register-donor": "Register Donor", requests: "All Blood Requests", "new-request": "New Request",
  "my-requests": "My Requests", "admin-users": "User Management", "admin-reports": "Reports & Analytics",
  profile: "My Profile",
};

const Topbar = ({ page, unread, onNotifClick, userRole }) => (
  <div style={{ height: 64, background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 16, position: "sticky", top: 0, zIndex: 50 }}>
    <div style={{ flex: 1, fontWeight: 800, fontSize: 17, color: C.text, fontFamily: "system-ui" }}>{PAGE_TITLES[page] || "Page"}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Badge status={userRole === "admin" ? "danger" : userRole === "recipient" ? "warning" : "info"}>{userRole === "admin" ? "🛡️ Admin" : userRole === "recipient" ? "🏥 Recipient" : "🩸 Donor"}</Badge>
      <button onClick={onNotifClick} style={{ position: "relative", width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Bell size={16} color={C.textMuted} />
        {unread > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: C.crimson, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{unread}</span>}
      </button>
    </div>
  </div>
);

// ─── ROOT APP ───────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [notifOpen, setNotifOpen] = useState(false);

  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [donors, setDonors] = useState(INITIAL_DONORS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const addNotification = (n) => setNotifications(prev => [{ id: Date.now() + Math.random(), time: "just now", read: false, ...n }, ...prev]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogin = (u) => {
    setUser(u);
    if (u.isNew && u.role === "donor") {
      const donorId = genId("DN");
      const newDonor = {
        id: donorId,
        name: u.name,
        bg: u.bg,
        age: 25, // default
        gender: "Other", // default
        city: u.city,
        phone: u.phone ? "****" + u.phone.slice(-4) : "****0000",
        email: u.email,
        lastDonation: "—",
        available: true
      };
      setDonors(prev => [newDonor, ...prev]);
      addNotification({ msg: `New donor ${donorId} (${u.name}, ${u.bg}) registered from portal.`, type: "info" });
    }
    setPage(u.role === "admin" ? "dashboard" : u.role === "recipient" ? "recipient-home" : "donor-home");
  };
  const handleLogout = () => { setUser(null); setPage("dashboard"); };

  const handleNavigate = (targetPage) => {
    // Prevent non-admin users from accessing admin-only pages
    const adminOnlyPages = ["dashboard", "inventory", "donors", "register-donor", "requests", "admin-users", "admin-reports"];
    if (user.role !== "admin" && adminOnlyPages.includes(targetPage)) {
      setPage(user.role === "recipient" ? "recipient-home" : "donor-home");
      return;
    }
    setPage(targetPage);
  };

  const addRequest = (r) => setRequests(prev => [r, ...prev]);
  const addDonor = (d) => {
    setDonors(prev => [d, ...prev]);
    addNotification({ msg: `New donor ${d.id} (${d.name}, ${d.bg}) registered in ${d.city}.`, type: "info" });
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const isAdmin = user.role === "admin";
  const isDonor = user.role === "donor";

  const renderPage = () => {
    switch (page) {
      // ── Admin-only pages ──
      case "dashboard":       return isAdmin ? <Dashboard inventory={inventory} donors={donors} requests={requests} onNavigate={handleNavigate} /> : null;
      case "inventory":       return isAdmin ? <InventoryPage inventory={inventory} setInventory={setInventory} /> : null;
      case "donors":          return isAdmin ? <DonorsPage donors={donors} onNavigate={handleNavigate} /> : null;
      case "register-donor":  return isAdmin ? <RegisterDonorPage onRegister={addDonor} /> : null;
      case "requests":        return isAdmin ? <RequestsPage requests={requests} inventory={inventory} setRequests={setRequests} setInventory={setInventory} addNotification={addNotification} /> : null;
      case "admin-users":     return isAdmin ? <AdminUsersPage users={users} setUsers={setUsers} /> : null;
      case "admin-reports":   return isAdmin ? <ReportsPage /> : null;
      // ── Recipient pages ──
      case "recipient-home":  return <RecipientHomePage requests={requests} inventory={inventory} onNavigate={handleNavigate} />;
      case "new-request":     return <NewRequestPage inventory={inventory} addRequest={addRequest} donors={donors} addNotification={addNotification} currentUser={user} />;
      case "my-requests":     return <MyRequestsPage requests={requests} />;
      // ── Donor pages ──
      case "donor-home":
      case "incoming-requests": return <DonorIncomingPage requests={requests} currentUser={user} onNavigate={handleNavigate} />;
      // ── Shared pages ──
      case "profile":         return <ProfilePage currentUser={user} />;
      default:                return isAdmin ? <Dashboard inventory={inventory} donors={donors} requests={requests} onNavigate={handleNavigate} /> : isDonor ? <DonorIncomingPage requests={requests} currentUser={user} onNavigate={handleNavigate} /> : <RecipientHomePage requests={requests} inventory={inventory} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.surface, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Sidebar currentPage={page} onNavigate={handleNavigate} user={user} onLogout={handleLogout} />
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Topbar page={page} unread={unreadCount} onNotifClick={() => setNotifOpen(o => !o)} userRole={user.role} />
        <div style={{ flex: 1, padding: 28, maxWidth: 1200 }}>
          {renderPage()}
        </div>
      </div>
      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        markAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
      />
    </div>
  );
}
