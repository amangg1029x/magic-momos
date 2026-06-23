import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import NotificationPanel from "./NotificationPanel";

/**
 * NotificationBell
 *
 * Props:
 *   theme: "customer" | "admin" | "delivery"
 *
 * Renders a bell icon with unread count badge.
 * Clicking opens/closes NotificationPanel.
 * Closes on outside click.
 */
export default function NotificationBell({ theme = "customer" }) {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isLight = theme === "customer"; // customer header can be transparent/light

  return (
    <div ref={wrapRef} className="relative">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className={`relative flex items-center justify-center rounded-xl transition-colors
          ${isLight
            ? "w-9 h-9 text-mm-cream hover:bg-mm-red/10"
            : "w-9 h-9 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
      >
        <Bell size={18} />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 300 }}
              className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1
                         rounded-full bg-red-500 text-white text-[10px] font-800
                         flex items-center justify-center leading-none shadow-md"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification panel */}
      <AnimatePresence>
        {open && (
          <NotificationPanel
            key="panel"
            theme={theme}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
