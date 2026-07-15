import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Phone, Package, Clock, CheckCircle2,
  Truck, RefreshCw, LogOut, AlertCircle, Radio,
  Moon, Sun, BellRing, BellOff, Zap, ChevronDown, ChevronUp, Navigation,
} from "lucide-react";
import api from "../services/api";
import NotificationBell from "../components/NotificationBell";
import { useNotifications } from "../context/NotificationContext";
import { initSocket, disconnectSocket } from "../services/socket";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAddress(addr) {
  if (!addr) return "—";
  if (typeof addr === "string") return addr;
  const { street, city, pincode } = addr;
  return [street, city, pincode].filter(Boolean).join(", ") || "—";
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins   = Math.floor(diffMs / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

const STATUS_STYLE = {
  "Preparing":        { bg: "#7c3aed", label: "Preparing",        icon: Clock },
  "Out for Delivery": { bg: "#2563eb", label: "Out for Delivery", icon: Truck },
};

// ── Order Card ─────────────────────────────────────────────────────────────────

function OrderCard({ order, onUpdate, updating, onAccept, myId }) {
  const [expanded, setExpanded] = useState(false);
  const id     = order._id || order.id;
  const style  = STATUS_STYLE[order.status] || STATUS_STYLE["Preparing"];
  const addr   = order.deliveryAddress || order.address;
  const lat    = addr?.lat;
  const lng    = addr?.lng;
  const mapUrl = lat && lng
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(addr))}`;

  const isAssignedToMe = order.deliveryBoy && (
    order.deliveryBoy._id === myId || order.deliveryBoy === myId
  );
  const isAssignedToOther = order.deliveryBoy && !isAssignedToMe;
  const isUnassigned = !order.deliveryBoy;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
    >
      {/* status bar */}
      <div className="h-1 w-full" style={{ background: style.bg }} />

      <div className="p-4">
        {/* header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="font-display text-white text-sm tracking-wider">
              {order.orderNumber || `#${id.toString().slice(-6).toUpperCase()}`}
            </span>
            <span className="ml-2 font-body text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: `${style.bg}30`, color: style.bg }}>
              {style.label}
            </span>
            {isAssignedToMe && (
              <span className="ml-2 font-body text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                Assigned to you
              </span>
            )}
            {isAssignedToOther && (
              <span className="ml-2 font-body text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                Taken
              </span>
            )}
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* customer */}
        <div className="flex items-center gap-2 mb-2">
          <Phone size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
          <span className="font-body text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
            {order.customer?.name}
          </span>
          {order.customer?.phone && (
            <a href={`tel:${order.customer.phone}`}
               className="ml-auto font-body text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors"
               style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
              Call
            </a>
          )}
        </div>

        {/* address */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin size={12} className="mt-0.5 shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />
          <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            {formatAddress(addr)}
          </p>
        </div>

        {/* items summary */}
        {order.items && (
          <div className="flex items-center gap-2 mb-3">
            <Package size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
            <span className="font-body text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ₹{order.total}
            </span>
          </div>
        )}

        {/* actions */}
        <div className="flex gap-2 mt-1">
          {/* Accept button — only for unassigned preparing orders */}
          {isUnassigned && order.status === "Preparing" && (
            <button
              disabled={updating}
              onClick={() => onAccept(id)}
              className="flex-1 py-2 rounded-xl font-body text-xs font-700 text-white transition-all cursor-pointer disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              <Zap size={12} className="inline mr-1" />
              Accept Order
            </button>
          )}

          {/* Pick up / Out for Delivery */}
          {isAssignedToMe && order.status === "Preparing" && (
            <button
              disabled={updating}
              onClick={() => onUpdate(id, "Out for Delivery")}
              className="flex-1 py-2 rounded-xl font-body text-xs font-700 text-white transition-all cursor-pointer disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
            >
              🛵 Pick Up
            </button>
          )}

          {/* Mark Delivered */}
          {isAssignedToMe && order.status === "Out for Delivery" && (
            <button
              disabled={updating}
              onClick={() => onUpdate(id, "Delivered")}
              className="flex-1 py-2 rounded-xl font-body text-xs font-700 text-white transition-all cursor-pointer disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              <CheckCircle2 size={12} className="inline mr-1" />
              Mark Delivered
            </button>
          )}
        </div>

        {/* ── expanded details ── */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mt-3"
            >
              <div className="pt-3 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                {/* detailed items list */}
                {order.items && (
                  <div className="space-y-1">
                    <p className="font-body text-[10px] font-600 text-white/40 uppercase tracking-wider">Items Breakdown</p>
                    {order.items.map((it, i) => (
                      <div key={i} className="flex justify-between font-body text-xs text-white/80">
                        <span>{it.quantity || it.qty}× {it.name}</span>
                        <span>₹{(it.price || 0) * (it.quantity || it.qty || 1)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* maps link */}
                <div className="pt-1">
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1.5 font-body text-xs font-600 text-blue-400 hover:text-blue-300 transition-colors">
                    <Navigation size={12} /> Open in Google Maps
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {order.specialInstructions && (
          <p className="mt-2 font-body text-[10px] italic px-2 py-1.5 rounded-lg"
             style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24" }}>
            📝 {order.specialInstructions}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── New Order Incoming Modal ───────────────────────────────────────────────────
function NewOrderModal({ order, onAccept, onIgnore, accepting }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        className="relative max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(135deg,#0f1923,#0d2310)", border: "2px solid rgba(34,197,94,0.4)" }}
      >
        {/* animated ring glow */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none"
             style={{ boxShadow: "0 0 60px rgba(34,197,94,0.3)" }}>
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-green-400/40"
            animate={{ scale: [1, 1.04, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 p-7">
          <div className="text-center mb-5">
            <motion.div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
              animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
            >
              📦
            </motion.div>
            <h2 className="font-display text-2xl text-white tracking-wide mb-1">NEW ORDER!</h2>
            <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              Accept before another rider does
            </p>
          </div>

          {order && (
            <div className="space-y-2 mb-5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-white/40 w-16 shrink-0">Order</span>
                <span className="font-display text-sm text-white">{order.orderNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-white/40 w-16 shrink-0">Customer</span>
                <span className="font-body text-xs text-white/80">{order.customer?.name}</span>
              </div>
              {order.address && (
                <div className="flex items-start gap-2">
                  <span className="font-body text-xs text-white/40 w-16 shrink-0 mt-0.5">Address</span>
                  <span className="font-body text-xs text-white/60">{formatAddress(order.address)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-white/40 w-16 shrink-0">Total</span>
                <span className="font-body text-sm font-700 text-green-400">₹{order.total}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onIgnore}
              className="flex-1 py-3 rounded-xl font-body text-xs font-700 cursor-pointer transition-all"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <BellOff size={13} className="inline mr-1" />
              Ignore
            </button>
            <button
              disabled={accepting}
              onClick={() => order && onAccept(order._id)}
              className="flex-2 flex-1 py-3 rounded-xl font-body text-xs font-700 text-white transition-all cursor-pointer disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", flex: 2 }}
            >
              <Zap size={13} className="inline mr-1" />
              {accepting ? "Accepting…" : "Accept Order"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DeliveryDashboard({ onLogout, deliveryBoy: initialBoy }) {
  const [activeTab, setActiveTab] = useState("active");
  const [orders,   setOrders]   = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [sharingLocation, setSharingLocation] = useState(false);

  // delivery boy profile state
  const [myProfile, setMyProfile] = useState(initialBoy || null);
  const [isSleeping, setIsSleeping] = useState(initialBoy?.isSleeping || false);
  const [togglingSlep, setTogglingSlep] = useState(false);

  // incoming order modal state
  const [incomingOrder, setIncomingOrder]     = useState(null);
  const [acceptingOrder, setAcceptingOrder]   = useState(false);

  const pollRef    = useRef(null);
  const watchRef   = useRef(null);
  const pingRef    = useRef(null);
  const lastPosRef = useRef(null);
  const socketRef  = useRef(null);

  const { startRinging, stopRinging } = useNotifications();

  const myId = myProfile?._id;

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.delivery.getOrders();
      setOrders(res.orders || []);
      setLastSync(new Date());
    } catch {
      // keep stale data on network error
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Load profile on mount
  useEffect(() => {
    if (!initialBoy) {
      api.delivery.getProfile().then(res => {
        if (res.success) {
          setMyProfile(res.deliveryBoy);
          setIsSleeping(res.deliveryBoy.isSleeping);
        }
      }).catch(() => {});
    }
  }, [initialBoy]);

  // ── Socket.io setup ───────────────────────────────────────────────────────
  useEffect(() => {
    const socket = initSocket();
    socketRef.current = socket;

    socket.on("new_order", (order) => {
      if (!isSleeping) {
        setIncomingOrder(order);
        startRinging(true);
      }
    });

    socket.on("order_accepted", ({ orderId }) => {
      setIncomingOrder(prev => {
        if (prev && (prev._id === orderId)) {
          stopRinging();
          return null;
        }
        return prev;
      });
      stopRinging();
      fetchOrders(true);
    });

    socket.on("order_cancelled", ({ orderId }) => {
      // Remove the cancelled order from the active list immediately
      setOrders(prev => prev.filter(o => (o._id || o.id)?.toString() !== orderId?.toString()));
      // If the incoming modal is for this order, close it and stop ringing
      setIncomingOrder(prev => {
        if (prev && prev._id?.toString() === orderId?.toString()) {
          stopRinging();
          return null;
        }
        return prev;
      });
    });
    socket.on("order_assigned", () => {
      fetchOrders(true);
    });

    socket.on("order_status_update", () => {
      fetchOrders(true);
    });

    socket.on("unauthorized", () => {
      onLogout();
    });

    return () => {
      socket.off("new_order");
      socket.off("order_accepted");
      socket.off("order_cancelled");
      socket.off("order_assigned");
      socket.off("order_status_update");
      socket.off("unauthorized");
    };
  }, [isSleeping, startRinging, stopRinging, fetchOrders, onLogout]);

  // ── GPS location sharing ──────────────────────────────────────────────────
  const startLocationSharing = useCallback((outOrders) => {
    if (!navigator.geolocation) return;
    if (outOrders.length === 0) {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
      clearInterval(pingRef.current);
      pingRef.current = null;
      setSharingLocation(false);
      return;
    }

    if (watchRef.current != null) return;

    setSharingLocation(true);
    setGeoError("");

    const pingAll = (lat, lng) => {
      outOrders.forEach((o) => {
        api.delivery.updateLocation(o._id, lat, lng).catch(() => {});
      });
    };

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        lastPosRef.current = { lat, lng };
        pingAll(lat, lng);
        setGeoError("");
      },
      (err) => {
        setSharingLocation(false);
        if (err.code === 1) setGeoError("Location permission denied. Enable location to allow delivery tracking.");
        else setGeoError("Could not get your location. Check GPS/network.");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    pingRef.current = setInterval(() => {
      if (lastPosRef.current) {
        pingAll(lastPosRef.current.lat, lastPosRef.current.lng);
      }
    }, 10000);
  }, []);

  useEffect(() => {
    const outForDelivery = orders.filter((o) => o.status === "Out for Delivery" &&
      (o.deliveryBoy === myId || o.deliveryBoy?._id === myId));
    startLocationSharing(outForDelivery);

    return () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      clearInterval(pingRef.current);
    };
  }, [orders, startLocationSharing, myId]);

  const fetchHistory = useCallback(async (silent = false) => {
    if (!silent) setLoadingHistory(true);
    try {
      const res = await api.delivery.getHistory();
      setHistoryOrders(res.orders || []);
    } catch {
      // keep stale on error
    } finally {
      if (!silent) setLoadingHistory(false);
    }
  }, []);

  // initial load + auto-poll active tab
  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory(false);
    } else {
      fetchOrders(false);
    }

    if (activeTab === "active") {
      pollRef.current = setInterval(() => fetchOrders(true), 30000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeTab, fetchOrders, fetchHistory]);

  const handleRefresh = () => {
    if (activeTab === "history") fetchHistory(false);
    else fetchOrders(false);
  };

  const handleUpdate = async (id, status) => {
    setUpdating(true);
    try {
      await api.delivery.updateStatus(id, status);
      if (status === "Delivered") {
        setOrders(prev => prev.filter(o => (o._id || o.id) !== id));
        fetchHistory(true);
      } else {
        setOrders(prev => prev.map(o => ((o._id || o.id) === id ? { ...o, status } : o)));
      }
    } catch {
      await fetchOrders(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleAcceptOrder = async (id) => {
    setAcceptingOrder(true);
    try {
      await api.delivery.acceptOrder(id);
      setIncomingOrder(null);
      stopRinging();
      await fetchOrders(true);
    } catch (err) {
      alert(err.message || "Could not accept order.");
    } finally {
      setAcceptingOrder(false);
    }
  };

  const handleIgnoreIncoming = () => {
    setIncomingOrder(null);
    stopRinging();
  };

  const handleSleepToggle = async () => {
    setTogglingSlep(true);
    const next = !isSleeping;
    try {
      await api.delivery.toggleSleepStatus(next);
      setIsSleeping(next);
      if (next) {
        setIncomingOrder(null);
        stopRinging();
      }
      // Update socket room membership
      if (socketRef.current) {
        if (next) {
          socketRef.current.leave?.("delivery-active");
        } else {
          socketRef.current.emit("join-delivery");
        }
      }
    } catch {
      // revert on error
    } finally {
      setTogglingSlep(false);
    }
  };

  const preparing        = orders.filter(o => o.status === "Preparing");
  const outForDelivery   = orders.filter(o => o.status === "Out for Delivery");

  return (
    <div className="min-h-screen pb-12" style={{ background: "linear-gradient(135deg, #0f1923 0%, #0d1f13 100%)" }}>

      {/* ── Incoming Order Modal ── */}
      <AnimatePresence>
        {incomingOrder && (
          <NewOrderModal
            order={incomingOrder}
            onAccept={handleAcceptOrder}
            onIgnore={handleIgnoreIncoming}
            accepting={acceptingOrder}
          />
        )}
      </AnimatePresence>

      {/* ── top bar ── */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
              style={{ background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
               style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
            🛵
          </div>
          <div>
            <p className="font-display text-sm text-white leading-none">DELIVERY PORTAL</p>
            <p className="font-body text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {myProfile?.name || "Magic Momos"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Sleep Toggle */}
          <button
            onClick={handleSleepToggle}
            disabled={togglingSlep}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-700 transition-all cursor-pointer disabled:opacity-60"
            style={{
              background: isSleeping ? "rgba(234,179,8,0.15)" : "rgba(34,197,94,0.15)",
              border: `1px solid ${isSleeping ? "rgba(234,179,8,0.3)" : "rgba(34,197,94,0.3)"}`,
              color: isSleeping ? "#facc15" : "#4ade80",
            }}
            title={isSleeping ? "You're sleeping. Tap to go active." : "Tap to go to sleep mode."}
          >
            {isSleeping ? <Moon size={12} /> : <Sun size={12} />}
            {isSleeping ? "Sleeping" : "Active"}
          </button>

          {/* Live location indicator */}
          {sharingLocation && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <Radio size={11} style={{ color: "#4ade80" }} />
              <span className="font-body text-[10px] font-700" style={{ color: "#4ade80" }}>Live</span>
            </motion.div>
          )}

          <button onClick={handleRefresh}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.08)" }}>
            <RefreshCw size={15} className={(loading || loadingHistory) ? "animate-spin text-green-400" : "text-white/50"} />
          </button>
          <NotificationBell theme="delivery" />
          <button onClick={onLogout}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  style={{ background: "rgba(239,68,68,0.15)" }}>
            <LogOut size={15} style={{ color: "#f87171" }} />
          </button>
        </div>
      </header>

      {/* Sleep mode banner */}
      {isSleeping && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-xl px-4 py-3"
             style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)" }}>
          <Moon size={16} style={{ color: "#facc15" }} />
          <div>
            <p className="font-body text-xs font-700" style={{ color: "#fde047" }}>You are in sleep mode</p>
            <p className="font-body text-[10px]" style={{ color: "rgba(253,224,71,0.6)" }}>
              You won't receive any order notifications. Tap "Active" to go online.
            </p>
          </div>
        </div>
      )}

      {/* Geo error banner */}
      {geoError && (
        <div className="mx-4 mt-3 flex items-start gap-2.5 rounded-xl p-3"
             style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
          <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: "#f87171" }} />
          <p className="font-body text-xs" style={{ color: "#fca5a5" }}>{geoError}</p>
        </div>
      )}

      <div className="px-4 py-5 max-w-lg mx-auto space-y-6">

        {/* ── Tabs ── */}
        <div className="flex rounded-xl p-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setActiveTab("active")}
            className="flex-1 py-2 rounded-lg font-body text-xs font-700 transition-all cursor-pointer"
            style={{
              background: activeTab === "active" ? "linear-gradient(135deg, #22c55e, #16a34a)" : "transparent",
              color: activeTab === "active" ? "#ffffff" : "rgba(255,255,255,0.6)",
            }}
          >
            Active Deliveries ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className="flex-1 py-2 rounded-lg font-body text-xs font-700 transition-all cursor-pointer"
            style={{
              background: activeTab === "history" ? "linear-gradient(135deg, #22c55e, #16a34a)" : "transparent",
              color: activeTab === "history" ? "#ffffff" : "rgba(255,255,255,0.6)",
            }}
          >
            My Deliveries ({historyOrders.length})
          </button>
        </div>

        {activeTab === "active" ? (
          <div className="space-y-6">
            {/* ── stats row ── */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Preparing",        value: preparing.length,      color: "#a78bfa", bg: "rgba(124,58,237,0.15)" },
                { label: "Out for Delivery", value: outForDelivery.length, color: "#60a5fa", bg: "rgba(37,99,235,0.15)" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 text-center"
                     style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
                  <p className="font-display text-3xl" style={{ color: s.color }}>{s.value}</p>
                  <p className="font-body text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* last sync */}
            {lastSync && (
              <p className="text-center font-body text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                Last synced: {lastSync.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                {" · "}auto-refreshes every 30s
              </p>
            )}

            {loading && orders.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <RefreshCw size={28} className="animate-spin" style={{ color: "#22c55e" }} />
                <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3 text-center">
                <div className="text-5xl">✅</div>
                <p className="font-display text-lg text-white">All clear!</p>
                <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  No active orders right now.
                </p>
              </div>
            ) : (
              <>
                {/* Out for Delivery section (priority) */}
                {outForDelivery.length > 0 && (
                  <section>
                    <h2 className="font-body text-xs font-700 mb-3 flex items-center gap-2"
                        style={{ color: "#60a5fa", letterSpacing: "0.1em" }}>
                      <Truck size={13} /> OUT FOR DELIVERY ({outForDelivery.length})
                    </h2>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {outForDelivery.map(o => (
                          <OrderCard key={o._id} order={o} onUpdate={handleUpdate} updating={updating}
                                     onAccept={handleAcceptOrder} myId={myId} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                )}

                {/* Preparing section */}
                {preparing.length > 0 && (
                  <section>
                    <h2 className="font-body text-xs font-700 mb-3 flex items-center gap-2"
                        style={{ color: "#a78bfa", letterSpacing: "0.1em" }}>
                      <Clock size={13} /> PREPARING ({preparing.length})
                    </h2>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {preparing.map(o => (
                          <OrderCard key={o._id} order={o} onUpdate={handleUpdate} updating={updating}
                                     onAccept={handleAcceptOrder} myId={myId} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loadingHistory && historyOrders.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <RefreshCw size={28} className="animate-spin text-green-400" />
                <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading history…</p>
              </div>
            ) : historyOrders.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3 text-center">
                <div className="text-5xl">📦</div>
                <p className="font-display text-lg text-white">No history yet</p>
                <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Delivered orders will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {historyOrders.map(o => (
                    <OrderCard key={o._id} order={o} onUpdate={handleUpdate} updating={updating}
                               onAccept={handleAcceptOrder} myId={myId} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
