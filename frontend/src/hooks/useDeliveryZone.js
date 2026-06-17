import { useState, useCallback } from "react";
import { RESTAURANT_LOCATION, DELIVERY_RADIUS_KM } from "../data/restaurantConfig";

/**
 * Haversine formula — great-circle distance between two lat/lng points, in km.
 */
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * useDeliveryZone — checks whether the customer's current browser location
 * falls within the restaurant's delivery radius.
 *
 * Returns:
 *   status      — "idle" | "checking" | "in-range" | "out-of-range" | "denied" | "unsupported" | "error"
 *   distanceKm  — number | null  (rounded to 1 decimal, once known)
 *   checkLocation — () => void   (triggers a fresh browser geolocation request)
 *   reset       — () => void
 */
export function useDeliveryZone() {
  const [status, setStatus] = useState("idle");
  const [distance, setDistance] = useState(null);

  const checkLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    setStatus("checking");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const d = distanceKm(
          latitude,
          longitude,
          RESTAURANT_LOCATION.latitude,
          RESTAURANT_LOCATION.longitude
        );
        setDistance(Math.round(d * 10) / 10);
        setStatus(d <= DELIVERY_RADIUS_KM ? "in-range" : "out-of-range");
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, // accept a cached fix up to 5 min old
      }
    );
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setDistance(null);
  }, []);

  return { status, distanceKm: distance, checkLocation, reset, radiusKm: DELIVERY_RADIUS_KM };
}