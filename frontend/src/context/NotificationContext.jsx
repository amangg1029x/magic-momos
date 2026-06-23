import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import api, { getToken, getAdminToken, getDeliveryToken } from "../services/api";

const NotificationContext = createContext(null);

// Toast auto-dismiss duration (ms)
const TOAST_DURATION = 5000;
// Polling intervals
const CUSTOMER_POLL_MS  = 15000;
const ADMIN_POLL_MS     = 10000;
const DELIVERY_POLL_MS  = 15000;

let toastIdCounter = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount,   setUnreadCount]      = useState(0);
  const [toasts,        setToasts]           = useState([]);
  const seenIdsRef = useRef(new Set());
  const pollRef    = useRef(null);

  // ── Detect which role is currently active ─────────────────────────────────
  const getActiveRole = useCallback(() => {
    if (getAdminToken())    return "admin";
    if (getDeliveryToken()) return "delivery";
    if (getToken())         return "customer";
    return null;
  }, []);

  // ── Add a toast ───────────────────────────────────────────────────────────
  const addToast = useCallback((toast) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION + 500); // extra 500ms for exit animation
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Fetch notifications from the correct endpoint ─────────────────────────
  const fetchNotifications = useCallback(async () => {
    const role = getActiveRole();
    if (!role) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      let res;
      if (role === "admin")    res = await api.admin.notifications.getAll();
      else if (role === "delivery") res = await api.delivery.notifications.getAll();
      else                     res = await api.auth.notifications.getAll();

      if (!res?.success) return;

      const incoming = res.notifications || [];
      setUnreadCount(res.unreadCount || 0);
      setNotifications(incoming);

      // ── Detect brand-new notifications → trigger toasts ──────────────────
      const newOnes = incoming.filter((n) => !seenIdsRef.current.has(n._id));
      newOnes.forEach((n) => {
        seenIdsRef.current.add(n._id);
        // Only toast for unread
        if (!n.read) {
          const toastType =
            n.type === "order_placed" ? "info"    :
            n.type === "order_status" ? "success" :
            n.type === "payment"      ? "success" :
            n.type === "coupon"       ? "info"    : "info";
          addToast({ type: toastType, title: n.title, body: n.body, notificationId: n._id });
        }
      });
    } catch {
      // Silently ignore network errors during polling
    }
  }, [getActiveRole, addToast]);

  // ── Start / stop polling based on auth state ──────────────────────────────
  useEffect(() => {
    const role = getActiveRole();
    if (!role) return;

    fetchNotifications(); // immediate first fetch

    const intervalMs =
      role === "admin"    ? ADMIN_POLL_MS    :
      role === "delivery" ? DELIVERY_POLL_MS :
      CUSTOMER_POLL_MS;

    pollRef.current = setInterval(fetchNotifications, intervalMs);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchNotifications, getActiveRole]);

  // ── Mark single notification as read ─────────────────────────────────────
  const markRead = useCallback(async (id) => {
    const role = getActiveRole();
    try {
      if (role === "admin")    await api.admin.notifications.markRead(id);
      else if (role === "delivery") await api.delivery.notifications.markRead(id);
      else                     await api.auth.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  }, [getActiveRole]);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    const role = getActiveRole();
    try {
      if (role === "admin")    await api.admin.notifications.markAllRead();
      else if (role === "delivery") await api.delivery.notifications.markAllRead();
      else                     await api.auth.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  }, [getActiveRole]);

  // ── Refresh (called externally after login/logout) ────────────────────────
  const refreshNotifications = useCallback(() => {
    seenIdsRef.current.clear();
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        markRead,
        markAllRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
};
