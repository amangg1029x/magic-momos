import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ShoppingBag, Home, Phone, RotateCcw, Clock } from "lucide-react";
import { useNav } from "../context/NavigationContext";

const CONFETTI = ["🎉","✨","🎊","⭐","💫","🥟","🌯","🫕","🍟","🌶️"];

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
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const order = pageData ?? {
    orderNumber:  "MM-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
    items:        [],
    total:        0,
    delivery:     0,
    grandTotal:   0,
    estimatedTime: "20–30 mins",
  };

  const STEPS = [
    { emoji: "✅", label: "Order Confirmed" },
    { emoji: "👨‍🍳", label: "Being Prepared" },
    { emoji: "🛵", label: "Out for Delivery" },
    { emoji: "🏠", label: "Delivered!" },
  ];

  return (
    <>
      <Confetti active={confetti} />

      <div className="min-h-screen bg-mm-black flex items-center justify-center
                      px-4 py-12 relative overflow-hidden">
        {/* ambient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px]
                          bg-green-200/30 rounded-full blur-[140px]" />
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
            {/* green header */}
            <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-10 text-center overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 250, damping: 18 }}
                className="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center
                           shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
              >
                <CheckCircle size={42} className="text-green-600" />
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl text-white tracking-tight">
                ORDER PLACED!
              </h1>
              <p className="font-body text-green-100 mt-2 text-sm">
                Your magic is on the way 🎉
              </p>
            </div>

            {/* body */}
            <div className="p-7 space-y-6">
              {/* order number */}
              <div className="text-center py-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="font-body text-xs text-mm-muted uppercase tracking-widest mb-1">
                  Order Number
                </p>
                <p className="font-display text-3xl text-mm-cream">{order.orderNumber}</p>
              </div>

              {/* delivery timeline */}
              <div>
                <p className="font-body text-xs text-mm-muted uppercase tracking-widest mb-4">
                  Order Progress
                </p>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-green-200 z-0" />
                  <div className="absolute top-5 left-5 h-0.5 bg-green-500 z-0"
                    style={{ width: "33.3%" }} />
                  {STEPS.map((step, i) => (
                    <div key={step.label} className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                                       border-2 transition-all
                                       ${i <= 1
                                         ? "bg-green-500 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                                         : "bg-white border-gray-200"}`}>
                        {step.emoji}
                      </div>
                      <span className={`font-body text-[10px] text-center leading-tight max-w-[56px]
                                        ${i <= 1 ? "text-green-600 font-700" : "text-mm-muted"}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* items list */}
              {order.items?.length > 0 && (
                <div>
                  <p className="font-body text-xs text-mm-muted uppercase tracking-widest mb-3">
                    Your Order
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between
                                                     py-2.5 border-b border-mm-border last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.emoji}</span>
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
                      <span>Total Paid</span>
                      <span className="text-mm-red font-display text-xl">₹{order.grandTotal}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* estimated time */}
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <Clock size={18} className="text-blue-600 shrink-0" />
                <div>
                  <p className="font-body font-700 text-blue-900 text-sm">Estimated Delivery</p>
                  <p className="font-body text-blue-700 text-xs">{order.estimatedTime} from now</p>
                </div>
              </div>

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