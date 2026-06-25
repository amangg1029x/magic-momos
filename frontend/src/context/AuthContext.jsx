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
        // Persist a lightweight user snapshot for offline resilience
        try { localStorage.setItem("mm_user_cache", JSON.stringify(user)); } catch {}
        initPushNotifications("customer");
      })
      .catch((err) => {
        // Only wipe the token when the server explicitly rejects it (401).
        // Network errors (offline, timeout, DNS failure) must NOT log the user out —
        // the token is still valid; the device just has no connectivity right now.
        if (err?.status === 401) {
          clearToken();
          localStorage.removeItem("mm_user_cache");
        } else {
          // Restore from cache so the UI still shows the user as logged in
          try {
            const cached = localStorage.getItem("mm_user_cache");
            if (cached) setUser(JSON.parse(cached));
          } catch {}
        }
      })
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
    try { localStorage.setItem("mm_user_cache", JSON.stringify(res.user)); } catch {}
    initPushNotifications("customer");
    return res;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    localStorage.removeItem("mm_user_cache");
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