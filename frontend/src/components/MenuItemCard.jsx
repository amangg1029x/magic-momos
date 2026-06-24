import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Flame, Minus, Plus, ShoppingCart } from "lucide-react";
import SizePickerModal from "./SizePickerModal";

/**
 * MenuItemCard
 * Props:
 *   item      – menu item object (may include halfPrice for H/F items)
 *   cartItems – ALL cart items array (to detect both half+full variants)
 *   onAdd     – (item, size) => void  — size is "half" | "full"
 *   onInc     – (cartKey) => void
 *   onDec     – (cartKey) => void
 *
 * The parent (MenuGrid) passes cartItems instead of a single cartQty
 * so this card can show separate steppers for half and full if both
 * are in the cart simultaneously.
 */
export default function MenuItemCard({ item, cartItems = [], onAdd, onInc, onDec }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const hasHalfFull = item.halfPrice != null && item.halfPrice > 0;

  // Cart keys for each size variant
  const halfKey = `${item.itemId ?? item.id}-half`;
  const fullKey = `${item.itemId ?? item.id}-full`;

  const halfEntry = cartItems.find((i) => i.cartKey === halfKey);
  const fullEntry = cartItems.find((i) => i.cartKey === fullKey);

  const halfQty = halfEntry?.qty ?? 0;
  const fullQty = fullEntry?.qty ?? 0;
  const totalQty = halfQty + fullQty;
  const inCart = totalQty > 0;

  // For non-half/full items, use the plain numeric id as the key
  const plainKey = String(item.itemId ?? item.id);
  const plainEntry = cartItems.find((i) => i.cartKey === plainKey);
  const plainQty = plainEntry?.qty ?? 0;
  const plainInCart = plainQty > 0;

  const handleAddClick = () => {
    if (hasHalfFull) {
      setPickerOpen(true);
    } else {
      onAdd(item, "full");
    }
  };

  const handleSizeSelect = (size) => {
    onAdd(item, size);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -4 }}
        className={`
          group relative flex flex-col gap-2 sm:gap-4 p-3 sm:p-5 rounded-2xl bg-white
          border transition-all duration-300 cursor-default
          ${inCart || plainInCart
            ? "border-mm-red/30 shadow-[0_6px_28px_rgba(232,40,75,0.10)]"
            : "border-mm-border shadow-card hover:shadow-[0_8px_32px_rgba(42,30,27,0.10)] hover:border-mm-red/20"
          }
        `}
      >
        {/* ── in-cart glow strip ── */}
        <AnimatePresence>
          {(inCart || plainInCart) && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              className="absolute top-0 left-0 right-0 h-[3px] bg-mm-red rounded-t-2xl origin-left"
            />
          )}
        </AnimatePresence>

        {/* ── top badges row ── */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.popular && (
              <span className="text-[10px] font-body font-800 px-2 py-0.5 rounded-full
                               bg-mm-gold/15 text-amber-700 uppercase tracking-wider">
                🔥 Popular
              </span>
            )}
            <span
              className={`flex items-center gap-1 text-[10px] font-body font-700 px-2 py-0.5 rounded-full border
                          ${item.veg
                            ? "border-green-400/60 text-green-700 bg-green-50"
                            : "border-red-400/60  text-red-700  bg-red-50"
                          }`}
            >
              <span className={`w-2 h-2 rounded-full inline-block ${item.veg ? "bg-green-500" : "bg-red-500"}`} />
              {item.veg ? "Veg" : "Non-Veg"}
            </span>

            {/* Half/Full badge */}
            {hasHalfFull && (
              <span className="text-[10px] font-body font-700 px-2 py-0.5 rounded-full border
                               border-mm-gold/40 text-amber-700 bg-mm-gold/10">
                H / F
              </span>
            )}
          </div>

          {item.spicy && (
            <span className="flex items-center gap-0.5 text-orange-500 text-xs font-body font-700">
              <Flame size={12} /> Spicy
            </span>
          )}
        </div>

        {/* ── image ── */}
        <motion.div
          animate={{ scale: (inCart || plainInCart) ? [1, 1.03, 1] : 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-32 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden select-none relative bg-gradient-to-br from-amber-50 to-orange-50
                     border border-gray-100 group-hover:scale-[1.02] transition-transform duration-300"
        >
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display text-4xl text-[#E8284B] font-bold">
              {item.name ? item.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "MM"}
            </div>
          )}
        </motion.div>

        {/* ── text ── */}
        <div className="flex-1 flex flex-col gap-1">
          <h3 className="font-display text-base sm:text-[1.45rem] text-mm-cream leading-tight tracking-wide">
            {item.name}
          </h3>
          <p className="font-body text-[13px] text-mm-muted leading-relaxed line-clamp-2">
            {item.desc}
          </p>
        </div>

        {/* ── rating ── */}
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                fill={i < Math.floor(item.rating) ? "#F5A623" : "transparent"}
                stroke={i < Math.floor(item.rating) ? "#F5A623" : "#C4B5B1"}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <span className="font-body text-[12px] text-mm-muted">
            {item.rating} <span className="opacity-60">({item.reviews})</span>
          </span>
        </div>

        {/* ── footer: price + cart control ── */}
        <div className="flex flex-col gap-2.5 pt-3 border-t border-mm-border">
          {/* price display */}
          <div>
            {hasHalfFull ? (
              <div className="flex items-center gap-2">
                <div className="flex flex-col leading-none">
                  <span className="font-body text-[10px] text-mm-muted uppercase tracking-wider">Half</span>
                  <span className="font-display text-base sm:text-lg text-mm-cream">₹{item.halfPrice}</span>
                  {item.halfPieces && (
                    <span className="font-body text-[10px] text-mm-muted mt-0.5">{item.halfPieces} pcs</span>
                  )}
                </div>
                <span className="text-mm-border font-body text-sm">·</span>
                <div className="flex flex-col leading-none">
                  <span className="font-body text-[10px] text-mm-muted uppercase tracking-wider">Full</span>
                  <span className="font-display text-base sm:text-lg text-mm-cream">₹{item.price}</span>
                  {item.pieces && (
                    <span className="font-body text-[10px] text-mm-muted mt-0.5">{item.pieces} pcs</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-xl sm:text-[1.5rem] text-mm-cream leading-none">
                  ₹{item.price}
                </span>
                {item.pieces
                  ? <span className="font-body text-[11px] text-mm-muted">· {item.pieces} pcs</span>
                  : <span className="font-body text-[11px] text-mm-muted hidden sm:inline">per plate</span>
                }
              </div>
            )}
          </div>

          {/* cart controls */}
          {hasHalfFull ? (
            /* ── Half/Full items: show steppers per size OR the Add button ── */
            <div>
              {!inCart ? (
                /* No variants in cart yet → single Add button opens picker */
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleAddClick}
                  whileHover={{ scale: 1.06, boxShadow: "0 0 16px rgba(232,40,75,0.3)" }}
                  whileTap={{ scale: 0.9 }}
                  className="w-full flex items-center justify-center gap-1.5 bg-mm-red hover:bg-red-600
                             text-white text-xs font-body font-800 px-4 py-2.5 rounded-xl
                             transition-colors duration-200"
                >
                  <ShoppingCart size={13} />
                  Add
                </motion.button>
              ) : (
                /* One or both variants in cart → show per-size steppers */
                <div className="space-y-1.5">
                  {[
                    { size: "half", label: "H", qty: halfQty, key: halfKey, price: item.halfPrice },
                    { size: "full", label: "F", qty: fullQty, key: fullKey, price: item.price },
                  ].map(({ size, label, qty, key, price }) => (
                    <div key={size} className="flex items-center justify-between gap-2">
                      <span className="font-body text-xs text-mm-muted w-5 shrink-0">{label}</span>

                      {qty === 0 ? (
                        /* This size not yet added → small add button */
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={() => onAdd(item, size)}
                          className="flex-1 flex items-center justify-center gap-1
                                     border border-mm-red/30 text-mm-red hover:bg-mm-red hover:text-white
                                     text-[11px] font-body font-700 py-1.5 rounded-lg transition-colors"
                        >
                          <ShoppingCart size={11} /> Add {label}
                        </motion.button>
                      ) : (
                        /* This size in cart → stepper */
                        <div className="flex items-center gap-1.5 flex-1 justify-end">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => onDec(key)}
                            className="w-7 h-7 rounded-lg bg-mm-red text-white flex items-center
                                       justify-center hover:bg-red-600 transition-colors"
                          >
                            <Minus size={11} />
                          </motion.button>
                          <motion.span
                            key={qty}
                            initial={{ scale: 1.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="font-display text-base text-mm-red w-5 text-center leading-none"
                          >
                            {qty}
                          </motion.span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => onInc(key)}
                            className="w-7 h-7 rounded-lg bg-mm-red text-white flex items-center
                                       justify-center hover:bg-red-600 transition-colors"
                          >
                            <Plus size={11} />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── Non-H/F items: original single stepper behaviour ── */
            <AnimatePresence mode="wait" initial={false}>
              {!plainInCart ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleAddClick}
                  whileHover={{ scale: 1.08, boxShadow: "0 0 16px rgba(232,40,75,0.3)" }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center gap-1.5 bg-mm-red hover:bg-red-600
                             text-white text-xs font-body font-800 px-4 py-2 rounded-xl
                             transition-colors duration-200"
                >
                  <ShoppingCart size={13} />
                  Add
                </motion.button>
              ) : (
                <motion.div
                  key="stepper"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 bg-mm-red/10 rounded-xl p-1"
                >
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => onDec(plainKey)}
                    className="w-7 h-7 rounded-lg bg-mm-red text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                    <Minus size={12} />
                  </motion.button>
                  <motion.span key={plainQty} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="font-display text-lg text-mm-red w-5 text-center leading-none">
                    {plainQty}
                  </motion.span>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => onInc(plainKey)}
                    className="w-7 h-7 rounded-lg bg-mm-red text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                    <Plus size={12} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Size picker modal — rendered outside the card so it's not clipped */}
      <SizePickerModal
        open={pickerOpen}
        item={item}
        onSelect={handleSizeSelect}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}