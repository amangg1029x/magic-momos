import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, TrendingUp, ArrowRight } from "lucide-react";
import { useNav } from "../context/NavigationContext";
import api from "../services/api";

function PickCard({ pick, index }) {
  const stars = Math.floor(pick.rating);
  const { navigate } = useNav();

  return (
    <motion.div
      onClick={() => navigate("menu")}
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative group rounded-3xl bg-mm-card border border-mm-border
                 overflow-hidden p-7 flex flex-col gap-5 cursor-pointer shadow-card
                 hover:border-mm-red/30 transition-all duration-350"
    >
      {/* colored top strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
        style={{ background: pick.accent }}
      />

      {/* badge + orders */}
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-body font-700 px-2.5 py-1 rounded-full"
          style={{ background: pick.accent + "25", color: pick.accent }}
        >
          {pick.badge}
        </span>
        <span className="flex items-center gap-1 text-mm-muted text-xs font-body">
          <TrendingUp size={11} />
          {pick.orders}
        </span>
      </div>

      {/* image */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm select-none border border-mm-border/30 bg-mm-card2 shrink-0"
      >
        {pick.imageUrl ? (
          <img src={pick.imageUrl} alt={pick.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-2xl font-bold" style={{ color: pick.accent }}>
            {pick.name ? pick.name.substring(0, 2).toUpperCase() : "MM"}
          </div>
        )}
      </motion.div>

      {/* text */}
      <div className="flex-1">
        <h3 className="font-display text-3xl text-mm-cream mb-1.5 tracking-wide">{pick.name}</h3>
        <p className="font-body text-sm text-mm-muted leading-relaxed">{pick.subtitle}</p>
      </div>

      {/* rating */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            fill={i < stars ? pick.accent : "transparent"}
            stroke={i < stars ? pick.accent : "#7A6C6F"}
            strokeWidth={1.5}
          />
        ))}
        <span className="font-body text-xs text-mm-muted ml-1">
          {pick.rating} ({pick.reviews} reviews)
        </span>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between pt-4 border-t border-mm-border">
        <span className="font-display text-2xl" style={{ color: pick.accent }}>
          {pick.price}
        </span>
        <motion.button
          whileHover={{ scale: 1.08, x: 2 }}
          whileTap={{ scale: 0.92 }}
          className="group/btn flex items-center gap-1.5 text-mm-cream text-xs font-body font-700
                     hover:text-mm-gold transition-colors"
        >
          Order Now
          <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function BestSellers() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { navigate } = useNav();

  useEffect(() => {
    api.menu.getAll()
        .then((data) => {
          if (Array.isArray(data)) {
            setMenuItems(data);
          } else if (data && Array.isArray(data.items)) {
            setMenuItems(data.items);
          } else {
            setMenuItems([]);
          }
        })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="bestsellers" className="relative py-24 sm:py-32 bg-mm-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-center text-mm-cream">Loading best sellers...</p>
        </div>
      </section>
    );
  }

  // Dynamically determine best seller items from API data
  const bestSellerItems = menuItems.filter(item => item.popular);

  // Map items to the shape expected by PickCard
  const ACCENT_MAP = {
    momos: "#FF6F61",
    rolls: "#6B5B95",
    snacks: "#88B04B",
    sides: "#F7CAC9",
    drinks: "#92A8D1",
  };

  const PICKS = bestSellerItems.map(item => ({
    id: item.itemId,
    accent: ACCENT_MAP[item.category] || "#CCCCCC",
    badge: "Bestseller",
    orders: item.reviews || 0,
    subtitle: item.desc,
    price: `₹${item.price}`,
    name: item.name,
    emoji: item.emoji,
    imageUrl: item.imageUrl,
    rating: item.rating || 0,
    reviews: item.reviews || 0,
  }));

  // Validate required fields for each mapped pick; throw if missing
  const REQUIRED_FIELDS = ["accent", "badge", "orders", "subtitle", "price", "name"];
  PICKS.forEach(pick => {
    REQUIRED_FIELDS.forEach(field => {
      if (!pick[field]) {
        throw new Error(`Missing required field ${field} for best seller item with id ${pick.itemId}`);
      }
    });
  });

  // Generate ticker items from best seller names
  const TICKER_ITEMS = PICKS.map(pick => pick.name).filter(Boolean);
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <section id="bestsellers" className="relative py-24 sm:py-32 bg-mm-black overflow-hidden">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2
                      w-[500px] h-[500px] bg-mm-red/[0.07] rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">

        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-3"
            >
              — People's Favourites —
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl text-mm-cream leading-none"
            >
              BESTSELLERS
            </motion.h2>
          </div>

          <motion.button
            onClick={() => navigate("menu")}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 self-start sm:self-auto border border-mm-border
                       text-mm-cream/60 hover:text-mm-gold hover:border-mm-gold/40
                       px-6 py-3 rounded-full font-body text-sm font-600 transition-all"
          >
            See All Items →
          </motion.button>
        </div>

        {/* cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PICKS.map((pick, i) => (
            <PickCard key={pick.id} pick={pick} index={i} />
          ))}
        </div>
      </div>

      {/* ── marquee ticker ── */}
      <div className="relative mt-20 overflow-hidden border-y border-mm-border py-4 bg-mm-card/40">
        <div
          className="flex whitespace-nowrap animate-marquee"
          style={{ width: "max-content" }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className="font-display text-3xl text-mm-cream/25 mx-8 tracking-widest"
            >
              {item}
              <span className="text-mm-red/30 mx-4">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};