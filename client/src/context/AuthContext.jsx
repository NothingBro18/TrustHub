import { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from '../services/authService.js';

const TOKEN_KEY = 'trusthub_token';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!token) {
      setLoading(false);
      return () => { active = false; };
    }

    fetchCurrentUser()
      .then((response) => {
        if (active) setUser(response.user);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        if (active) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [token]);

  const acceptSession = (result) => {
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  };

  const login = async (credentials) => acceptSession(await loginRequest(credentials));
  const register = async (userDetails) => acceptSession(await registerRequest(userDetails));
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};