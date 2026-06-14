import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, Plus, Minus, ChevronRight } from "lucide-react";

const DELIVERY_FEE  = 30;
const FREE_DELIVERY = 199;

/**
 * CartSidebar
 * Props:
 *   open     – boolean
 *   onClose  – () => void
 *   items    – cart items [{ id, name, emoji, price, qty }]
 *   total    – number (items subtotal)
 *   onUpdate – (id, delta) => void
 *   onRemove – (id) => void
 *   onClear  – () => void
 */
export default function CartSidebar({ open, onClose, items, total, onUpdate, onRemove, onClear }) {
  const delivery      = total >= FREE_DELIVERY ? 0 : DELIVERY_FEE;
  const grandTotal    = total + delivery;
  const toFreeDelivery = Math.max(FREE_DELIVERY - total, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── backdrop ── */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-mm-cream/20 backdrop-blur-sm"
          />

          {/* ── drawer ── */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: "0%"  }}
            exit={{   x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50
                       w-full sm:w-[400px] bg-mm-card
                       border-l border-mm-border
                       shadow-[-12px_0_40px_rgba(42,30,27,0.12)]
                       flex flex-col overflow-hidden"
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
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={onClear}
                    className="text-mm-muted hover:text-mm-red transition-colors p-1.5"
                    title="Clear cart"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
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
            {total > 0 && toFreeDelivery > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="px-6 py-3 bg-amber-50 border-b border-mm-border shrink-0"
              >
                <p className="font-body text-xs text-amber-700 mb-1.5 font-600">
                  Add ₹{toFreeDelivery} more for free delivery 🛵
                </p>
                <div className="w-full h-1.5 rounded-full bg-amber-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((total / FREE_DELIVERY) * 100, 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-amber-500"
                  />
                </div>
              </motion.div>
            )}

            {delivery === 0 && total > 0 && (
              <div className="px-6 py-2.5 bg-green-50 border-b border-mm-border shrink-0">
                <p className="font-body text-xs text-green-700 font-700">
                  🎉 You've unlocked free delivery!
                </p>
              </div>
            )}

            {/* ── item list ── */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  /* empty state */
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center"
                  >
                    <motion.span
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-6xl"
                    >
                      🛒
                    </motion.span>
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
                      animate={{ opacity: 1, x: 0  }}
                      exit={{   opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.28 }}
                      className="flex items-center gap-3 p-3 rounded-2xl
                                 bg-white border border-mm-border
                                 shadow-[0_2px_12px_rgba(42,30,27,0.06)]"
                    >
                      {/* emoji */}
                      <div className="w-11 h-11 rounded-xl bg-mm-card2 flex items-center
                                      justify-center text-2xl shrink-0">
                        {item.emoji}
                      </div>

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
                          animate={{ scale: 1,   opacity: 1 }}
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

            {/* ── bill summary + CTA ── */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{   opacity: 0, y: 20 }}
                  className="border-t border-mm-border bg-white px-6 py-5 space-y-4 shrink-0"
                >
                  {/* line items */}
                  <div className="space-y-2 text-sm font-body">
                    <div className="flex justify-between">
                      <span className="text-mm-muted">Subtotal</span>
                      <span className="text-mm-cream font-700">₹{total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mm-muted">Delivery</span>
                      {delivery === 0
                        ? <span className="text-green-600 font-700">FREE 🎉</span>
                        : <span className="text-mm-cream font-700">₹{delivery}</span>
                      }
                    </div>
                    <div className="flex justify-between pt-2 border-t border-mm-border">
                      <span className="font-800 text-mm-cream text-base">Total</span>
                      <span className="font-display text-xl text-mm-red">₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* order button */}
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 28px rgba(232,40,75,0.45)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-mm-red hover:bg-red-600 text-white
                               py-4 rounded-2xl font-body font-800 text-base
                               tracking-wide transition-colors flex items-center justify-center gap-2"
                  >
                    Place Order · ₹{grandTotal}
                    <span className="text-lg">🚀</span>
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