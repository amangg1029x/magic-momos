import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNav } from "../context/NavigationContext";
import { useDeliveryZone } from "../hooks/useDeliveryZone";

const DISMISS_KEY = "mm_zone_banner_dismissed";

/**
 * DeliveryZoneBanner — a quiet, dismissible heads-up shown once per session.
 * This is the "soft" upfront check: it never blocks browsing, it just lets
 * far-away visitors know early rather than at the end of checkout.
 */
export default function DeliveryZoneBanner() {
  const { status, distanceKm, checkLocation } = useDeliveryZone();
  const { navigate } = useNav();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === "1"
  );

  useEffect(() => {
    if (!dismissed) checkLocation();
  }, [dismissed, checkLocation]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  // Only show something for the two states the user actually needs to know about.
  const visible = !dismissed && (status === "out-of-range" || status === "in-range");
  if (!visible) return null;

  const outOfRange = status === "out-of-range";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35 }}
        className={`relative z-30 mt-20 px-5 py-3 flex items-center justify-center gap-2.5 text-center
                    ${outOfRange ? "bg-amber-50 border-b border-amber-200" : "bg-green-50 border-b border-green-200"}`}
      >
        {outOfRange ? (
          <>
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <p className="font-body text-xs sm:text-sm text-amber-800">
              Looks like you're {distanceKm != null ? `~${distanceKm} km` : "outside"} from
              us — you may be outside our delivery area. You can still browse, but
              checkout may not be available.{" "}
              <button
                onClick={() => navigate("contact")}
                className="font-700 underline underline-offset-2 hover:text-amber-900"
              >
                Contact us
              </button>{" "}
              to check.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 size={15} className="text-green-600 shrink-0" />
            <p className="font-body text-xs sm:text-sm text-green-800">
              Good news — you're within our {distanceKm != null ? `${distanceKm} km` : ""} delivery zone! 🥟
            </p>
          </>
        )}
        <button
          onClick={dismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-current opacity-50 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}