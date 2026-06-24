import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, MapPin, Truck, Clock, CheckCircle, RefreshCw, Radio } from "lucide-react";
import { useNav } from "../context/NavigationContext";
import api from "../services/api";

// Fix Leaflet default icon path broken by Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Custom map icons ───────────────────────────────────────────────────────────
const customerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:40px;height:40px;border-radius:50%;
    background:linear-gradient(135deg,#e8284b,#b91c1c);
    display:flex;align-items:center;justify-content:center;
    font-size:20px;box-shadow:0 4px 14px rgba(232,40,75,0.45);
    border:3px solid white;">🏠</div>`,
  iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -22],
});

const deliveryIcon = L.divIcon({
  className: "",
  html: `<div id="delivery-icon" style="
    width:46px;height:46px;border-radius:50%;
    background:linear-gradient(135deg,#16a34a,#15803d);
    display:flex;align-items:center;justify-content:center;
    font-size:22px;box-shadow:0 4px 20px rgba(22,163,74,0.55);
    border:3px solid white;
    animation:gpulse 2s infinite;">🛵</div>
  <style>@keyframes gpulse{
    0%,100%{box-shadow:0 4px 16px rgba(22,163,74,0.5);}
    50%{box-shadow:0 4px 32px rgba(22,163,74,0.95);}
  }</style>`,
  iconSize: [46, 46], iconAnchor: [23, 23], popupAnchor: [0, -24],
});

// Fits the map to all visible pins
function MapBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(L.latLngBounds(positions.map((p) => [p.lat, p.lng])), { padding: [60, 60] });
    } else if (positions.length === 1) {
      map.setView([positions[0].lat, positions[0].lng], 15);
    }
  }, [positions, map]);
  return null;
}

// ── Progress step config ───────────────────────────────────────────────────────
const STEPS = [
  { key: "Pending",          emoji: "⏳", label: "Placed"     },
  { key: "Confirmed",        emoji: "✅", label: "Confirmed"  },
  { key: "Preparing",        emoji: "👨‍🍳", label: "Preparing" },
  { key: "Out for Delivery", emoji: "🛵", label: "On the way" },
  { key: "Delivered",        emoji: "🏠", label: "Delivered!" },
];
const STEP_IDX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function TrackOrderPage() {
  const { pageData, navigate, goBack } = useNav();
  const orderId  = pageData?.orderId;
  const initAddr = pageData?.address;

  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [lastPoll, setLastPoll] = useState(null);
  const pollRef = useRef(null);

  const fetchOrder = useCallback(async (quiet = false) => {
    if (!orderId) return;
    if (!quiet) setLoading(true);
    try {
      const res = await api.orders.track(orderId);
      setOrder(res.order);
      setLastPoll(new Date());
      setError("");
    } catch (err) {
      setError(err.message || "Could not load order.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [orderId]);

  // Initial + 10-second polling
  useEffect(() => {
    if (!orderId) { navigate("home"); return; }
    fetchOrder();
    pollRef.current = setInterval(() => fetchOrder(true), 10000);
    return () => clearInterval(pollRef.current);
  }, [orderId, fetchOrder, navigate]);

  // Stop polling once delivered / cancelled
  useEffect(() => {
    if (order?.status === "Delivered" || order?.status === "Cancelled") {
      clearInterval(pollRef.current);
    }
  }, [order?.status]);

  if (!orderId) return null;

  const addr           = order?.address ?? initAddr;
  const hasCustomerPin = addr?.lat != null && addr?.lng != null;
  const hasDeliveryPin = order?.deliveryLocation?.lat != null;

  const mapPositions = [
    ...(hasCustomerPin ? [{ lat: addr.lat, lng: addr.lng }] : []),
    ...(hasDeliveryPin ? [{ lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng }] : []),
  ];
  const mapCenter = mapPositions[0] ?? { lat: 28.6139, lng: 77.209 }; // Delhi fallback

  const stepIdx  = STEP_IDX[order?.status ?? "Pending"] ?? 0;
  const isActive = order?.status && !["Delivered", "Cancelled"].includes(order.status);

  return (
    <div className="min-h-screen" style={{ background: "#0d0f14" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3"
              style={{ background: "rgba(13,15,20,0.85)", backdropFilter: "blur(16px)",
                       borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <button id="track-back-btn" onClick={() => goBack()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.08)" }}>
            <ArrowLeft size={16} className="text-white/70" />
          </button>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm text-white leading-none">LIVE TRACKING</p>
          {order?.orderNumber && (
            <p className="font-body text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {order.orderNumber}
            </p>
          )}
        </div>
        {isActive && (
          <motion.div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}
                      animate={{ opacity: [1, 0.45, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity }}>
            <Radio size={10} style={{ color: "#4ade80" }} />
            <span className="font-body text-[10px] font-700" style={{ color: "#4ade80" }}>Live</span>
          </motion.div>
        )}
        <button id="track-refresh-btn" onClick={() => fetchOrder(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)" }}>
          <RefreshCw size={14} className={loading ? "animate-spin text-green-400" : "text-white/35"} />
        </button>
      </header>

      {/* ── Map ── */}
      <div style={{ height: "52vh", position: "relative", zIndex: 0 }}>
        {mapPositions.length > 0 ? (
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={14}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />
            <MapBounds positions={mapPositions} />

            {hasCustomerPin && (
              <Marker position={[addr.lat, addr.lng]} icon={customerIcon}>
                <Popup>
                  <strong>📦 Your delivery address</strong><br />
                  <span style={{ fontSize: 12, color: "#666" }}>
                    {[addr.street, addr.city, addr.pincode].filter(Boolean).join(", ")}
                  </span>
                </Popup>
              </Marker>
            )}

            {hasDeliveryPin && (
              <Marker position={[order.deliveryLocation.lat, order.deliveryLocation.lng]} icon={deliveryIcon}>
                <Popup>
                  <strong>🛵 Delivery partner</strong><br />
                  {order.deliveryLocation.updatedAt && (
                    <span style={{ fontSize: 12, color: "#666" }}>
                      Updated {timeAgo(order.deliveryLocation.updatedAt)}
                    </span>
                  )}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4"
               style={{ background: "rgba(255,255,255,0.02)" }}>
            {loading ? (
              <>
                <RefreshCw size={30} className="animate-spin" style={{ color: "#4ade80" }} />
                <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading map…</p>
              </>
            ) : (
              <>
                <div className="text-5xl">📍</div>
                <p className="font-body text-sm text-center max-w-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {order?.status === "Preparing"
                    ? "Your momos are being prepared. Map will show when the delivery partner picks up your order."
                    : "Waiting for location data…"}
                </p>
              </>
            )}
          </div>
        )}

        {/* Staleness badge */}
        {hasDeliveryPin && order?.deliveryLocation?.updatedAt && (
          <div className="absolute bottom-3 right-3 z-[999] flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
               style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
            <MapPin size={11} style={{ color: "#60a5fa" }} />
            <span className="font-body text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>
              Updated {timeAgo(order.deliveryLocation.updatedAt)}
            </span>
          </div>
        )}
      </div>

      {/* ── Info Panel ── */}
      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto pb-16">

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2.5 rounded-xl px-4 py-3"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="font-body text-xs" style={{ color: "#fca5a5" }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress stepper */}
        {order && order.status !== "Cancelled" && (
          <div className="rounded-2xl p-5"
               style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="font-body text-[10px] uppercase tracking-widest mb-5"
               style={{ color: "rgba(255,255,255,0.3)" }}>Order Progress</p>

            <div className="relative flex justify-between items-start">
              {/* Track lines */}
              <div className="absolute top-5 left-5 right-5 h-0.5"
                   style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="absolute top-5 left-5 h-0.5 transition-all duration-700"
                   style={{
                     width: `calc(${(stepIdx / (STEPS.length - 1)) * 100}% * ((100% - 40px) / 100%))`,
                     background: "linear-gradient(90deg,#22c55e,#16a34a)",
                   }} />

              {STEPS.map((step, i) => (
                <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-base border-2 transition-all duration-500"
                       style={{
                         background:  i <= stepIdx ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(255,255,255,0.05)",
                         borderColor: i <= stepIdx ? "#22c55e" : "rgba(255,255,255,0.1)",
                         boxShadow:   i === stepIdx ? "0 0 0 4px rgba(34,197,94,0.18)" : "none",
                       }}>
                    {step.emoji}
                  </div>
                  <span className="font-body text-[9px] text-center leading-tight"
                        style={{ color: i <= stepIdx ? "#4ade80" : "rgba(255,255,255,0.25)", maxWidth: 46 }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-5 text-center font-body text-sm"
               style={{ color: order.status === "Delivered" ? "#4ade80" : "rgba(255,255,255,0.75)" }}>
              {order.status === "Delivered"        ? "🎉 Delivered! Enjoy your momos!"
               : order.status === "Out for Delivery" ? "🛵 Your delivery partner is on the way!"
               : order.status === "Preparing"        ? "👨‍🍳 Your momos are being prepared…"
               : order.status === "Confirmed"         ? "✅ Order confirmed — kitchen starting soon."
               :                                        "⏳ Order received, awaiting confirmation."}
            </p>
          </div>
        )}

        {/* ETA row */}
        {order && !["Delivered", "Cancelled"].includes(order.status) && (
          <div className="flex items-center gap-3 rounded-2xl p-4"
               style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.13)" }}>
            <Clock size={18} style={{ color: "#60a5fa" }} className="shrink-0" />
            <div>
              <p className="font-body text-sm font-700" style={{ color: "#93c5fd" }}>Estimated delivery</p>
              <p className="font-body text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                {order.estimatedDeliveryMins ?? 25}–{(order.estimatedDeliveryMins ?? 25) + 10} mins
                {lastPoll && ` · Updated ${timeAgo(lastPoll)}`}
              </p>
            </div>
          </div>
        )}

        {/* Delivered banner */}
        {order?.status === "Delivered" && (
          <div className="flex flex-col items-center gap-3 rounded-2xl p-6 text-center"
               style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)" }}>
            <CheckCircle size={36} style={{ color: "#4ade80" }} />
            <p className="font-display text-xl text-white">Delivered! 🎉</p>
            {order.deliveredAt && (
              <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                {timeAgo(order.deliveredAt)}
              </p>
            )}
          </div>
        )}

        {/* Delivery address card */}
        {addr && (
          <div className="flex items-start gap-3 rounded-2xl p-4"
               style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: "#60a5fa" }} />
            <div>
              <p className="font-body text-[10px] uppercase tracking-wider mb-0.5"
                 style={{ color: "rgba(255,255,255,0.3)" }}>Delivering to</p>
              <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                {typeof addr === "string"
                  ? addr
                  : [addr.street, addr.city, addr.pincode].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* No GPS note */}
        {!hasDeliveryPin && order?.status === "Out for Delivery" && (
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-3"
               style={{ background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.15)" }}>
            <Truck size={14} className="shrink-0" style={{ color: "#facc15" }} />
            <p className="font-body text-xs" style={{ color: "#fde047" }}>
              Delivery partner location loading… map will update in ~10 s.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button id="track-order-again-btn"
                  onClick={() => navigate("menu")}
                  className="flex-1 py-3 rounded-xl font-body font-700 text-sm text-white"
                  style={{ background: "linear-gradient(135deg,#e8284b,#b91c1c)" }}>
            🛒 Order Again
          </button>
          <button id="track-go-home-btn"
                  onClick={() => navigate("home")}
                  className="flex-1 py-3 rounded-xl font-body font-700 text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                           color: "rgba(255,255,255,0.65)" }}>
            🏠 Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
