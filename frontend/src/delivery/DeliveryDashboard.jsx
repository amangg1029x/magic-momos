import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Phone, Package, Clock, CheckCircle2,
  Truck, RefreshCw, LogOut, ChevronDown, ChevronUp,
  Navigation, AlertCircle,
} from "lucide-react";
import api from "../services/api";
import NotificationBell from "../components/NotificationBell";

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
  "Preparing":        { bg: "#7c3aed", label: "Preparing", icon: Clock },
  "Out for Delivery": { bg: "#2563eb", label: "Out for Delivery", icon: Truck },
  "Delivered":        { bg: "#10b981", label: "Delivered", icon: CheckCircle2 },
};

// ── Order Card ────────────────────────────────────────────────────────────────

function OrderCard({ order, onUpdate, updating }) {
  const [expanded, setExpanded] = useState(false);
  const id       = order._id;
  const cfg      = STATUS_STYLE[order.status] || STATUS_STYLE["Preparing"];
  const StatusIcon = cfg.icon;
  const addr     = order.deliveryAddress || order.address;
  const lat      = addr?.lat;
  const lng      = addr?.lng;
  const mapUrl   = lat && lng
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(addr))}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-2xl overflow-hidden shadow-lg"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
    >
      {/* ── status strip ── */}
      <div className="h-1" style={{ background: cfg.bg }} />

      {/* ── header ── */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* order number + badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-base text-white tracking-wide">
              {order.orderNumber}
            </span>
            <span className="font-body text-xs font-600 px-2.5 py-0.5 rounded-full text-white/90"
                  style={{ background: cfg.bg }}>
              <StatusIcon size={11} className="inline mr-1" />
              {order.status}
            </span>
          </div>

          {/* customer */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-700 text-white shrink-0"
                 style={{ background: "rgba(255,255,255,0.15)" }}>
              {order.customer?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <span className="font-body text-sm text-white/80">{order.customer?.name}</span>
          </div>

          {/* time */}
          <p className="font-body text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            <Clock size={11} className="inline mr-1" />
            {order.status === "Delivered" && order.deliveredAt ? (
              <span className="text-[#4ade80] font-500">Delivered {timeAgo(order.deliveredAt)}</span>
            ) : (
              `Ordered ${timeAgo(order.createdAt)}`
            )}
          </p>
        </div>

        {/* total + expand */}
        <div className="text-right shrink-0">
          <p className="font-display text-lg text-white">₹{order.total}</p>
          <p className="font-body text-xs" style={{ color: order.paymentStatus === "Paid" ? "#4ade80" : "rgba(255,255,255,0.4)" }}>
            {order.paymentMethod?.toUpperCase()} · {order.paymentStatus}
          </p>
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-2 text-white/40 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
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
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4"
                 style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>

              {/* phone */}
              <div className="flex items-center gap-3 pt-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: "rgba(34,197,94,0.15)" }}>
                  <Phone size={16} style={{ color: "#4ade80" }} />
                </div>
                <div>
                  <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Phone</p>
                  <a href={`tel:${order.customer?.phone}`}
                     className="font-body text-sm text-white font-600 hover:text-green-400 transition-colors">
                    {order.customer?.phone || "—"}
                  </a>
                </div>
              </div>

              {/* address */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: "rgba(59,130,246,0.15)" }}>
                  <MapPin size={16} style={{ color: "#60a5fa" }} />
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Delivery Address</p>
                  <p className="font-body text-sm text-white/90 leading-snug">{formatAddress(addr)}</p>
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 mt-1.5 font-body text-xs font-600 transition-colors"
                     style={{ color: "#60a5fa" }}>
                    <Navigation size={12} /> Open in Maps
                  </a>
                </div>
              </div>

              {/* items */}
              <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.25)" }}>
                <p className="font-body text-xs mb-2 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <Package size={12} /> ITEMS ({order.items?.length})
                </p>
                <div className="space-y-1.5">
                  {(order.items || []).map((it, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {it.imageUrl ? (
                          <img src={it.imageUrl} alt={it.name}
                               className="w-7 h-7 rounded-lg object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-700 text-white"
                               style={{ background: "rgba(255,255,255,0.1)" }}>
                            {it.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="font-body text-sm text-white/80">
                          {it.qty || it.quantity}× {it.name}
                        </span>
                      </div>
                      <span className="font-body text-sm font-600 text-white/70">
                        ₹{(it.price || 0) * (it.qty || it.quantity || 1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* special instructions */}
              {order.specialInstructions && (
                <div className="flex items-start gap-2 rounded-xl p-3"
                     style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                  <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: "#facc15" }} />
                  <p className="font-body text-xs" style={{ color: "#fde047" }}>
                    {order.specialInstructions}
                  </p>
                </div>
              )}

              {/* action buttons */}
              <div className="flex gap-2 pt-1">
                {order.status === "Preparing" && (
                  <button
                    disabled={updating}
                    onClick={() => onUpdate(id, "Out for Delivery")}
                    className="flex-1 py-2.5 rounded-xl font-body font-700 text-sm text-white
                               flex items-center justify-center gap-2 transition-all
                               disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
                  >
                    <Truck size={15} /> Pick Up Order
                  </button>
                )}
                {order.status === "Out for Delivery" && (
                  <button
                    disabled={updating}
                    onClick={() => onUpdate(id, "Delivered")}
                    className="flex-1 py-2.5 rounded-xl font-body font-700 text-sm text-white
                               flex items-center justify-center gap-2 transition-all
                               disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                  >
                    <CheckCircle2 size={15} /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DeliveryDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("active");
  const [orders,   setOrders]   = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const pollRef = useRef(null);

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
    if (activeTab === "history") {
      fetchHistory(false);
    } else {
      fetchOrders(false);
    }
  };

  const handleUpdate = async (id, status) => {
    setUpdating(true);
    try {
      await api.delivery.updateStatus(id, status);
      // optimistic update — remove "Delivered" orders immediately
      if (status === "Delivered") {
        setOrders(prev => prev.filter(o => (o._id || o.id) !== id));
        fetchHistory(true);
      } else {
        setOrders(prev => prev.map(o => ((o._id || o.id) === id ? { ...o, status } : o)));
      }
    } catch {
      // re-fetch to get accurate state
      await fetchOrders(true);
    } finally {
      setUpdating(false);
    }
  };

  const preparing        = orders.filter(o => o.status === "Preparing");
  const outForDelivery   = orders.filter(o => o.status === "Out for Delivery");

  return (
    <div className="min-h-screen pb-12" style={{ background: "linear-gradient(135deg, #0f1923 0%, #0d1f13 100%)" }}>

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
              Magic Momos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                  title="Refresh">
            <RefreshCw size={15} className={(loading || loadingHistory) ? "animate-spin text-green-400" : "text-white/50"} />
          </button>
          <NotificationBell theme="delivery" />
          <button onClick={onLogout}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  style={{ background: "rgba(239,68,68,0.15)" }}
                  title="Logout">
            <LogOut size={15} style={{ color: "#f87171" }} />
          </button>
        </div>
      </header>

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
            Delivery History ({historyOrders.length})
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
                          <OrderCard key={o._id} order={o} onUpdate={handleUpdate} updating={updating} />
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
                          <OrderCard key={o._id} order={o} onUpdate={handleUpdate} updating={updating} />
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
                    <OrderCard key={o._id} order={o} onUpdate={handleUpdate} updating={updating} />
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
