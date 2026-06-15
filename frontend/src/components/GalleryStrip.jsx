import { motion } from "framer-motion";
import { useNav } from "../context/NavigationContext";

/* ── bento grid items ── */
const GALLERY = [
  {
    id:    1,
    emoji: "🥟",
    name:  "Steam Momos",
    tag:   "Bestseller",
    bg:    "from-orange-100 to-amber-50",
    border:"border-orange-200",
    accent:"#E8284B",
    span:  "row-span-2",          // tall card
  },
  {
    id:    2,
    emoji: "🌶️",
    name:  "Chilli Potato",
    tag:   "Fan Fav",
    bg:    "from-red-100 to-rose-50",
    border:"border-red-200",
    accent:"#E8284B",
    span:  "",
  },
  {
    id:    3,
    emoji: "🌯",
    name:  "Paneer Roll",
    tag:   "Veg",
    bg:    "from-green-100 to-emerald-50",
    border:"border-green-200",
    accent:"#059669",
    span:  "",
  },
  {
    id:    4,
    emoji: "🫕",
    name:  "Aloo Samosa",
    tag:   "Classic",
    bg:    "from-yellow-100 to-amber-50",
    border:"border-yellow-200",
    accent:"#D97706",
    span:  "col-span-2",          // wide card
  },
  {
    id:    5,
    emoji: "🍟",
    name:  "French Fries",
    tag:   "Crispy",
    bg:    "from-amber-100 to-yellow-50",
    border:"border-amber-200",
    accent:"#B45309",
    span:  "",
  },
  {
    id:    6,
    emoji: "🥟",
    name:  "Fried Momos",
    tag:   "Golden",
    bg:    "from-orange-100 to-red-50",
    border:"border-orange-200",
    accent:"#C2410C",
    span:  "",
  },
  {
    id:    7,
    emoji: "☕",
    name:  "Cutting Chai",
    tag:   "#1 Drink",
    bg:    "from-stone-100 to-amber-50",
    border:"border-stone-200",
    accent:"#78350F",
    span:  "",
  },
];

function GalleryCard({ item, index }) {
  const { emoji, name, tag, bg, border, accent, span } = item;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${bg}
                  border ${border} shadow-card cursor-pointer
                  hover:shadow-[0_12px_40px_rgba(42,30,27,0.12)]
                  transition-all duration-300 ${span}
                  flex flex-col items-center justify-center p-5 gap-3 min-h-[160px]`}
    >
      {/* tag */}
      <span
        className="absolute top-3 left-3 text-[10px] font-body font-800
                   px-2 py-0.5 rounded-full uppercase tracking-wider"
        style={{ background: accent + "20", color: accent }}
      >
        {tag}
      </span>

      {/* emoji */}
      <motion.span
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
        className="text-5xl sm:text-6xl select-none drop-shadow-sm
                   group-hover:scale-110 transition-transform duration-300"
      >
        {emoji}
      </motion.span>

      {/* name */}
      <p className="font-display text-lg sm:text-xl text-mm-cream text-center leading-tight tracking-wide">
        {name}
      </p>

      {/* hover overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center
                   bg-white/40 backdrop-blur-[2px] rounded-2xl"
      >
        <span
          className="font-body font-800 text-sm px-4 py-2 rounded-full text-white"
          style={{ background: accent }}
        >
          Order Now →
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function GalleryStrip() {
  const { navigate } = useNav();

  return (
    <section className="relative py-24 sm:py-32 bg-mm-black overflow-hidden">
      {/* ambient */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[700px] h-[400px] bg-mm-gold/[0.06] rounded-full blur-[130px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-3"
            >
              — A Taste of Magic —
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl text-mm-cream leading-none"
            >
              WHAT WE MAKE
            </motion.h2>
          </div>

          <motion.button
            initial={{ opacity: 0, x: 14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
            onClick={() => navigate("menu")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 self-start sm:self-auto flex items-center gap-2
                       bg-mm-red text-white px-6 py-3 rounded-full
                       font-body font-700 text-sm hover:bg-red-600 transition-colors"
          >
            Full Menu →
          </motion.button>
        </div>

        {/* ── bento grid ── */}
        {/*
          Layout on desktop (4 cols, auto rows of 180px):
          Col: [1] [2] [3] [4]
          Row1: Steam(rowSpan2) | Chilli | Roll | Samosa(colSpan2) -- wait let me re-think

          Actually let me use a simpler approach that works well on all screens:
          Grid 4 cols, named rows. Steam Momos is tall (row-span-2).
          Samosa is wide (col-span-2).
        */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4
                     auto-rows-[180px] sm:auto-rows-[200px]"
        >
          {/* Steam Momos – tall */}
          <GalleryCard item={GALLERY[0]} index={0} />

          {/* Chilli Potato – normal */}
          <GalleryCard item={GALLERY[1]} index={1} />

          {/* Paneer Roll – normal */}
          <GalleryCard item={GALLERY[2]} index={2} />

          {/* Aloo Samosa – wide (hides on < lg, shows as normal on mobile) */}
          <div className="hidden lg:block">
            <GalleryCard item={{ ...GALLERY[3], span: "h-full" }} index={3} />
          </div>
          <div className="block lg:hidden">
            <GalleryCard item={{ ...GALLERY[3], span: "" }} index={3} />
          </div>

          {/* French Fries – normal */}
          <GalleryCard item={GALLERY[4]} index={4} />

          {/* Fried Momos – normal */}
          <GalleryCard item={GALLERY[5]} index={5} />

          {/* Chai – normal */}
          <GalleryCard item={GALLERY[6]} index={6} />
        </div>

        {/* caption */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center font-body text-mm-muted text-sm mt-8"
        >
          Hover any item and click to order · Full menu has 22 items across 5 categories
        </motion.p>
      </div>
    </section>
  );
}