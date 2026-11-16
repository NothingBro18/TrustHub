import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services';
import { clearAuthToken, consumeOAuthCode, migrateLegacyToken, setAuthToken } from '../utils/authSession';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('trusthub:unauthorized', handleUnauthorized);
    const oauthCode = consumeOAuthCode();
    migrateLegacyToken();
    const currentUserRequest = oauthCode
      ? authService.exchangeOAuthCode(oauthCode)
      : authService.getMe();
    currentUserRequest
      .then((res) => {
        if (oauthCode) setAuthToken(res.data.token);
        setUser(res.data.user);
      })
      .catch(() => {
        if (oauthCode) clearAuthToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
    return () => window.removeEventListener('trusthub:unauthorized', handleUnauthorized);
  }, []);

  // Heartbeat to keep active online status refreshed every 2 minutes
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        authService.heartbeat().catch(() => {});
      }
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    setAuthToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    setAuthToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuthToken();
      setUser(null);
    }
  };

  const value = { user, setUser, loading, login, register, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
