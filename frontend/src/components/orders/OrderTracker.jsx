import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, ChefHat, Truck, Package, RefreshCw, MapPin } from "lucide-react";
import api from "../../services/api";
import { useNav } from "../../context/NavigationContext";
import { ACTIVE_STATUSES } from "./OrderStatusBadge";

// ── Visual steps for the progress stepper ──────────────────────────────────
const TRACK_STEPS = [
  { key: "Confirmed",        emoji: "✅", label: "Confirmed",    icon: CheckCircle, color: "text-blue-500"   },
  { key: "Preparing",        emoji: "👨‍🍳", label: "Preparing",   icon: ChefHat,     color: "text-purple-500" },
  { key: "Out for Delivery", emoji: "🛵", label: "On the way",   icon: Truck,       color: "text-indigo-500" },
  { key: "Delivered",        emoji: "🏠", label: "Delivered",    icon: Package,     color: "text-green-500"  },
];

const STATUS_TO_STEP = {
  "Pending":          0,
  "Confirmed":        0,
  "Preparing":        1,
  "Out for Delivery": 2,
  "Delivered":        3,
  "Cancelled":        -1,
};

const POLL_INTERVAL_MS = 15_000; // poll every 15 s for active orders

/**
 * OrderTracker
 *
 * Shows a visual stepper of the order journey.
 * - Auto-polls the backend every 15 s while the order is still active.
 * - Stops polling once Delivered or Cancelled.
 * - Shows a pulsing "Live" indicator on active orders.
 *
 * Props:
 *   orderId   {string}   – MongoDB _id
 *   status    {string}   – current order status (seed value)
 *   onUpdate  {fn}       – called with the new order object when status changes
 */
export default function OrderTracker({ orderId, status: seedStatus, onUpdate, order: orderProp }) {
  const { navigate } = useNav();
  const [liveStatus, setLiveStatus] = useState(seedStatus);
  const [lastPolled, setLastPolled] = useState(null);
  const [polling,    setPolling]    = useState(false);
  const intervalRef                 = useRef(null);
  const isMounted                   = useRef(true);

  const isActive = ACTIVE_STATUSES.has(liveStatus);
  const isCancelled = liveStatus === "Cancelled";
  const visualStep  = STATUS_TO_STEP[liveStatus] ?? 0;

  // ── Polling logic ─────────────────────────────────────────────────────────
  const poll = async () => {
    if (!isMounted.current) return;
    setPolling(true);
    try {
      const { order } = await api.orders.track(orderId);
      if (!isMounted.current) return;
      if (order.status !== liveStatus) {
        setLiveStatus(order.status);
        onUpdate?.(order);
      }
      setLastPolled(new Date());
    } catch {
      // silently ignore network errors
    } finally {
      if (isMounted.current) setPolling(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    setLiveStatus(seedStatus); // sync if parent changes

    if (ACTIVE_STATUSES.has(seedStatus)) {
      // initial fetch immediately
      poll();
      intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }

    return () => {
      isMounted.current = false;
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, seedStatus]);

  // ── Cancelled state ───────────────────────────────────────────────────────
  if (isCancelled) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 px-5 py-4 flex items-center gap-3">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-body font-700 text-red-700 text-sm">Order Cancelled</p>
          <p className="font-body text-xs text-red-500 mt-0.5">
            This order was cancelled. Contact us if you have questions.
          </p>
        </div>
      </div>
    );
  }

  // ── Progress bar width ────────────────────────────────────────────────────
  const progressPct = visualStep === 0
    ? 8
    : Math.round((visualStep / (TRACK_STEPS.length - 1)) * 100);

  return (
    <div className="rounded-2xl border border-mm-border bg-mm-card2/50 p-5 space-y-4">
      {/* header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-mm-muted" />
          <p className="font-body text-xs text-mm-muted uppercase tracking-wider">Order Progress</p>
        </div>

        <div className="flex items-center gap-2">
          {isActive && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-1 font-body text-[10px] text-green-600 font-700"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Live
            </motion.span>
          )}
          {polling && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw size={11} className="text-mm-muted" />
            </motion.div>
          )}
          {lastPolled && !polling && (
            <span className="font-body text-[10px] text-mm-muted">
              Updated {lastPolled.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* stepper */}
      <div className="relative">
        {/* track line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-mm-border z-0" />
        {/* progress fill */}
        <motion.div
          className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-mm-red to-orange-400 z-0 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* steps */}
        <div className="relative z-10 flex items-start justify-between">
          {TRACK_STEPS.map((step, i) => {
            const done    = i <= visualStep;
            const current = i === visualStep;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  initial={false}
                  animate={
                    current && isActive
                      ? { scale: [1, 1.12, 1], boxShadow: ["0 0 0px rgba(232,40,75,0)", "0 0 12px rgba(232,40,75,0.35)", "0 0 0px rgba(232,40,75,0)"] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 1.8, repeat: current && isActive ? Infinity : 0, ease: "easeInOut" }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300
                    ${done
                      ? "bg-mm-red border-mm-red shadow-[0_2px_10px_rgba(232,40,75,0.30)]"
                      : "bg-white border-mm-border"
                    }`}
                >
                  {done
                    ? <StepIcon size={16} className="text-white" />
                    : <span className="text-base">{step.emoji}</span>
                  }
                </motion.div>

                <span
                  className={`font-body text-[10px] text-center leading-tight max-w-[58px]
                    ${done ? "text-mm-red font-700" : "text-mm-muted"}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* current status message */}
      <motion.div
        key={liveStatus}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 bg-white border border-mm-border rounded-xl px-3.5 py-2.5"
      >
        <span className="text-xl">
          {TRACK_STEPS[Math.max(visualStep, 0)]?.emoji ?? "✅"}
        </span>
        <div>
          <p className="font-body text-xs font-700 text-mm-cream">
            {liveStatus === "Pending"   ? "Waiting for restaurant to confirm…"  :
             liveStatus === "Confirmed" ? "Your order has been confirmed! 🎉"    :
             liveStatus === "Preparing" ? "Chefs are preparing your momos! 👨‍🍳"  :
             liveStatus === "Out for Delivery" ? "On the way to you! 🛵"         :
             liveStatus === "Delivered" ? "Order delivered. Enjoy your meal! 🥟" :
             liveStatus}
          </p>
          {isActive && (
            <p className="font-body text-[10px] text-mm-muted mt-0.5">
              Tracking updates automatically every {POLL_INTERVAL_MS / 1000}s
            </p>
          )}
        </div>
      </motion.div>

      {/* Track Live button — shown for active orders */}
      {isActive && (
        <button
          id={`order-tracker-track-live-${orderId}`}
          onClick={() => navigate("track", {
            orderId,
            address: orderProp?.address,
          })}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                     font-body font-700 text-sm text-white transition-all duration-200
                     hover:opacity-90 active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
        >
          <MapPin size={14} />
          Track Live 🛵
        </button>
      )}
    </div>
  );
}
