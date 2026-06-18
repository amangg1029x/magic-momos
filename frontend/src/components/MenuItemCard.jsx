import { motion, AnimatePresence } from "framer-motion";
import { Star, Flame, Minus, Plus, ShoppingCart } from "lucide-react";

/**
 * MenuItemCard
 * Props:
 *   item      – menu item object from menuData.js
 *   cartQty   – current quantity in cart (0 if not added)
 *   onAdd     – () => void
 *   onInc     – () => void
 *   onDec     – () => void
 */
export default function MenuItemCard({ item, cartQty = 0, onAdd, onInc, onDec }) {
  const inCart = cartQty > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`
        group relative flex flex-col gap-4 p-5 rounded-2xl bg-white
        border transition-all duration-300 cursor-default
        ${inCart
          ? "border-mm-red/30 shadow-[0_6px_28px_rgba(232,40,75,0.10)]"
          : "border-mm-border shadow-card hover:shadow-[0_8px_32px_rgba(42,30,27,0.10)] hover:border-mm-red/20"
        }
      `}
    >
      {/* ── in-cart glow strip ── */}
      <AnimatePresence>
        {inCart && (
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
          {/* popular badge */}
          {item.popular && (
            <span className="text-[10px] font-body font-800 px-2 py-0.5 rounded-full
                             bg-mm-gold/15 text-amber-700 uppercase tracking-wider">
              🔥 Popular
            </span>
          )}
          {/* veg / non-veg dot */}
          <span
            className={`flex items-center gap-1 text-[10px] font-body font-700 px-2 py-0.5 rounded-full border
                        ${item.veg
                          ? "border-green-400/60 text-green-700 bg-green-50"
                          : "border-red-400/60  text-red-700  bg-red-50"
                        }`}
          >
            <span
              className={`w-2 h-2 rounded-full inline-block
                          ${item.veg ? "bg-green-500" : "bg-red-500"}`}
            />
            {item.veg ? "Veg" : "Non-Veg"}
          </span>
        </div>

        {/* spicy */}
        {item.spicy && (
          <span className="flex items-center gap-0.5 text-orange-500 text-xs font-body font-700">
            <Flame size={12} /> Spicy
          </span>
        )}
      </div>

      {/* ── image ── */}
      <motion.div
        animate={{ scale: inCart ? [1, 1.03, 1] : 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-44 rounded-2xl overflow-hidden select-none relative bg-gradient-to-br from-amber-50 to-orange-50
                   border border-gray-100 group-hover:scale-[1.02] transition-transform duration-300"
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-4xl text-[#E8284B] font-bold">
            {item.name ? item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "MM"}
          </div>
        )}
      </motion.div>

      {/* ── text ── */}
      <div className="flex-1 flex flex-col gap-1">
        <h3 className="font-display text-[1.45rem] text-mm-cream leading-tight tracking-wide">
          {item.name}
        </h3>
        <p className="font-body text-[13px] text-mm-muted leading-relaxed line-clamp-2">
          {item.desc}
        </p>
      </div>

      {/* ── rating ── */}
      <div className="flex items-center gap-1.5">
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
      <div className="flex items-center justify-between pt-3 border-t border-mm-border">
        <div>
          <span className="font-display text-[1.5rem] text-mm-cream leading-none">
            ₹{item.price}
          </span>
          <span className="font-body text-[11px] text-mm-muted ml-1">per plate</span>
        </div>

        {/* cart control — toggles between Add button and qty stepper */}
        <AnimatePresence mode="wait" initial={false}>
          {!inCart ? (
            <motion.button
              key="add"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{   opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={onAdd}
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
              exit={{   opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 bg-mm-red/10 rounded-xl p-1"
            >
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onDec}
                className="w-7 h-7 rounded-lg bg-mm-red text-white flex items-center
                           justify-center hover:bg-red-600 transition-colors"
              >
                <Minus size={12} />
              </motion.button>

              <motion.span
                key={cartQty}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                className="font-display text-lg text-mm-red w-5 text-center leading-none"
              >
                {cartQty}
              </motion.span>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onInc}
                className="w-7 h-7 rounded-lg bg-mm-red text-white flex items-center
                           justify-center hover:bg-red-600 transition-colors"
              >
                <Plus size={12} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}