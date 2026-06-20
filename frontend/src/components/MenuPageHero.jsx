import { motion } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import { useNav } from "../context/NavigationContext";

export default function MenuPageHero({ search, onSearch }) {
  const { navigate, isNative } = useNav();

  return (
    <section className="relative overflow-hidden bg-mm-card2 border-b border-mm-border">
      {/* ── decorative background ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* warm radial centre glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)",
          }}
        />
        {/* dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]">
          <defs>
            <pattern
              id="hero-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1.4" cy="1.4" r="1.4" fill="#2A1E1B" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-32 pb-14">
        {/* breadcrumb */}
        {!isNative && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-1.5 text-xs font-body text-mm-muted mb-6"
          >
            <button
              onClick={() => navigate("home")}
              className="hover:text-mm-red transition-colors font-600"
            >
              Home
            </button>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-mm-cream font-600">Full Menu</span>
          </motion.nav>
        )}

        {/* title row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display leading-none text-mm-cream">
              <span className="block text-[3.5rem] sm:text-[5rem] lg:text-[6rem] tracking-tight">
                FULL
              </span>
              <span
                className="block text-[3.5rem] sm:text-[5rem] lg:text-[6rem] tracking-tight"
                style={{
                  background: "linear-gradient(110deg,#E8284B 0%,#F5A623 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                MENU
              </span>
            </h1>
            <p className="font-body text-mm-muted text-base mt-2 max-w-xs">
              20+ items across 5 categories — something for every craving.
            </p>
          </motion.div>

          {/* floating emoji stack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex items-center gap-4 pb-2"
          >
            {["🥟", "🌯", "🫕", "🍟", "🥤"].map((emoji, i) => (
              <motion.div
                key={emoji}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-14 h-14 rounded-2xl bg-white border border-mm-border
                           shadow-card flex items-center justify-center text-2xl"
              >
                {emoji}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── search bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="relative max-w-2xl"
        >
          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-mm-muted pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search momos, rolls, samosa…"
            className="w-full bg-white border border-mm-border rounded-2xl
                       pl-12 pr-5 py-4 font-body text-mm-cream text-sm
                       placeholder:text-mm-muted shadow-card
                       focus:outline-none focus:border-mm-red/50
                       focus:shadow-[0_0_0_3px_rgba(232,40,75,0.10)]
                       transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         text-mm-muted hover:text-mm-red transition-colors text-lg"
            >
              ×
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}