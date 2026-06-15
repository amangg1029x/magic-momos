import { motion } from "framer-motion";
import { ChevronRight, Calendar, MapPin, Users } from "lucide-react";
import { useNav } from "../context/NavigationContext";

const QUICK_FACTS = [
  { icon: Calendar, label: "Founded",  value: "2020"          },
  { icon: MapPin,   label: "Location", value: "Lajpat Nagar"  },
  { icon: Users,    label: "Customers", value: "500+ & growing" },
];

export default function AboutPageHero() {
  const { navigate } = useNav();

  return (
    <section className="relative overflow-hidden bg-mm-card2 border-b border-mm-border">
      {/* ── decorative background ── */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(232,40,75,0.10) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(245,166,35,0.14) 0%, transparent 70%)",
          }}
        />
        {/* large faint "EST." watermark */}
        <span
          className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2
                     font-display text-[10rem] sm:text-[14rem] text-mm-cream/[0.05]
                     select-none pointer-events-none leading-none"
        >
          2020
        </span>
        {/* dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
          <defs>
            <pattern id="about-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.4" cy="1.4" r="1.4" fill="#2A1E1B" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#about-dots)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-32 pb-0">
        {/* breadcrumb */}
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
          <span className="text-mm-cream font-600">About Us</span>
        </motion.nav>

        {/* headline block */}
        <div className="grid lg:grid-cols-2 gap-10 items-end pb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-4"
            >
              — Who We Are —
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-display leading-none text-mm-cream"
            >
              <span className="block text-[3.8rem] sm:text-[5.5rem] lg:text-[6.5rem] tracking-tight">
                OUR
              </span>
              <span
                className="block text-[3.8rem] sm:text-[5.5rem] lg:text-[6.5rem] tracking-tight"
                style={{
                  background: "linear-gradient(110deg,#E8284B 0%,#F5A623 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                STORY
              </span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="pb-2"
          >
            <p className="font-body text-mm-muted text-base sm:text-lg leading-relaxed mb-6 max-w-md">
              From a handcart by the metro to Delhi's most-loved street food spot —
              Magic Momos is a story of flavour, family and stubborn belief in
              doing one thing extraordinarily well.
            </p>

            <motion.button
              onClick={() => navigate("menu")}
              whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(232,40,75,0.25)" }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 bg-mm-red text-white
                         px-6 py-3 rounded-full font-body font-700 text-sm
                         hover:bg-red-600 transition-colors"
            >
              See Our Menu →
            </motion.button>
          </motion.div>
        </div>

        {/* ── quick-fact strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="grid grid-cols-3 border-t border-mm-border"
        >
          {QUICK_FACTS.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 py-5 px-4
                          ${i < QUICK_FACTS.length - 1 ? "border-r border-mm-border" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-mm-red/10 border border-mm-red/20
                              flex items-center justify-center text-mm-red shrink-0">
                <Icon size={16} />
              </div>
              <div>
                <p className="font-body text-[11px] text-mm-muted uppercase tracking-wider">{label}</p>
                <p className="font-body font-700 text-mm-cream text-sm">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* wave divider */}
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="w-full h-10 sm:h-12 block"
        style={{ fill: "var(--wave-fill, #FFF9E6)" }}
      >
        <path d="M0,48 L0,16 Q360,48 720,16 Q1080,-16 1440,16 L1440,48 Z" fill="#FFF9E6" />
      </svg>
    </section>
  );
}