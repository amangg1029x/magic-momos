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
  const { navigate, settings, storeStatus } = useNav();
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

  // Determine banner content and styles based on priority
  let bannerConfig = null;

  if (storeStatus && !storeStatus.open) {
    const openTime = settings?.openTime || "11:00";
    const closeTime = settings?.closeTime || "23:00";
    bannerConfig = {
      bg: "bg-red-50 border-b border-red-200",
      text: `We are currently closed. Delivery operations active from ${openTime} to ${closeTime}.`,
      icon: <AlertTriangle size={15} className="text-red-600 shrink-0" />,
      textColor: "text-red-800",
      allowDismiss: false, // critical status, don't allow dismiss
    };
  } else if (storeStatus && storeStatus.status === "busy") {
    bannerConfig = {
      bg: "bg-amber-50 border-b border-amber-200",
      text: "⚠️ High demand: We are experiencing high order volumes. Deliveries may take 45-60 mins.",
      icon: <AlertTriangle size={15} className="text-amber-600 shrink-0" />,
      textColor: "text-amber-800",
      allowDismiss: true,
    };
  } else if (settings && settings.announcementText) {
    bannerConfig = {
      bg: "bg-amber-50 border-b border-amber-100",
      text: settings.announcementText,
      icon: <span className="text-sm">📢</span>,
      textColor: "text-amber-900 font-600",
      allowDismiss: true,
    };
  } else if (status === "out-of-range" || status === "in-range") {
    const outOfRange = status === "out-of-range";
    bannerConfig = {
      bg: outOfRange ? "bg-amber-50 border-b border-amber-200" : "bg-green-50 border-b border-green-200",
      text: outOfRange ? (
        <span>
          Looks like you're {distanceKm != null ? `~${distanceKm} km` : "outside"} from us — you may be outside our delivery area. You can still browse, but checkout may not be available.{" "}
          <button onClick={() => navigate("contact")} className="font-700 underline underline-offset-2 hover:text-amber-900">
            Contact us
          </button> to check.
        </span>
      ) : (
        `Good news — you're within our ${distanceKm != null ? `${distanceKm} km` : ""} delivery zone! 🥟`
      ),
      icon: outOfRange ? <AlertTriangle size={15} className="text-amber-600 shrink-0" /> : <CheckCircle2 size={15} className="text-green-600 shrink-0" />,
      textColor: outOfRange ? "text-amber-800" : "text-green-800",
      allowDismiss: true,
    };
  }

  // Hide banner if dismissed and it is dismissible
  const shouldShow = bannerConfig && (!dismissed || !bannerConfig.allowDismiss);
  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35 }}
        className={`relative z-30 mt-20 px-5 py-3 flex items-center justify-center gap-2.5 text-center ${bannerConfig.bg}`}
      >
        {bannerConfig.icon}
        <p className={`font-body text-xs sm:text-sm ${bannerConfig.textColor}`}>
          {bannerConfig.text}
        </p>
        {bannerConfig.allowDismiss && (
          <button
            onClick={dismiss}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}