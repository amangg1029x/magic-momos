import { useEffect } from "react";
import { Loader2, MapPin } from "lucide-react";
import { useDeliveryZone } from "../hooks/useDeliveryzone";
import { useNav } from "../context/NavigationContext";

/**
 * DeliveryZoneGate — wrap this around your checkout content (or render it
 * at the top of CheckoutPage, before the form) to hard-block ordering from
 * outside the delivery radius. It always re-checks location fresh at
 * checkout time, even if the home-page banner already checked once —
 * people move, and permissions can change between visits.
 *
 * Usage in CheckoutPage.jsx:
 *
 *   import DeliveryZoneGate from "../components/DeliveryZoneGate";
 *   ...
 *   return (
 *     <DeliveryZoneGate>
 *       <div className="min-h-screen bg-mm-black">
 *         ...your existing checkout JSX...
 *       </div>
 *     </DeliveryZoneGate>
 *   );
 *
 * While checking, it shows a brief loading state. If the customer is out
 * of range, it redirects to the "out-of-range" page (passing the measured
 * distance along) instead of rendering children at all. If geolocation is
 * denied/unsupported/errors, it lets the order through rather than
 * blocking a paying customer over a browser permission issue — adjust the
 * `allowOnUnknown` flag below if you'd rather be strict about that.
 */
const allowOnUnknown = true;

export default function DeliveryZoneGate({ children }) {
  const { status, distanceKm, checkLocation } = useDeliveryZone();
  const { navigate } = useNav();

  useEffect(() => {
    checkLocation();
  }, [checkLocation]);

  useEffect(() => {
    if (status === "out-of-range") {
      navigate("out-of-range", { distanceKm });
    }
  }, [status, distanceKm, navigate]);

  if (status === "idle" || status === "checking") {
    return (
      <div className="min-h-screen bg-mm-black flex flex-col items-center justify-center gap-3 px-4">
        <Loader2 size={26} className="animate-spin text-mm-red" />
        <p className="font-body text-sm text-mm-muted flex items-center gap-1.5">
          <MapPin size={14} /> Checking if we deliver to your area…
        </p>
      </div>
    );
  }

  if (status === "out-of-range") {
    // Brief flash before the redirect effect above fires.
    return null;
  }

  if (
    status === "in-range" ||
    (allowOnUnknown && (status === "denied" || status === "unsupported" || status === "error"))
  ) {
    return children;
  }

  return null;
}