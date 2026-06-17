import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, AlertCircle, RefreshCw, Filter, Search, X,
  Clock, CheckCircle, ChefHat, Truck, Package, XCircle,
} from "lucide-react";
import api from "../../services/api";
import { useNav } from "../../context/NavigationContext";
import { ACTIVE_STATUSES } from "./OrderStatusBadge";
import OrderCard from "./OrderCard";

// ── Filter tabs ───────────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: "all",      label: "All Orders"  },
  { key: "active",   label: "Active"      },
  { key: "past",     label: "Past"        },
];

const STATUS_ICONS = {
  "Pending":          { icon: Clock,       color: "text-yellow-500" },
  "Confirmed":        { icon: CheckCircle, color: "text-blue-500"   },
  "Preparing":        { icon: ChefHat,     color: "text-purple-500" },
  "Out for Delivery": { icon: Truck,       color: "text-indigo-500" },
  "Delivered":        { icon: Package,     color: "text-green-500"  },
  "Cancelled":        { icon: XCircle,     color: "text-red-500"    },
};

/**
 * OrdersTab
 *
 * Full orders tab used inside AccountPage.
 * Features:
 *  - Fetches all user orders from the API on mount
 *  - Filter tabs: All / Active / Past
 *  - Search by order number
 *  - Order count summary chips by status
 *  - Renders OrderCard for each order
 *  - Handles order updates (cancel / status change from tracker)
 */
export default function OrdersTab() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { navigate } = useNav();

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else        setRefreshing(true);
    setError("");
    try {
      const res = await api.orders.myOrders();
      setOrders(res.orders ?? []);
    } catch (err) {
      setError(err.message || "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Handle order updates from child cards (tracker / cancel) ─────────────
  const handleOrderUpdate = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
    );
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.has(o.status));
  const pastOrders   = orders.filter((o) => !ACTIVE_STATUSES.has(o.status));

  const filtered = (
    filter === "active" ? activeOrders :
    filter === "past"   ? pastOrders   :
    orders
  ).filter((o) =>
    !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase())
  );

  // Status summary counts
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-9 h-9 rounded-full border-4 border-mm-border border-t-mm-red"
      />
      <p className="font-body text-sm text-mm-muted">Loading your orders…</p>
    </div>
  );

  if (error) return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5">
        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-body text-sm font-700 text-red-700">Failed to load orders</p>
          <p className="font-body text-xs text-red-500 mt-0.5">{error}</p>
        </div>
      </div>
      <button
        onClick={() => fetchOrders()}
        className="flex items-center gap-2 font-body text-sm font-700 text-mm-red hover:underline"
      >
        <RefreshCw size={13} /> Try again
      </button>
    </div>
  );

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <motion.span
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-6xl"
      >
        🛒
      </motion.span>
      <div>
        <h3 className="font-display text-2xl text-mm-cream mb-1">No orders yet</h3>
        <p className="font-body text-sm text-mm-muted max-w-xs">
          Looks like you haven't placed an order. Explore our menu and order something delicious!
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
        onClick={() => navigate("menu")}
        className="mt-1 bg-mm-red text-white px-7 py-3 rounded-full font-body font-700 text-sm
                   hover:bg-red-600 transition-colors shadow-[0_4px_16px_rgba(232,40,75,0.25)]"
      >
        Browse Menu →
      </motion.button>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Summary bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-mm-border rounded-2xl p-4 shadow-[0_2px_12px_rgba(42,30,27,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <p className="font-body text-xs text-mm-muted uppercase tracking-wider">
            Order Summary
          </p>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 font-body text-xs text-mm-muted
                       hover:text-mm-red transition-colors disabled:opacity-50"
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={refreshing ? { duration: 0.9, repeat: Infinity, ease: "linear" } : {}}
            >
              <RefreshCw size={12} />
            </motion.div>
            Refresh
          </button>
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => {
            const cfg = STATUS_ICONS[status];
            const Icon = cfg?.icon ?? Package;
            return (
              <div
                key={status}
                className="flex items-center gap-1.5 bg-mm-card2 border border-mm-border
                           rounded-full px-3 py-1.5"
              >
                <Icon size={11} className={cfg?.color ?? "text-mm-muted"} />
                <span className="font-body text-xs text-mm-cream font-700">{count}</span>
                <span className="font-body text-xs text-mm-muted">{status}</span>
              </div>
            );
          })}
        </div>

        {/* Active orders callout */}
        {activeOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2.5 bg-green-50 border border-green-100
                       rounded-xl px-3.5 py-2.5"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500 shrink-0"
            />
            <p className="font-body text-xs text-green-700 font-700">
              {activeOrders.length} active order{activeOrders.length > 1 ? "s" : ""} being tracked live
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Filter tabs + search ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* tabs */}
        <div className="flex gap-1 bg-mm-card2 border border-mm-border rounded-xl p-1">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 px-3 py-1.5 rounded-lg font-body text-xs font-700
                          transition-all duration-200 whitespace-nowrap
                          ${filter === key
                            ? "bg-mm-red text-white shadow-[0_2px_8px_rgba(232,40,75,0.25)]"
                            : "text-mm-muted hover:text-mm-cream"
                          }`}
            >
              {label}
              {key === "active" && activeOrders.length > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]
                  ${filter === key ? "bg-white/25" : "bg-mm-red/15 text-mm-red"}`}>
                  {activeOrders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* search */}
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mm-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #…"
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-mm-border bg-white
                       font-body text-sm text-mm-cream placeholder:text-mm-muted
                       focus:outline-none focus:border-mm-red/50
                       focus:shadow-[0_0_0_3px_rgba(232,40,75,0.08)]
                       transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mm-muted hover:text-mm-cream"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── No results ───────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Filter size={28} className="text-mm-muted" />
          <p className="font-body text-sm text-mm-muted">
            No orders match your filter.
          </p>
          <button
            onClick={() => { setFilter("all"); setSearch(""); }}
            className="font-body text-xs text-mm-red font-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Order cards ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {filtered.map((order, i) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.28, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <OrderCard order={order} onUpdate={handleOrderUpdate} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* total count footer */}
      {filtered.length > 0 && (
        <p className="font-body text-xs text-mm-muted text-center pt-2">
          Showing {filtered.length} of {orders.length} orders
        </p>
      )}
    </div>
  );
}
