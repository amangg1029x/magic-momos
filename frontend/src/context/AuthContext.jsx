import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { setToken, clearToken, getToken } from "../services/api";

import { initPushNotifications } from "../services/pushNotifications";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true until we've checked the token

  // ── Rehydrate session on first load ────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    api.auth.me()
      .then(({ user }) => {
        setUser(user);
        initPushNotifications("customer");
      })
      .catch(() => clearToken())          // stale / invalid token → clear it
      .finally(() => setLoading(false));
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (data) => {
    const res = await api.auth.register(data);
    setToken(res.token);
    setUser(res.user);
    initPushNotifications("customer");
    return res;
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (data) => {
    const res = await api.auth.login(data);
    setToken(res.token);
    setUser(res.user);
    initPushNotifications("customer");
    return res;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // ── Update profile (called after profile edit) ─────────────────────────────
  const updateUser = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};