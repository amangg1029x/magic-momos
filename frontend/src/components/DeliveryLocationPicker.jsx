import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LocateFixed, MapPin, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import DeliveryLocationMap from "./DeliveryLocationMap";
import { reverseGeocode } from "../services/geocode";
import { RESTAURANT_LOCATION, DELIVERY_RADIUS_KM } from "../data/restaurantConfig";

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * DeliveryLocationPicker
 *
 * Drop this into the checkout flow's address step. It:
 *  1. Lets the customer fetch their GPS location (or starts centered on
 *     the restaurant if they decline/haven't yet).
 *  2. Shows a draggable map pin they can fine-tune.
 *  3. Reverse-geocodes the pin position into city/pincode/street and
 *     reports it upward via onAddressChange so the form can auto-fill.
 *  4. Reports whether the pin is inside the delivery radius via
 *     onZoneChange(inRange: boolean, distanceKm: number) — the parent
 *     checkout form should disable/hide the "Place Order" button when
 *     inRange is false.
 *
 * Props:
 *   onAddressChange — ({ city, pincode, street, lat, lng }) => void
 *   onZoneChange    — (inRange: boolean, distanceKm: number) => void
 */
export default function DeliveryLocationPicker({ onAddressChange, onZoneChange }) {
  const [position, setPosition] = useState({
    lat: RESTAURANT_LOCATION.latitude,
    lng: RESTAURANT_LOCATION.longitude,
  });
  const [hasPositioned, setHasPositioned] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle | locating | done | denied | unsupported | error
  const [geocoding, setGeocoding] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState(null);

  const distance = hasPositioned
    ? distanceKm(position.lat, position.lng, RESTAURANT_LOCATION.latitude, RESTAURANT_LOCATION.longitude)
    : null;
  const inRange = distance != null ? distance <= DELIVERY_RADIUS_KM : null;

  const runGeocode = useCallback(async (lat, lng) => {
    setGeocoding(true);
    const result = await reverseGeocode(lat, lng);
    setGeocoding(false);
    if (result) {
      setResolvedAddress(result);
      onAddressChange?.({ ...result, lat, lng });
    } else {
      onAddressChange?.({ city: "", pincode: "", street: "", lat, lng });
    }
  }, [onAddressChange]);

  const handleUseMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setGpsStatus("unsupported");
      return;
    }
    setGpsStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setHasPositioned(true);
        setGpsStatus("done");
        runGeocode(latitude, longitude);
      },
      (err) => {
        setGpsStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const handleMarkerMove = (lat, lng) => {
    setPosition({ lat, lng });
    setHasPositioned(true);
    runGeocode(lat, lng);
  };

  // try once automatically on mount, so most people never have to tap the button
  useEffect(() => {
    handleUseMyLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (distance != null) onZoneChange?.(inRange, Math.round(distance * 10) / 10);
  }, [distance, inRange, onZoneChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-body text-xs font-600 text-mm-muted flex items-center gap-1.5">
          <MapPin size={13} /> Delivery Location
        </p>
        <motion.button
          type="button"
          onClick={handleUseMyLocation}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          disabled={gpsStatus === "locating"}
          className="flex items-center gap-1.5 text-xs font-body font-700 text-mm-red
                     hover:text-red-600 disabled:opacity-50 transition-colors"
        >
          {gpsStatus === "locating" ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <LocateFixed size={13} />
          )}
          Use My Location
        </motion.button>
      </div>

      <DeliveryLocationMap
        lat={position.lat}
        lng={position.lng}
        onMarkerMove={handleMarkerMove}
      />

      <p className="font-body text-[11px] text-mm-muted text-center">
        Drag the pin to your exact delivery spot if it's not quite right.
      </p>

      {/* status row */}
      <AnimatePresence>
        {gpsStatus === "denied" && (
          <motion.div
            key="denied"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5 overflow-hidden"
          >
            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
            <p className="font-body text-xs text-amber-700">
              Location access denied — drag the pin on the map to set your address manually.
            </p>
          </motion.div>
        )}

        {geocoding && (
          <motion.div
            key="geocoding"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-mm-muted overflow-hidden"
          >
            <Loader2 size={13} className="animate-spin" />
            <p className="font-body text-xs">Looking up address…</p>
          </motion.div>
        )}

        {!geocoding && resolvedAddress?.displayName && (
          <motion.div
            key="resolved"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="font-body text-xs text-mm-muted overflow-hidden"
          >
            📍 {resolvedAddress.displayName}
          </motion.div>
        )}

        {hasPositioned && inRange === true && (
          <motion.div
            key="in-range"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3.5 py-2.5 overflow-hidden"
          >
            <CheckCircle2 size={14} className="text-green-600 shrink-0" />
            <p className="font-body text-xs text-green-700 font-600">
              You're within our delivery zone ({Math.round(distance * 10) / 10} km away) 🎉
            </p>
          </motion.div>
        )}

        {hasPositioned && inRange === false && (
          <motion.div
            key="out-range"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 overflow-hidden"
          >
            <AlertTriangle size={14} className="text-mm-red shrink-0" />
            <p className="font-body text-xs text-mm-red font-600">
              This spot is {Math.round(distance * 10) / 10} km away — outside our {DELIVERY_RADIUS_KM} km
              delivery zone. We can't deliver here yet.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}