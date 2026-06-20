import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Trash2, ShoppingBag, Plus, Minus, ChevronRight, Tag, Check, AlertCircle,
} from "lucide-react";
import { useNav } from "../context/NavigationContext";

export default function CartSidebar({
  open, onClose,
  items, subtotal, discount, deliveryFee, total,
  coupon, couponError,
  onUpdate, onRemove, onClear,
  onApplyCoupon, onRemoveCoupon,
  freeDeliveryThreshold = 199,
  deliveryFeeSetting = 30,
}) {
  const { navigate, isNative } = useNav();

  const [couponInput, setCouponInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);

  const toFreeDelivery = Math.max(freeDeliveryThreshold - (subtotal - discount), 0);
  const freeDelivery   = deliveryFee === 0 && items.length > 0;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponApplying(true);
    const ok = onApplyCoupon(couponInput);
    if (ok) setCouponInput("");
    setTimeout(() => setCouponApplying(false), 300);
  };

  const handleCheckout = () => {
    onClose();
    navigate("checkout");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-mm-cream/20 backdrop-blur-sm"
          />

          {/* drawer */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: "100%" }} animate={{ x: "0%" }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className={`fixed right-0 top-0 bottom-0 z-50
                       w-full sm:w-[420px] bg-mm-card
                       border-l border-mm-border
                       shadow-[-12px_0_40px_rgba(42,30,27,0.12)]
                       flex flex-col overflow-hidden ${isNative ? "pb-24" : ""}`}
          >
            {/* ── header ── */}
            <div className="flex items-center justify-between px-6 py-5
                            border-b border-mm-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-mm-red flex items-center justify-center
                                shadow-[0_4px_14px_rgba(232,40,75,0.30)]">
                  <ShoppingBag size={17} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-mm-cream tracking-wide leading-none">
                    YOUR ORDER
                  </h2>
                  <p className="font-body text-xs text-mm-muted mt-0.5">
                    {items.length === 0
                      ? "Cart is empty"
                      : `${items.reduce((s, i) => s + i.qty, 0)} item${items.reduce((s, i) => s + i.qty, 0) > 1 ? "s" : ""}`
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    onClick={onClear}
                    className="text-mm-muted hover:text-mm-red transition-colors p-1.5"
                    title="Clear cart"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-mm-card2 border border-mm-border
                             flex items-center justify-center text-mm-muted
                             hover:text-mm-cream transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            {/* ── free delivery progress ── */}
            <AnimatePresence>
              {items.length > 0 && toFreeDelivery > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 py-3 bg-amber-50 border-b border-mm-border shrink-0 overflow-hidden"
                >
                  <p className="font-body text-xs text-amber-700 mb-1.5 font-600">
                    Add ₹{toFreeDelivery} more for free delivery 🛵
                  </p>
                  <div className="w-full h-1.5 rounded-full bg-amber-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((subtotal - discount) / freeDeliveryThreshold) * 100, 100)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full bg-amber-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {freeDelivery && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 py-2.5 bg-green-50 border-b border-mm-border shrink-0 overflow-hidden"
                >
                  <p className="font-body text-xs text-green-700 font-700">
                    🎉 You've unlocked free delivery!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── item list ── */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center"
                  >
                    <motion.span
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-6xl"
                    >🛒</motion.span>
                    <h3 className="font-display text-2xl text-mm-cream">Empty Cart</h3>
                    <p className="font-body text-sm text-mm-muted max-w-[200px]">
                      Add some items from the menu to get started!
                    </p>
                    <motion.button
                      onClick={onClose}
                      whileHover={{ scale: 1.04 }}
                      className="mt-2 flex items-center gap-1.5 text-mm-red font-body font-700 text-sm"
                    >
                      Browse Menu <ChevronRight size={14} />
                    </motion.button>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.28 }}
                      className="flex items-center gap-3 p-3 rounded-2xl
                                 bg-white border border-mm-border
                                 shadow-[0_2px_12px_rgba(42,30,27,0.06)]"
                    >
                      {/* image */}
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-mm-red/10 flex items-center justify-center text-xs text-mm-red font-bold shrink-0">
                          {item.name ? item.name.substring(0, 2).toUpperCase() : "MM"}
                        </div>
                      )}

                      {/* name + price */}
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-700 text-sm text-mm-cream truncate">
                          {item.name}
                        </p>
                        <p className="font-body text-xs text-mm-muted">
                          ₹{item.price} × {item.qty}
                        </p>
                      </div>

                      {/* stepper */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => onUpdate(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-mm-card2 border border-mm-border
                                     flex items-center justify-center text-mm-muted
                                     hover:bg-mm-red hover:text-white hover:border-mm-red
                                     transition-all duration-150"
                        >
                          <Minus size={11} />
                        </motion.button>

                        <motion.span
                          key={item.qty}
                          initial={{ scale: 1.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-display text-base text-mm-cream w-5 text-center leading-none"
                        >
                          {item.qty}
                        </motion.span>

                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => onUpdate(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-mm-red text-white
                                     flex items-center justify-center
                                     hover:bg-red-600 transition-colors duration-150"
                        >
                          <Plus size={11} />
                        </motion.button>
                      </div>

                      {/* item total */}
                      <div className="text-right shrink-0 w-12">
                        <p className="font-display text-sm text-mm-cream leading-none">
                          ₹{item.price * item.qty}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* ── bill + coupon + CTA ── */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="border-t border-mm-border bg-white px-6 py-5 space-y-4 shrink-0"
                >
                  {/* coupon input */}
                  <div>
                    {coupon ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between bg-green-50 border border-green-200
                                   rounded-xl px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-green-600 shrink-0" />
                          <div>
                            <p className="font-body text-xs font-700 text-green-700">
                              {coupon.code} applied!
                            </p>
                            <p className="font-body text-[11px] text-green-600">{coupon.label}</p>
                          </div>
                        </div>
                        <button
                          onClick={onRemoveCoupon}
                          className="text-green-600 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mm-muted pointer-events-none" />
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                              placeholder="Coupon code"
                              className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-mm-border
                                         bg-mm-card2 font-body text-xs text-mm-cream
                                         placeholder:text-mm-muted focus:outline-none
                                         focus:border-mm-red/40 transition-colors"
                            />
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                            onClick={handleApplyCoupon}
                            disabled={couponApplying || !couponInput.trim()}
                            className="px-4 py-2.5 rounded-xl bg-mm-card2 border border-mm-border
                                       font-body text-xs font-700 text-mm-cream
                                       hover:border-mm-red/40 hover:text-mm-red
                                       transition-all disabled:opacity-50"
                          >
                            Apply
                          </motion.button>
                        </div>
                        <AnimatePresence>
                          {couponError && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center gap-1.5 overflow-hidden"
                            >
                              <AlertCircle size={11} className="text-red-500 shrink-0" />
                              <p className="font-body text-[11px] text-red-500">{couponError}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <p className="font-body text-[11px] text-mm-muted">
                          Try: <button onClick={() => setCouponInput("MAGIC10")}
                            className="text-mm-red hover:underline font-600">MAGIC10</button>
                          {" · "}
                          <button onClick={() => setCouponInput("FIRST50")}
                            className="text-mm-red hover:underline font-600">FIRST50</button>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* bill summary */}
                  <div className="space-y-2 text-sm font-body">
                    <div className="flex justify-between">
                      <span className="text-mm-muted">Subtotal</span>
                      <span className="text-mm-cream font-700">₹{subtotal}</span>
                    </div>
                    {discount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex justify-between text-green-600"
                      >
                        <span className="font-600">Discount ({coupon?.code})</span>
                        <span className="font-700">− ₹{discount}</span>
                      </motion.div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-mm-muted">Delivery</span>
                      {deliveryFee === 0
                        ? <span className="text-green-600 font-700">FREE 🎉</span>
                        : <span className="text-mm-cream font-700">₹{deliveryFee}</span>
                      }
                    </div>
                    <div className="flex justify-between pt-2 border-t border-mm-border">
                      <span className="font-800 text-mm-cream text-base">Total</span>
                      <span className="font-display text-xl text-mm-red">₹{total}</span>
                    </div>
                  </div>

                  {/* checkout button */}
                  <motion.button
                    onClick={handleCheckout}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 28px rgba(232,40,75,0.45)" }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-mm-red hover:bg-red-600 text-white
                               py-4 rounded-2xl font-body font-800 text-base
                               tracking-wide transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ChevronRight size={16} />
                  </motion.button>

                  <p className="text-center font-body text-[11px] text-mm-muted">
                    Est. delivery time: 20–30 mins 🛵
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}