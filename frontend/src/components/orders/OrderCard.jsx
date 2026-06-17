import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight, X, AlertTriangle } from "lucide-react";
import api from "../../services/api";
import { ACTIVE_STATUSES } from "./OrderStatusBadge";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderTracker from "./OrderTracker";
import OrderItemsBreakdown from "./OrderItemsBreakdown";

/**
 * OrderCard
 *
 * A single order row that expands inline to show:
 *  - Live tracking stepper (OrderTracker) for active orders
 *  - Items + bill breakdown (OrderItemsBreakdown)
 *  - Cancel button for Pending orders
 *
 * Props:
 *   order     {object}  – order document from the API
 *   onUpdate  {fn}      – callback(updatedOrder) so parent list can refresh
 */
export default function OrderCard({ order: initialOrder, onUpdate }) {
  const [order,    setOrder]    = useState(initialOrder);
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isActive    = ACTIVE_STATUSES.has(order.status);
  const canCancel   = order.status === "Pending";

  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  // Called by OrderTracker when a poll detects a status change
  const handleTrackerUpdate = (updated) => {
    const merged = { ...order, ...updated };
    setOrder(merged);
    onUpdate?.(merged);
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError("");
    try {
      await api.orders.cancel(order._id, "Customer requested cancellation");
      const updated = { ...order, status: "Cancelled" };
      setOrder(updated);
      onUpdate?.(updated);
      setShowCancelConfirm(false);
    } catch (err) {
      setCancelError(err.message || "Failed to cancel order. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <motion.div
      layout
      className="bg-white border border-mm-border rounded-2xl overflow-hidden
                 shadow-[0_2px_12px_rgba(42,30,27,0.06)]
                 hover:border-mm-red/25 transition-all duration-200"
    >
      {/* ── Header row (always visible) ───────────────────────────────────── */}
      <button
        id={`order-card-${order._id}`}
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left"
      >
        {/* left: icon + meta */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            border transition-colors duration-200
            ${isActive
              ? "bg-mm-red/10 border-mm-red/25"
              : "bg-mm-card2 border-mm-border"
            }`}
          >
            <ShoppingBag size={15} className={isActive ? "text-mm-red" : "text-mm-muted"} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-display text-sm text-mm-cream leading-none">
                {order.orderNumber}
              </p>
              {isActive && (
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="inline-flex items-center gap-1 font-body text-[10px] text-green-600 font-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Live
                </motion.span>
              )}
            </div>
            <p className="font-body text-xs text-mm-muted mt-0.5">
              {date} · {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* right: badge + total + chevron */}
        <div className="flex items-center gap-2.5 shrink-0">
          <OrderStatusBadge status={order.status} />
          <span className="font-display text-sm text-mm-cream hidden sm:block">
            ₹{order.total ?? order.totalAmount}
          </span>
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={15} className="text-mm-muted" />
          </motion.div>
        </div>
      </button>

      {/* ── Expanded content ──────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-mm-border px-5 py-5 space-y-5">

              {/* Live tracker — only for non-cancelled orders */}
              {order.status !== "Cancelled" && (
                <OrderTracker
                  orderId={order._id}
                  status={order.status}
                  onUpdate={handleTrackerUpdate}
                />
              )}

              {/* Items + bill */}
              <div className="bg-mm-card2/40 rounded-2xl border border-mm-border p-4">
                <p className="font-body text-xs text-mm-muted uppercase tracking-wider mb-3">
                  Order Summary
                </p>
                <OrderItemsBreakdown
                  items={order.items ?? []}
                  subtotal={order.subtotal}
                  deliveryCharge={order.deliveryCharge}
                  total={order.total ?? order.totalAmount}
                  address={order.address}
                  paymentMethod={order.paymentMethod}
                />
              </div>

              {/* Cancel button — only for Pending orders */}
              {canCancel && !showCancelConfirm && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="font-body text-xs text-red-500 hover:text-red-600 font-700
                               flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                               hover:bg-red-50 transition-all duration-150"
                  >
                    <X size={12} />
                    Cancel Order
                  </button>
                </div>
              )}

              {/* Cancel confirmation */}
              <AnimatePresence>
                {showCancelConfirm && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-body text-sm font-700 text-red-700">
                          Cancel this order?
                        </p>
                        <p className="font-body text-xs text-red-500 mt-0.5">
                          This action cannot be undone. The order will be marked as Cancelled.
                        </p>
                      </div>
                    </div>

                    {cancelError && (
                      <p className="font-body text-xs text-red-600 bg-red-100 rounded-lg px-3 py-2">
                        {cancelError}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowCancelConfirm(false); setCancelError(""); }}
                        disabled={cancelling}
                        className="flex-1 py-2 rounded-xl border border-mm-border font-body text-sm
                                   text-mm-muted hover:text-mm-cream hover:border-mm-red/30
                                   transition-all duration-150 disabled:opacity-50"
                      >
                        Keep Order
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex-1 py-2 rounded-xl bg-red-500 text-white font-body text-sm
                                   font-700 hover:bg-red-600 transition-colors disabled:opacity-60
                                   flex items-center justify-center gap-2"
                      >
                        {cancelling ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                              className="w-3 h-3 rounded-full border-2 border-white border-t-transparent"
                            />
                            Cancelling…
                          </>
                        ) : "Yes, Cancel"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
