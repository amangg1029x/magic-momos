import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * SizePickerModal
 *
 * Opens as a bottom-sheet when the user taps "Add" on any item that has
 * a halfPrice. For items with no halfPrice (rolls, burgers, etc.) the
 * parent should skip this modal and call onSelect("full") directly.
 *
 * Props:
 *   open       — boolean
 *   item       — the full menu item object ({ name, emoji, price, halfPrice, ... })
 *   onSelect   — (size: "half" | "full") => void
 *   onClose    — () => void
 */
export default function SizePickerModal({ open, item, onSelect, onClose }) {
  if (!item) return null;

  const OPTIONS = [
    {
      size:     "half",
      label:    "Half Plate",
      sublabel: "Great for light hunger or trying a new item",
      price:    item.halfPrice,
      emoji:    "🍽️",
    },
    {
      size:     "full",
      label:    "Full Plate",
      sublabel: "Full serving — the crowd favourite",
      price:    item.price,
      emoji:    "🥣",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            key="size-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
          />

          {/* bottom sheet */}
          <motion.div
            key="size-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[70]
                       bg-white rounded-t-3xl shadow-[0_-8px_40px_rgba(42,30,27,0.18)]
                       px-5 pt-4 pb-8 sm:max-w-sm sm:mx-auto sm:left-1/2
                       sm:-translate-x-1/2 sm:rounded-3xl sm:bottom-1/2
                       sm:translate-y-1/2 sm:pb-6"
          >
            {/* drag handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />

            {/* header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.emoji}</span>
                <div>
                  <h3 className="font-display text-lg text-mm-cream leading-tight tracking-wide">
                    {item.name}
                  </h3>
                  <p className="font-body text-xs text-mm-muted">Choose your serving size</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-mm-card2 border border-mm-border
                           flex items-center justify-center text-mm-muted
                           hover:text-mm-cream transition-colors shrink-0 mt-0.5"
              >
                <X size={15} />
              </button>
            </div>

            {/* size options */}
            <div className="space-y-2.5">
              {OPTIONS.map(({ size, label, sublabel, price, emoji }) => (
                <motion.button
                  key={size}
                  onClick={() => { onSelect(size); onClose(); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-mm-border
                             hover:border-mm-red/40 hover:bg-mm-red/[0.03]
                             text-left transition-all duration-200 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-mm-card2 border border-mm-border
                                  flex items-center justify-center text-xl shrink-0
                                  group-hover:bg-mm-red/10 group-hover:border-mm-red/20 transition-colors">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-700 text-sm text-mm-cream">{label}</p>
                    <p className="font-body text-xs text-mm-muted leading-snug">{sublabel}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-xl text-mm-red">₹{price}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}