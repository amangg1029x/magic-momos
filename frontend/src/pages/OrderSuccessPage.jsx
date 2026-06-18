import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, ShoppingBag, Home, Phone, RotateCcw, Clock,
  AlertTriangle, RefreshCw, ShieldCheck,
} from "lucide-react";
import { useNav } from "../context/NavigationContext";
import { useRazorpay } from "../hooks/useRazorpay";
import api from "../services/api";

const CONFETTI = ["🎉","✨","🎊","⭐","💫","💖","🔥","⚡","🎈","💥"];

function Confetti({ active }) {
  const [pieces] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id:       i,
      emoji:    CONFETTI[i % CONFETTI.length],
      left:     Math.random() * 100,
      delay:    Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      size:     1 + Math.random() * 1.4,
    }))
  );

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -80, opacity: 1, rotate: 0, x: `${p.left}vw` }}
              animate={{ y: "110vh", opacity: 0, rotate: 720 }}
              transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
              className="absolute top-0 text-2xl select-none"
              style={{ fontSize: `${p.size}rem` }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export default function OrderSuccessPage() {
  const { pageData, navigate } = useNav();
  const { open: openRazorpay } = useRazorpay();

  // Whether this landing is a genuine success, or an online order that's
  // still waiting on payment (modal dismissed/failed but order was created).
  const isPaymentPending = pageData?.paymentMethod === "online" && pageData?.paymentStatus === "Pending";

  const [confetti, setConfetti]       = useState(!isPaymentPending);
  const [retrying, setRetrying]       = useState(false);
  const [retryError, setRetryError]   = useState("");

  useEffect(() => {
    if (isPaymentPending) return; // no confetti to clear in this state
    const t = setTimeout(() => setConfetti(false), 5000);
    return () => clearTimeout(t);
  }, [isPaymentPending]);

  // If someone lands here directly (refresh, back button) with no order
  // data, bounce them home rather than showing a broken/fake order.
  useEffect(() => {
    if (!pageData) {
      const t = setTimeout(() => navigate("home"), 0);
      return () => clearTimeout(t);
    }
  }, [pageData]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pageData) return null;

  // pageData comes straight from the API order response (see CheckoutPage):
  // { orderNumber, status, subtotal, deliveryCharge, total, items, createdAt, ... }
  const order = {
    _id:           pageData._id,
    orderNumber:   pageData.orderNumber,
    items:         pageData.items ?? [],
    total:         pageData.subtotal ?? 0,
    delivery:      pageData.deliveryCharge ?? pageData.delivery ?? 0,
    grandTotal:    pageData.total ?? pageData.grandTotal ?? 0,
    estimatedTime: pageData.estimatedTime ?? "20–30 mins",
    status:        pageData.status ?? "Pending",
  };

  const STEPS = [
    { emoji: "✅", label: "Order Confirmed" },
    { emoji: "👨‍🍳", label: "Being Prepared" },
    { emoji: "🛵", label: "Out for Delivery" },
    { emoji: "🏠", label: "Delivered!" },
  ];

  // Map the 5 backend statuses onto the 4 visual steps shown here
  const visualStep = order.status === "Pending"            ? 0
                    : order.status === "Confirmed"          ? 0
                    : order.status === "Preparing"          ? 1
                    : order.status === "Out for Delivery"   ? 2
                    : order.status === "Delivered"          ? 3
                    : 0;

  // ── Retry an abandoned/failed online payment ────────────────────────────
  const handleRetryPayment = async () => {
    setRetrying(true);
    setRetryError("");
    try {
      const { razorpay } = await api.orders.retryPayment(order._id);

      const result = await openRazorpay({
        key:      razorpay.keyId,
        amount:   razorpay.amount,
        currency: razorpay.currency,
        order_id: razorpay.orderId,
        name:     "Magic Momos",
        description: `Order ${order.orderNumber}`,
        theme: { color: "#E8284B" },
      });

      const { order: verifiedOrder } = await api.orders.verifyPayment(result);

      navigate("success", {
        ...verifiedOrder,
        delivery:   verifiedOrder.deliveryCharge,
        grandTotal: verifiedOrder.total,
      });
    } catch (err) {
      setRetryError(
        err.cancelled
          ? "Payment was cancelled. You can try again whenever you're ready."
          : (err.message || "Payment failed. Please try again.")
      );
    } finally {
      setRetrying(false);
    }
  };

  return (
    <>
      <Confetti active={confetti} />

      <div className="min-h-screen bg-mm-black flex items-center justify-center
                      px-4 py-8 sm:py-12 relative overflow-hidden">
        {/* ambient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px]
                          ${isPaymentPending ? "bg-amber-200/25" : "bg-green-200/30"}`} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px]
                          bg-mm-gold/20 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-xl"
        >
          {/* card */}
          <div className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(42,30,27,0.18)]
                          overflow-hidden">

            {/* ── header: green for success, amber for payment pending ── */}
            {isPaymentPending ? (
              <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 p-10 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 250, damping: 18 }}
                  className="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center
                             shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
                >
                  <AlertTriangle size={38} className="text-amber-500" />
                </motion.div>

                <h1 className="font-display text-2xl sm:text-3xl sm:text-4xl text-white tracking-tight">
                  PAYMENT PENDING
                </h1>
                <p className="font-body text-amber-50 mt-2 text-sm">
                  {pageData.paymentNote || "Your order is saved — just need to complete payment."}
                </p>
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-10 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 250, damping: 18 }}
                  className="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center
                             shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
                >
                  <CheckCircle size={42} className="text-green-600" />
                </motion.div>

                <h1 className="font-display text-3xl sm:text-5xl text-white tracking-tight">
                  ORDER PLACED!
                </h1>
                <p className="font-body text-green-100 mt-2 text-sm">
                  Your magic is on the way 🎉
                </p>
              </div>
            )}

            {/* body */}
            <div className="p-5 sm:p-7 space-y-5 sm:space-y-6">
              {/* order number */}
              <div className="text-center py-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="font-body text-xs text-mm-muted uppercase tracking-widest mb-1">
                  Order Number
                </p>
                <p className="font-display text-3xl text-mm-cream">{order.orderNumber}</p>
              </div>

              {/* ── Payment pending: retry CTA up top, no progress timeline ── */}
              {isPaymentPending ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {retryError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 overflow-hidden"
                      >
                        <AlertTriangle size={14} className="text-red-500 shrink-0" />
                        <p className="font-body text-xs text-red-700">{retryError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    onClick={handleRetryPayment}
                    disabled={retrying}
                    whileHover={{ scale: retrying ? 1 : 1.02, boxShadow: retrying ? "none" : "0 0 28px rgba(232,40,75,0.45)" }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2.5
                               bg-mm-red hover:bg-red-600 text-white
                               py-4 rounded-xl font-body font-800 text-sm tracking-wide
                               transition-all duration-200 disabled:opacity-60"
                  >
                    {retrying ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                        />
                        Opening payment…
                      </>
                    ) : (
                      <><RefreshCw size={15} /> Retry Payment · ₹{order.grandTotal}</>
                    )}
                  </motion.button>

                  <div className="flex items-center gap-2 justify-center">
                    <ShieldCheck size={12} className="text-mm-muted" />
                    <p className="font-body text-[11px] text-mm-muted">
                      Your order details are saved — no need to re-enter anything.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Normal success: delivery progress timeline ── */
                <div>
                  <p className="font-body text-xs text-mm-muted uppercase tracking-widest mb-4">
                    Order Progress
                  </p>
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-green-200 z-0" />
                    <div className="absolute top-5 left-5 h-0.5 bg-green-500 z-0"
                      style={{ width: `${(visualStep / (STEPS.length - 1)) * 100}%` }} />
                    {STEPS.map((step, i) => (
                      <div key={step.label} className="flex flex-col items-center gap-1.5 sm:gap-2 relative z-10">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg
                                         border-2 transition-all
                                         ${i <= visualStep
                                           ? "bg-green-500 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                                           : "bg-white border-gray-200"}`}>
                          {step.emoji}
                        </div>
                        <span className={`font-body text-[9px] sm:text-[10px] text-center leading-tight max-w-[52px] sm:max-w-[64px]
                                          ${i <= visualStep ? "text-green-600 font-700" : "text-mm-muted"}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* items list */}
              {order.items?.length > 0 && (
                <div>
                  <p className="font-body text-xs text-mm-muted uppercase tracking-widest mb-3">
                    Your Order
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={item.itemId ?? item.id ?? i} className="flex items-center justify-between
                                                     py-2.5 border-b border-mm-border last:border-0">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-mm-red/10 flex items-center justify-center text-xs text-mm-red font-bold shrink-0">
                              {item.name ? item.name.substring(0, 2).toUpperCase() : "MM"}
                            </div>
                          )}
                          <span className="font-body text-sm text-mm-cream font-600">
                            {item.name}
                          </span>
                          <span className="font-body text-xs text-mm-muted">× {item.qty}</span>
                        </div>
                        <span className="font-display text-base text-mm-cream">
                          ₹{item.price * item.qty}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* bill */}
                  <div className="mt-3 pt-3 border-t border-mm-border space-y-1.5">
                    <div className="flex justify-between font-body text-sm text-mm-muted">
                      <span>Subtotal</span>
                      <span>₹{order.total}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm text-mm-muted">
                      <span>Delivery</span>
                      <span className={order.delivery === 0 ? "text-green-600 font-700" : ""}>
                        {order.delivery === 0 ? "FREE 🎉" : `₹${order.delivery}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-body font-800 text-base text-mm-cream
                                    pt-2 border-t border-mm-border">
                      <span>{isPaymentPending ? "Amount Due" : "Total Paid"}</span>
                      <span className="text-mm-red font-display text-xl">₹{order.grandTotal}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* estimated time — only relevant once payment is actually confirmed */}
              {!isPaymentPending && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <Clock size={18} className="text-blue-600 shrink-0" />
                  <div>
                    <p className="font-body font-700 text-blue-900 text-sm">Estimated Delivery</p>
                    <p className="font-body text-blue-700 text-xs">{order.estimatedTime} from now</p>
                  </div>
                </div>
              )}

              {/* action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <motion.button
                  onClick={() => navigate("menu")}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center justify-center gap-2 bg-mm-red hover:bg-red-600
                             text-white py-3.5 rounded-xl font-body font-700 text-sm transition-colors"
                >
                  <RotateCcw size={14} /> Order Again
                </motion.button>
                <motion.button
                  onClick={() => navigate("home")}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center justify-center gap-2 border border-mm-border
                             text-mm-cream hover:border-mm-red/40 hover:text-mm-red
                             py-3.5 rounded-xl font-body font-700 text-sm transition-all"
                >
                  <Home size={14} /> Go Home
                </motion.button>
              </div>

              {/* support line */}
              <p className="text-center font-body text-xs text-mm-muted">
                Issue with your order?{" "}
                <a href="tel:+919876543210"
                   className="text-mm-red font-700 inline-flex items-center gap-1 hover:underline">
                  <Phone size={11} /> Call us
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
