import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken]     = useState(() => localStorage.getItem('bb_token'));

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bb_user');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, [token]);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('bb_token', authToken);
    localStorage.setItem('bb_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_user');
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('bb_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
