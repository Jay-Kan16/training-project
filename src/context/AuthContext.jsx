import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as localApi from '../lib/localApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localApi
      .getMe()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await localApi.login(email, password);
    setUser(res.user);
    return res.user;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await localApi.signup(name, email, password);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    localApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
