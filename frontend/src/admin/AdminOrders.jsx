import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Loader2, ChevronLeft, ChevronRight,
  Phone, MapPin, CreditCard, Package,
} from "lucide-react";
import api from "../services/api";
import { STATUS_CONFIG } from "../data/adminData";

const STATUSES = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

// Address may come back as a plain string, or as an object like
// { street, city, pincode } depending on how the order was placed —
// never render the raw object as a React child.
function formatAddress(addr) {
  if (!addr) return "—";
  if (typeof addr === "string") return addr;
  const { street, city, pincode } = addr;
  return [street, city, pincode].filter(Boolean).join(", ") || "—";
}

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async (page = 1, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.admin.orders.getAll({
        page,
        limit: 10,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search ? { search } : {}),
      });
      setOrders(res.orders || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setOrders([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(() => fetchOrders(1, false), 300);
    return () => clearTimeout(t);
  }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(pagination.page, true);
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchOrders, pagination.page]);

  const handleUpdateStatus = async (id, status) => {
    setUpdating(true);
    try {
      await api.admin.orders.updateStatus(id, status);
      setOrders((prev) =>
        prev.map((o) => ((o._id || o.id) === id ? { ...o, status } : o))
      );
      setSelected((s) => (s ? { ...s, status } : s));
    } catch {
      // silently ignore — could surface a toast
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or order ID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 font-body text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#E8284B]/30 focus:border-[#E8284B]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 font-body text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-[#E8284B]/30"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={26} className="animate-spin text-[#E8284B]" />
          </div>
        ) : orders.length === 0 ? (
          <p className="font-body text-sm text-gray-400 text-center py-16">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-body text-xs text-gray-400 bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-3 font-500">Order ID</th>
                  <th className="px-5 py-3 font-500">Customer</th>
                  <th className="px-5 py-3 font-500">Items</th>
                  <th className="px-5 py-3 font-500">Amount</th>
                  <th className="px-5 py-3 font-500">Payment</th>
                  <th className="px-5 py-3 font-500">Status</th>
                  <th className="px-5 py-3 font-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const id  = o._id || o.id;
                  const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.Pending;
                  return (
                    <tr
                      key={id}
                      onClick={() => setSelected(o)}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-body font-600 text-gray-800">
                        #{id.toString().slice(-6).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 font-body text-gray-600">
                        {o.customer?.name || o.customerName}
                      </td>
                      <td className="px-5 py-3.5 font-body text-gray-500">{o.items?.length ?? "-"} items</td>
                      <td className="px-5 py-3.5 font-body font-600 text-gray-800">₹{o.totalAmount ?? o.total}</td>
                      <td className="px-5 py-3.5 font-body text-gray-500">{o.paymentMethod || "COD"}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-body text-xs font-600 px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-body text-gray-400 text-xs">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="font-body text-xs text-gray-400">
              Page {pagination.page} of {pagination.pages} · {pagination.total} orders
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchOrders(pagination.page - 1)}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchOrders(pagination.page + 1)}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* details modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 md:p-7"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg text-gray-900 tracking-wide">
                  ORDER #{(selected._id || selected.id).toString().slice(-6).toUpperCase()}
                </h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2.5 font-body text-sm text-gray-600">
                  <Phone size={15} className="text-gray-400" />
                  {selected.customer?.name || selected.customerName} · {selected.customer?.phone || selected.phone}
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-start gap-2.5 font-body text-sm text-gray-600">
                    <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      {formatAddress(selected.deliveryAddress || selected.address)}
                    </div>
                  </div>
                  {(selected.deliveryAddress?.lat || selected.address?.lat) && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selected.deliveryAddress?.lat || selected.address?.lat},${selected.deliveryAddress?.lng || selected.address?.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E8284B] font-body text-xs font-600 hover:underline ml-7 flex items-center gap-1 w-fit"
                    >
                      📍 Open Location in Google Maps
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2.5 font-body text-sm text-gray-600">
                  <CreditCard size={15} className="text-gray-400" />
                  {selected.paymentMethod || "COD"}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                <p className="font-body text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                  <Package size={13} /> ITEMS
                </p>
                <div className="space-y-1.5">
                  {(selected.items || []).map((it, i) => (
                    <div key={i} className="flex justify-between font-body text-sm text-gray-700">
                      <span>{it.quantity || it.qty}× {it.name}</span>
                      <span className="font-600">₹{(it.price || 0) * (it.quantity || it.qty || 1)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-body text-sm font-700 text-gray-900 mt-2.5 pt-2.5 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{selected.totalAmount ?? selected.total}</span>
                </div>
              </div>

              <p className="font-body text-xs font-600 text-gray-500 mb-2">UPDATE STATUS</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const active = selected.status === s;
                  return (
                    <button
                      key={s}
                      disabled={updating}
                      onClick={() => handleUpdateStatus(selected._id || selected.id, s)}
                      className={`font-body text-xs font-600 px-3 py-1.5 rounded-full transition-all disabled:opacity-50
                                  ${active ? `${cfg.dot} text-white` : `${cfg.bg} ${cfg.text}`}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}