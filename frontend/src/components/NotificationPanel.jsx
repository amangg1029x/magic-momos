import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, Package, Tag, CreditCard, Info, X, ShoppingBag } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useNav } from "../context/NavigationContext";

// ── Time ago helper ───────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins   = Math.floor(diffMs / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Icon per type ─────────────────────────────────────────────────────────────
const TYPE_META = {
  order_placed:  { icon: ShoppingBag, color: "text-blue-400",    bg: "bg-blue-500/15"   },
  order_status:  { icon: Package,     color: "text-emerald-400", bg: "bg-emerald-500/15"},
  payment:       { icon: CreditCard,  color: "text-amber-400",   bg: "bg-amber-500/15"  },
  coupon:        { icon: Tag,         color: "text-purple-400",  bg: "bg-purple-500/15" },
  system:        { icon: Info,        color: "text-slate-400",   bg: "bg-slate-500/15"  },
};

// ── Single notification row ───────────────────────────────────────────────────
function NotificationRow({ notification, onRead, theme }) {
  const meta = TYPE_META[notification.type] || TYPE_META.system;
  const Icon = meta.icon;
  const isAdmin    = theme === "admin";
  const isDelivery = theme === "delivery";

  const cardBg     = notification.read
    ? (isAdmin || isDelivery ? "bg-transparent" : "bg-transparent")
    : (isAdmin    ? "bg-white/5"
     : isDelivery ? "bg-white/5"
     : "bg-mm-red/5 border-mm-red/10");

  const borderColor = notification.read
    ? (isAdmin || isDelivery ? "border-white/5" : "border-mm-border")
    : (isAdmin || isDelivery ? "border-white/10" : "border-mm-red/15");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => !notification.read && onRead(notification._id)}
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors
        ${cardBg} ${borderColor}
        ${!notification.read ? "hover:brightness-110" : "hover:opacity-80"}`}
    >
      {/* icon badge */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
        <Icon size={16} className={meta.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-body text-[13px] font-700 leading-snug ${
            isAdmin || isDelivery ? "text-white/90" : "text-mm-cream"
          }`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
          )}
        </div>
        {notification.body && (
          <p className={`font-body text-xs mt-0.5 leading-snug ${
            isAdmin || isDelivery ? "text-white/45" : "text-mm-muted"
          }`}>
            {notification.body}
          </p>
        )}
        <p className={`font-body text-[11px] mt-1 ${
          isAdmin || isDelivery ? "text-white/25" : "text-mm-muted/60"
        }`}>
          {timeAgo(notification.createdAt)}
        </p>
      </div>
    </motion.div>
  );
}

// ── Notification Panel ────────────────────────────────────────────────────────
export default function NotificationPanel({ onClose, theme = "customer" }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const isAdmin    = theme === "admin";
  const isDelivery = theme === "delivery";

  const panelBg = isAdmin || isDelivery
    ? "bg-[#101820] border-white/10"
    : "bg-mm-card2 border-mm-border";
  const headingColor = isAdmin || isDelivery ? "text-white" : "text-mm-cream";
  const subColor     = isAdmin || isDelivery ? "text-white/40" : "text-mm-muted";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -8 }}
      transition={{ type: "spring", damping: 24, stiffness: 300 }}
      className={`absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-1rem)]
        rounded-2xl border shadow-2xl overflow-hidden z-50 ${panelBg}`}
    >
      {/* header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isAdmin || isDelivery ? "border-white/8" : "border-mm-border"
      }`}>
        <div>
          <h3 className={`font-display text-base ${headingColor}`}>Notifications</h3>
          <p className={`font-body text-xs ${subColor}`}>
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className={`flex items-center gap-1 font-body text-xs font-700 px-2.5 py-1.5 rounded-lg
                transition-colors ${
                  isAdmin || isDelivery
                    ? "text-white/50 hover:text-white hover:bg-white/10"
                    : "text-mm-muted hover:text-mm-red hover:bg-mm-red/10"
                }`}
            >
              <CheckCheck size={13} /> Mark all
            </button>
          )}
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isAdmin || isDelivery
                ? "text-white/40 hover:text-white hover:bg-white/10"
                : "text-mm-muted hover:text-mm-red hover:bg-mm-red/5"
            }`}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* list */}
      <div className="overflow-y-auto max-h-[380px] p-3 space-y-1.5 scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3 text-center">
            <Bell size={32} className={subColor} strokeWidth={1.4} />
            <p className={`font-body text-sm ${subColor}`}>No notifications yet</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n) => (
              <NotificationRow
                key={n._id}
                notification={n}
                onRead={markRead}
                theme={theme}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
