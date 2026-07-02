import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import api, { getToken, getAdminToken, getDeliveryToken } from "../services/api";

class RingtonePlayer {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
  }

  start() {
    if (this.intervalId) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.audioCtx = new AudioContextClass();

    const playRingCycle = () => {
      if (!this.audioCtx) return;
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume().catch(() => {});
      }
      const now = this.audioCtx.currentTime;

      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const mainGain = this.audioCtx.createGain();
      const tremolo = this.audioCtx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(853, now);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(960, now);

      const lfo = this.audioCtx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(16, now);
      
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(0.5, now);

      mainGain.gain.setValueAtTime(0, now);
      mainGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      mainGain.gain.setValueAtTime(0.3, now + 1.2);
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      lfo.connect(lfoGain);
      lfoGain.connect(tremolo.gain);

      osc1.connect(tremolo);
      osc2.connect(tremolo);
      tremolo.connect(mainGain);
      mainGain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      lfo.start(now);

      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);
      lfo.stop(now + 1.5);
    };

    try {
      playRingCycle();
    } catch (e) {
      console.warn("Failed to play ring tone immediately:", e);
    }
    this.intervalId = setInterval(playRingCycle, 3000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

const ringtone = new RingtonePlayer();

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
  const [isRinging,     setIsRinging]        = useState(false);
  const seenIdsRef = useRef(new Set());
  const pollRef    = useRef(null);

  const stopRinging = useCallback(() => {
    ringtone.stop();
    setIsRinging(false);
  }, []);

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
      let shouldRing = false;
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

          // If role is admin and notification type is order_placed and created within last 15 minutes
          if (role === "admin" && n.type === "order_placed") {
            const timeDiff = Date.now() - new Date(n.createdAt).getTime();
            if (timeDiff < 15 * 60 * 1000) {
              shouldRing = true;
            }
          }
        }
      });

      if (shouldRing) {
        setIsRinging(true);
        ringtone.start();
      }
    } catch {
      // Silently ignore network errors during polling
    }
  }, [getActiveRole, addToast]);

  // ── Start / stop polling based on auth state ──────────────────────────────
  useEffect(() => {
    const role = getActiveRole();
    if (!role) {
      ringtone.stop();
      setIsRinging(false);
      return;
    }

    fetchNotifications(); // immediate first fetch

    const intervalMs =
      role === "admin"    ? ADMIN_POLL_MS    :
      role === "delivery" ? DELIVERY_POLL_MS :
      CUSTOMER_POLL_MS;

    pollRef.current = setInterval(fetchNotifications, intervalMs);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      ringtone.stop();
      setIsRinging(false);
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
        isRinging,
        stopRinging,
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
