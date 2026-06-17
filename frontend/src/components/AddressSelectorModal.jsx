import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, LocateFixed, MapPin, Home, Briefcase, Star,
  CheckCircle2, AlertTriangle, Loader2, ChevronRight, Plus,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { reverseGeocode, searchGeocode } from "../services/geocode";
import { RESTAURANT_LOCATION, DELIVERY_RADIUS_KM } from "../data/restaurantConfig";

// ── Leaflet marker icons ──────────────────────────────────────────────────────
const pinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const restIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [18, 30],
  iconAnchor: [9, 30],
  className: "mm-restaurant-marker",
});

// ── Distance helper ───────────────────────────────────────────────────────────
function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Inner hook: recenter map when position changes from outside ───────────────
function FlyTo({ lat, lng }) {
  const map = useMap();
  const prev = useRef({ lat, lng });
  useEffect(() => {
    if (prev.current.lat !== lat || prev.current.lng !== lng) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
      prev.current = { lat, lng };
    }
  }, [lat, lng, map]);
  return null;
}

// ── Address type icon helper ──────────────────────────────────────────────────
function LabelIcon({ label }) {
  const l = (label || "").toLowerCase();
  if (l === "home") return <Home size={15} />;
  if (l === "work") return <Briefcase size={15} />;
  return <Star size={15} />;
}

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ═════════════════════════════════════════════════════════════════════════════
// AddressSelectorModal
//
// Props:
//   isOpen          — boolean
//   onClose         — () => void
//   onConfirm       — ({ street, city, pincode, lat, lng, inRange, distance }) => void
//   savedAddresses  — Array<{ street, city, pincode, label, lat, lng }>  (optional)
// ═════════════════════════════════════════════════════════════════════════════
export default function AddressSelectorModal({ isOpen, onClose, onConfirm, savedAddresses = [] }) {
  const [position, setPosition]         = useState({ lat: RESTAURANT_LOCATION.latitude, lng: RESTAURANT_LOCATION.longitude });
  const [hasPositioned, setHasPositioned] = useState(false);
  const [gpsStatus, setGpsStatus]       = useState("idle");
  const [geocoding, setGeocoding]       = useState(false);
  const [resolvedAddr, setResolvedAddr] = useState(null);

  const [searchQuery, setSearchQuery]   = useState("");
  const [suggestions, setSuggestions]   = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  const debouncedQuery = useDebounce(searchQuery, 400);

  const distance = hasPositioned
    ? distKm(position.lat, position.lng, RESTAURANT_LOCATION.latitude, RESTAURANT_LOCATION.longitude)
    : null;
  const inRange = distance != null ? distance <= DELIVERY_RADIUS_KM : null;

  // ── Reverse geocode when pin moves ────────────────────────────────────────
  const runReverseGeocode = useCallback(async (lat, lng) => {
    setGeocoding(true);
    const result = await reverseGeocode(lat, lng);
    setGeocoding(false);
    setResolvedAddr(result);
  }, []);

  // ── Search suggestions ────────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    searchGeocode(debouncedQuery).then((results) => {
      if (!cancelled) {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSearchLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // ── Auto-GPS on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    // Reset state on each open
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setGpsStatus("idle");
    if ("geolocation" in navigator) {
      setGpsStatus("locating");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          setHasPositioned(true);
          setGpsStatus("done");
          runReverseGeocode(latitude, longitude);
        },
        () => setGpsStatus("denied"),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Close on outside click (not inside modal) ─────────────────────────────
  // (handled via backdrop onClick)

  // ── Close suggestions on outside click ───────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
        searchRef.current && !searchRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Prevent body scroll while open ───────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleGPS = () => {
    if (!("geolocation" in navigator)) return;
    setGpsStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setHasPositioned(true);
        setGpsStatus("done");
        runReverseGeocode(latitude, longitude);
      },
      () => setGpsStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleMarkerDrag = (lat, lng) => {
    setPosition({ lat, lng });
    setHasPositioned(true);
    runReverseGeocode(lat, lng);
  };

  const handleSuggestionSelect = (s) => {
    setPosition({ lat: s.lat, lng: s.lng });
    setHasPositioned(true);
    setSearchQuery(s.shortName);
    setShowSuggestions(false);
    setSuggestions([]);
    runReverseGeocode(s.lat, s.lng);
  };

  const handleSavedSelect = (addr) => {
    if (addr.lat && addr.lng) {
      setPosition({ lat: addr.lat, lng: addr.lng });
      setHasPositioned(true);
      runReverseGeocode(addr.lat, addr.lng);
    } else {
      // No coords stored — fill fields directly without map change
      setResolvedAddr({
        city: addr.city || "",
        pincode: addr.pincode || "",
        street: addr.street || "",
        displayName: [addr.street, addr.city, addr.pincode].filter(Boolean).join(", "),
      });
      setHasPositioned(true);
    }
    setSearchQuery(addr.label ? `${addr.label}: ${addr.street || addr.city}` : addr.street || addr.city || "");
    setShowSuggestions(false);
  };

  const handleConfirm = () => {
    const city    = resolvedAddr?.city    || "";
    const pincode = resolvedAddr?.pincode || "";
    const street  = resolvedAddr?.street  || "";
    onConfirm({
      street,
      city,
      pincode,
      lat: position.lat,
      lng: position.lng,
      inRange,
      distance,
    });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        // ── Backdrop ─────────────────────────────────────────────────────────
        <motion.div
          key="asm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
          style={{ background: "rgba(30,20,18,0.72)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* ── Modal panel ──────────────────────────────────────────────── */}
          <motion.div
            key="asm-panel"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="w-full sm:max-w-2xl sm:mx-4 bg-mm-card rounded-t-3xl sm:rounded-3xl
                       flex flex-col overflow-hidden shadow-2xl"
            style={{ maxHeight: "96dvh", height: "96dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header bar ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0 border-b border-mm-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-mm-red/10 flex items-center justify-center">
                  <MapPin size={16} className="text-mm-red" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-mm-cream leading-none">Deliver To</h2>
                  <p className="font-body text-[11px] text-mm-muted mt-0.5">Move the pin to your exact spot</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-mm-card2 border border-mm-border
                           flex items-center justify-center text-mm-muted
                           hover:text-mm-cream hover:border-mm-red/30 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Search bar (outside scroll container so dropdown isn't clipped) ── */}
            <div className="px-5 pt-4 pb-3 shrink-0 border-b border-mm-border relative z-2000">
              <div ref={searchRef} className="relative">
                <div className="flex items-center gap-3 bg-white border-2 border-mm-border
                                rounded-2xl px-4 py-3 focus-within:border-mm-red/50
                                focus-within:shadow-[0_0_0_3px_rgba(232,40,75,0.08)]
                                transition-all duration-200">
                  {searchLoading
                    ? <Loader2 size={16} className="text-mm-muted animate-spin shrink-0" />
                    : <Search size={16} className="text-mm-muted shrink-0" />}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); }}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Search for area, street, landmark…"
                    className="flex-1 bg-transparent font-body text-sm text-mm-cream
                               placeholder:text-mm-muted focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                      className="text-mm-muted hover:text-mm-cream transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown — absolute, NOT inside scroll container */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      ref={suggestionsRef}
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1.5 bg-white
                                 border border-mm-border rounded-2xl shadow-[0_8px_32px_rgba(42,30,27,0.18)]
                                 overflow-hidden z-[99999]"
                    >
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onMouseDown={(e) => { e.preventDefault(); handleSuggestionSelect(s); }}
                          className="w-full flex items-start gap-3 px-4 py-3
                                     hover:bg-mm-card2 transition-colors text-left
                                     border-b border-mm-border last:border-b-0"
                        >
                          <MapPin size={14} className="text-mm-red shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="font-body text-sm text-mm-cream font-600 truncate">
                              {s.shortName.split(",")[0]}
                            </p>
                            <p className="font-body text-xs text-mm-muted truncate mt-0.5">
                              {s.shortName.split(",").slice(1).join(",").trim() || s.displayName.split(",").slice(0, 3).join(",").trim()}
                            </p>
                          </div>
                          <ChevronRight size={13} className="text-mm-muted shrink-0 ml-auto mt-0.5" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Scrollable content ─────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">

              {/* Map */}
              <div className="relative mx-5 mt-2 mb-0 rounded-2xl overflow-hidden border border-mm-border"
                   style={{ height: "45vmax", minHeight: 220, maxHeight: 380 }}>
                <MapContainer
                  center={[position.lat, position.lng]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Circle
                    center={[RESTAURANT_LOCATION.latitude, RESTAURANT_LOCATION.longitude]}
                    radius={DELIVERY_RADIUS_KM * 1000}
                    pathOptions={{ color: "#E8284B", fillColor: "#E8284B", fillOpacity: 0.06, weight: 1.5 }}
                  />
                  <Marker
                    position={[RESTAURANT_LOCATION.latitude, RESTAURANT_LOCATION.longitude]}
                    icon={restIcon}
                  />
                  <Marker
                    position={[position.lat, position.lng]}
                    icon={pinIcon}
                    draggable
                    eventHandlers={{
                      dragend: (e) => {
                        const { lat, lng } = e.target.getLatLng();
                        handleMarkerDrag(lat, lng);
                      },
                    }}
                  />
                  <FlyTo lat={position.lat} lng={position.lng} />
                </MapContainer>

                {/* Floating GPS button */}
                <button
                  onClick={handleGPS}
                  disabled={gpsStatus === "locating"}
                  className="absolute bottom-3 right-3 z-[1000] w-10 h-10 rounded-xl
                             bg-white border border-mm-border shadow-card
                             flex items-center justify-center
                             hover:border-mm-red/30 hover:shadow-glow-red
                             disabled:opacity-60 transition-all duration-200"
                >
                  {gpsStatus === "locating"
                    ? <Loader2 size={16} className="text-mm-red animate-spin" />
                    : <LocateFixed size={16} className="text-mm-red" />}
                </button>
              </div>

              {/* Resolved address + zone status */}
              <div className="mx-5 mt-3 space-y-2">
                {geocoding && (
                  <div className="flex items-center gap-2 text-mm-muted">
                    <Loader2 size={13} className="animate-spin" />
                    <p className="font-body text-xs">Looking up address…</p>
                  </div>
                )}

                {!geocoding && resolvedAddr?.displayName && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 bg-white border border-mm-border
                               rounded-xl px-3.5 py-3"
                  >
                    <MapPin size={14} className="text-mm-red shrink-0 mt-0.5" />
                    <p className="font-body text-sm text-mm-cream leading-snug">
                      {resolvedAddr.displayName.split(",").slice(0, 4).join(",")}
                    </p>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {hasPositioned && inRange === true && (
                    <motion.div
                      key="in"
                      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-green-50 border border-green-200
                                 rounded-xl px-3.5 py-2.5"
                    >
                      <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                      <p className="font-body text-xs text-green-700 font-600">
                        Great! This spot is within our delivery zone 🎉
                        <span className="font-400 text-green-600 ml-1">
                          ({Math.round((distance || 0) * 10) / 10} km from us)
                        </span>
                      </p>
                    </motion.div>
                  )}
                  {hasPositioned && inRange === false && (
                    <motion.div
                      key="out"
                      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-red-50 border border-red-200
                                 rounded-xl px-3.5 py-2.5"
                    >
                      <AlertTriangle size={14} className="text-mm-red shrink-0" />
                      <p className="font-body text-xs text-mm-red font-600">
                        {Math.round((distance || 0) * 10) / 10} km away — outside our {DELIVERY_RADIUS_KM} km zone.
                        Move the pin closer to us.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {gpsStatus === "denied" && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100
                                  rounded-xl px-3.5 py-2.5">
                    <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                    <p className="font-body text-xs text-amber-700">
                      Location access denied — drag the pin manually.
                    </p>
                  </div>
                )}
              </div>

              {/* Saved addresses section */}
              {savedAddresses.length > 0 && (
                <div className="mx-5 mt-5 mb-2">
                  <p className="font-body text-xs font-700 text-mm-muted uppercase tracking-wider mb-3">
                    Saved Addresses
                  </p>
                  <div className="space-y-2">
                    {savedAddresses.map((addr, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleSavedSelect(addr)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full flex items-center gap-3 bg-white border border-mm-border
                                   rounded-2xl px-4 py-3.5 text-left hover:border-mm-red/30
                                   hover:shadow-card transition-all duration-200 group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-mm-red/10 flex items-center justify-center
                                        text-mm-red shrink-0 group-hover:bg-mm-red/20 transition-colors">
                          <LabelIcon label={addr.label} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-700 text-mm-cream">
                            {addr.label || `Address ${i + 1}`}
                          </p>
                          <p className="font-body text-xs text-mm-muted truncate mt-0.5">
                            {[addr.street, addr.city, addr.pincode].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        <ChevronRight size={15} className="text-mm-muted group-hover:text-mm-red transition-colors shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-4" /> {/* bottom breathing room */}
            </div>

            {/* ── Sticky confirm button ───────────────────────────────────── */}
            <div className="px-5 py-4 border-t border-mm-border bg-mm-card shrink-0">
              {!hasPositioned && (
                <p className="font-body text-xs text-mm-muted text-center mb-3">
                  Use GPS or search to set your delivery location
                </p>
              )}
              <motion.button
                onClick={handleConfirm}
                disabled={!hasPositioned || inRange === false}
                whileHover={!hasPositioned || inRange === false ? {} : { scale: 1.02, boxShadow: "0 0 28px rgba(232,40,75,0.35)" }}
                whileTap={!hasPositioned || inRange === false ? {} : { scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2.5
                           bg-mm-red hover:bg-red-600 text-white
                           py-4 rounded-2xl font-body font-800 text-sm tracking-wide
                           transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-mm-red"
              >
                <MapPin size={16} />
                {inRange === false
                  ? "Location Outside Delivery Zone"
                  : "Confirm This Location"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
