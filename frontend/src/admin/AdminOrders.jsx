import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Loader2, ChevronLeft, ChevronRight,
  Phone, MapPin, CreditCard, Package, Map, Radio,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import { STATUS_CONFIG } from "../data/adminData";

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const restaurantIcon = L.divIcon({
  className: "",
  html: `<div style="width:42px;height:42px;border-radius:50%;
    background:linear-gradient(135deg,#e8284b,#b91c1c);
    display:flex;align-items:center;justify-content:center;
    font-size:20px;box-shadow:0 4px 14px rgba(232,40,75,0.4);border:3px solid white;">⭐</div>`,
  iconSize:[42,42],iconAnchor:[21,21],popupAnchor:[0,-22],
});

const deliveryMapIcon = L.divIcon({
  className: "",
  html: `<div style="width:42px;height:42px;border-radius:50%;
    background:linear-gradient(135deg,#16a34a,#15803d);
    display:flex;align-items:center;justify-content:center;
    font-size:20px;box-shadow:0 4px 16px rgba(22,163,74,0.5);border:3px solid white;
    animation:gpulse2 2s infinite;">🛵</div>
  <style>@keyframes gpulse2{
    0%,100%{box-shadow:0 4px 14px rgba(22,163,74,0.5);}
    50%{box-shadow:0 4px 28px rgba(22,163,74,0.9);}
  }</style>`,
  iconSize:[42,42],iconAnchor:[21,21],popupAnchor:[0,-22],
});

// RESTAURANT_COORDS — update these to your actual restaurant lat/lng
const RESTAURANT = { lat: 28.6753, lng: 77.0990, name: "Magic Momos" };

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds([[RESTAURANT.lat, RESTAURANT.lng], ...positions.map(p => [p.lat, p.lng])]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
}

function AdminLiveMap() {
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const pollRef = useRef(null);

  const fetchLive = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await api.admin.orders.getAll({ status: "Out for Delivery", limit: 50 });
      setLiveOrders(res.orders || []);
    } catch { /* keep stale */ }
    finally { if (!quiet) setLoading(false); }
  }, []);

  useEffect(() => {
    fetchLive();
    pollRef.current = setInterval(() => fetchLive(true), 15000);
    return () => clearInterval(pollRef.current);
  }, [fetchLive]);

  const pins = liveOrders
    .filter(o => o.deliveryLocation?.lat != null)
    .map(o => ({ lat: o.deliveryLocation.lat, lng: o.deliveryLocation.lng,
                 name: o.customer?.name, num: o.orderNumber }));

  return (
    <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 mb-5"
         style={{ height: 380 }}>
      {loading ? (
        <div className="h-full flex items-center justify-center bg-gray-50">
          <Loader2 size={28} className="animate-spin text-[#E8284B]" />
        </div>
      ) : (
        <MapContainer
          center={[RESTAURANT.lat, RESTAURANT.lng]}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
          zoomControl
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO"
          />
          {pins.length > 0 && <FitBounds positions={pins} />}

          {/* Restaurant pin */}
          <Marker position={[RESTAURANT.lat, RESTAURANT.lng]} icon={restaurantIcon}>
            <Popup><strong>⭐ {RESTAURANT.name}</strong></Popup>
          </Marker>

          {/* Delivery pins */}
          {pins.map((p, i) => (
            <Marker key={i} position={[p.lat, p.lng]} icon={deliveryMapIcon}>
              <Popup>
                <strong>🛵 {p.num}</strong><br />
                <span style={{ fontSize: 12, color: "#555" }}>{p.name}</span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {/* Overlay: no active deliveries */}
      {!loading && pins.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2
                        bg-white/80 backdrop-blur-sm text-mm-cream rounded-2xl" style={{ zIndex: 999 }}>
          <div className="text-4xl">🛵</div>
          <p className="font-body text-sm font-700">No active deliveries right now</p>
          <p className="font-body text-xs text-mm-muted">
            Map will update when orders are Out for Delivery
          </p>
        </div>
      )}
    </div>
  );
}

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

// ── OrderCard ─────────────────────────────────────────────────────────────────
// Mobile stand-in for a table row. Keeps the same data/order as the table
// but stacked so nothing gets clipped under ~600px.
function OrderCard({ order, onSelect }) {
  const id  = order._id || order.id;
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  return (
    <button
      onClick={() => onSelect(order)}
      className="w-full text-left border border-gray-100 rounded-xl p-3.5 space-y-2
                 hover:bg-gray-50/60 active:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-body font-600 text-gray-800 text-sm">
          #{id.toString().slice(-6).toUpperCase()}
        </span>
        <span className={`font-body text-xs font-600 px-2.5 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}>
          {order.status}
        </span>
      </div>
      <div className="font-body text-sm text-gray-700">{order.customer?.name || order.customerName}</div>
      <div className="flex items-center justify-between gap-3 font-body text-xs text-gray-400">
        <span>{order.items?.length ?? "-"} items · {order.paymentMethod || "COD"}</span>
        <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "-"}</span>
      </div>
      <p className="font-display text-sm text-gray-900">₹{order.totalAmount ?? order.total}</p>
    </button>
  );
}

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showMap,  setShowMap]  = useState(false);

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

      {/* Live Map panel */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            key="live-map"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="relative">
              <AdminLiveMap />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 min-w-0">
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
                     focus:outline-none focus:ring-2 focus:ring-[#E8284B]/30 w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Live Map toggle */}
        <button
          id="admin-live-map-toggle"
          onClick={() => setShowMap(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm font-700
                      transition-all border shrink-0
                      ${showMap
                        ? "bg-green-500 text-white border-green-600 shadow-[0_4px_14px_rgba(34,197,94,0.35)]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600"}`}
        >
          {showMap ? <Radio size={14} /> : <Map size={14} />}
          {showMap ? "Hide Map" : "Live Map"}
        </button>
      </div>

      {/* orders list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={26} className="animate-spin text-[#E8284B]" />
          </div>
        ) : orders.length === 0 ? (
          <p className="font-body text-sm text-gray-400 text-center py-16">No orders found.</p>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="sm:hidden p-4 space-y-2.5">
              {orders.map((o) => (
                <OrderCard key={o._id || o.id} order={o} onSelect={setSelected} />
              ))}
            </div>

            {/* Tablet/desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
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
          </>
        )}

        {/* pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-t border-gray-100">
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
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh]
                         overflow-y-auto p-5 sm:p-6 md:p-7"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg text-gray-900 tracking-wide">
                  ORDER #{(selected._id || selected.id).toString().slice(-6).toUpperCase()}
                </h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 shrink-0">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2.5 font-body text-sm text-gray-600">
                  <Phone size={15} className="text-gray-400 shrink-0" />
                  <span className="break-words">
                    {selected.customer?.name || selected.customerName} · {selected.customer?.phone || selected.phone}
                  </span>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-start gap-2.5 font-body text-sm text-gray-600">
                    <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
                    <div className="break-words">
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
                  <CreditCard size={15} className="text-gray-400 shrink-0" />
                  {selected.paymentMethod || "COD"}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                <p className="font-body text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                  <Package size={13} /> ITEMS
                </p>
                <div className="space-y-1.5">
                  {(selected.items || []).map((it, i) => (
                    <div key={i} className="flex justify-between gap-3 font-body text-sm text-gray-700">
                      <span className="break-words">{it.quantity || it.qty}× {it.name}</span>
                      <span className="font-600 shrink-0">₹{(it.price || 0) * (it.quantity || it.qty || 1)}</span>
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