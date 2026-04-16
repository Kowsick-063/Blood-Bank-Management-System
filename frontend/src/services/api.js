import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bb_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bb_token');
      localStorage.removeItem('bb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth endpoints ──
export const authAPI = {
  signup:        (data) => api.post('/auth/signup', data),
  login:         (data) => api.post('/auth/login', data),
  verifyEmail:   (data) => api.post('/auth/verify-email', data),
  resendOTP:     (data) => api.post('/auth/resend-otp', data),
  forgotPassword:(data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe:         ()     => api.get('/auth/me'),
  logout:        ()     => api.post('/auth/logout'),
};

// ── Admin endpoints ──
export const adminAPI = {
  getStats:      ()     => api.get('/admin/stats'),
  getRequests:   ()     => api.get('/admin/requests'),
  getInventory:  ()     => api.get('/admin/inventory'),
  updateStatus:  (data) => api.post('/admin/update-request-status', data),
};

export default api;
