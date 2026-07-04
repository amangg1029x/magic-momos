import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import api, { getToken, getAdminToken, getDeliveryToken } from "../services/api";

class RingtonePlayer {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
  }

  start(loop = true) {
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

      // Note helper for music-box style synth
      const playNote = (freq, startTime, duration, amp) => {
        if (!this.audioCtx || freq === 0) return;
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(amp, startTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const noteFreqs = {
        C4: 261.63, E4: 329.63, G4: 392.00, C5: 523.25,
        A4: 440.00, E5: 659.25, G5: 783.99, C6: 1046.50
      };

      // Play beautiful arpeggio
      playNote(noteFreqs.C4, now + 0.0, 0.4, 0.15);
      playNote(noteFreqs.E4, now + 0.2, 0.4, 0.15);
      playNote(noteFreqs.G4, now + 0.4, 0.4, 0.15);
      playNote(noteFreqs.C5, now + 0.6, 0.8, 0.2);

      playNote(noteFreqs.G4, now + 1.0, 0.4, 0.15);
      playNote(noteFreqs.A4, now + 1.2, 0.4, 0.15);
      playNote(noteFreqs.C5, now + 1.4, 0.4, 0.15);
      playNote(noteFreqs.E5, now + 1.6, 0.8, 0.2);

      playNote(noteFreqs.C5, now + 2.0, 0.4, 0.15);
      playNote(noteFreqs.E5, now + 2.2, 0.4, 0.15);
      playNote(noteFreqs.G5, now + 2.4, 0.4, 0.15);
      playNote(noteFreqs.C6, now + 2.6, 1.0, 0.25);
    };

    try {
      playRingCycle();
    } catch (e) {
      console.warn("Failed to play ring tone immediately:", e);
    }
    if (loop) {
      this.intervalId = setInterval(playRingCycle, 5000);
    }
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
        // Fetch setting status to determine if we should loop or play once
        (async () => {
          let loop = true;
          try {
            const settingsRes = await api.settings.get();
            if (settingsRes.success && settingsRes.settings) {
              loop = settingsRes.settings.alarmRingEnabled !== false;
            }
          } catch (e) {
            console.warn("Failed to fetch settings for alarm mode, defaulting to true", e);
          }
          setIsRinging(loop); // UI banner only needs to show if looping/must be dismissed
          ringtone.start(loop);
        })();
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
