import { useRef } from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "../data/menuData";

export default function MenuCategoryFilter({ active, onChange, counts }) {
  const barRef = useRef(null);

  return (
    <div className="sticky top-[72px] z-30 bg-mm-black/95 backdrop-blur-md
                    border-b border-mm-border shadow-[0_4px_24px_rgba(42,30,27,0.06)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* scroll wrapper */}
        <div
          ref={barRef}
          className="flex items-center gap-2 py-3 overflow-x-auto
                     scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none]
                     [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map(({ id, label, emoji }) => {
            const isActive = active === id;
            const count = id === "all"
              ? Object.values(counts ?? {}).reduce((a, b) => a + b, 0)
              : counts?.[id] ?? 0;

            return (
              <motion.button
                key={id}
                onClick={() => onChange(id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-xl
                  font-body font-700 text-sm whitespace-nowrap
                  transition-all duration-200 shrink-0
                  ${isActive
                    ? "bg-mm-red text-white shadow-[0_4px_14px_rgba(232,40,75,0.30)]"
                    : "bg-mm-card border border-mm-border text-mm-muted hover:text-mm-cream hover:border-mm-red/30"
                  }
                `}
              >
                <span className="text-base leading-none">{emoji}</span>
                <span>{label}</span>

                {/* item count badge */}
                {count > 0 && (
                  <span
                    className={`
                      text-[10px] font-800 px-1.5 py-0.5 rounded-full leading-none
                      ${isActive
                        ? "bg-white/25 text-white"
                        : "bg-mm-card2 text-mm-muted"
                      }
                    `}
                  >
                    {count}
                  </span>
                )}

                {/* active underline pill */}
                {isActive && (
                  <motion.span
                    layoutId="active-filter"
                    className="absolute inset-0 rounded-xl"
                    style={{ zIndex: -1 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}