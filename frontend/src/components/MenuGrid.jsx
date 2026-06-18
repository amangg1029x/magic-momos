import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import MenuItemCard from "./MenuItemCard";

const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "price-asc",  label: "Price: Low → High" },
  { id: "price-desc", label: "Price: High → Low" },
  { id: "rating",  label: "Top Rated" },
];

/* ── sort helper ── */
function sortItems(items, sortBy) {
  const arr = [...items];
  switch (sortBy) {
    case "price-asc":  return arr.sort((a, b) => a.price  - b.price);
    case "price-desc": return arr.sort((a, b) => b.price  - a.price);
    case "rating":     return arr.sort((a, b) => b.rating - a.rating);
    case "popular":
    default:           return arr.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
  }
}

/**
 * MenuGrid
 * Props:
 *   items     – full menu item array (from API)
 *   category  – active category id
 *   search    – search string
 *   cartItems – array of cart items [{ id, qty }]
 *   onAdd     – (item) => void
 *   onUpdate  – (id, delta) => void
 */
export default function MenuGrid({ items: allItems, category, search, cartItems, onAdd, onUpdate }) {
  const [sort, setSort]           = useState("popular");
  const [vegOnly, setVegOnly]     = useState(false);
  const [sortOpen, setSortOpen]   = useState(false);

  /* ── filtering + sorting pipeline ── */
  const filtered = useMemo(() => {
    let items = allItems;

    // category filter
    if (category !== "all") {
      items = items.filter((i) => i.category === category);
    }

    // search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.desc.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    // veg filter
    if (vegOnly) items = items.filter((i) => i.veg);

    return sortItems(items, sort);
  }, [allItems, category, search, vegOnly, sort]);

  /* ── cart qty helper ──────────────────────────────────────────────────────
     Cart items use the numeric itemId (item.id from frontend / item.itemId
     from the API), while menu items from the API carry _id + itemId. We match
     on itemId so the cart stays consistent regardless of source. */
  const getQty = (item) => {
    const key = item.itemId ?? item.id;
    return cartItems.find((i) => i.id === key)?.qty ?? 0;
  };

  // Normalise an API menu item into the shape useCart expects (id = itemId)
  const toCartItem = (item) => ({
    id:       item.itemId ?? item.id,
    name:     item.name,
    emoji:    item.emoji,
    imageUrl: item.imageUrl,
    price:    item.price,
  });

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">

      {/* ── toolbar ── */}
      <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
        {/* result count */}
        <p className="font-body text-sm text-mm-muted">
          Showing{" "}
          <span className="font-800 text-mm-cream">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "item" : "items"}
        </p>

        <div className="flex items-center gap-3">
          {/* veg toggle */}
          <button
            onClick={() => setVegOnly((v) => !v)}
            className={`flex items-center gap-2 text-xs font-body font-700 px-3.5 py-2
                        rounded-xl border transition-all duration-200
                        ${vegOnly
                          ? "bg-green-100 border-green-400/50 text-green-700"
                          : "bg-white border-mm-border text-mm-muted hover:border-green-300"
                        }`}
          >
            <span className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center
                              ${vegOnly ? "border-green-500 bg-green-500" : "border-mm-muted"}`}>
              {vegOnly && <span className="text-white text-[8px] leading-none">✓</span>}
            </span>
            Veg Only
          </button>

          {/* sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 text-xs font-body font-700 px-3.5 py-2
                         rounded-xl border border-mm-border bg-white text-mm-muted
                         hover:border-mm-red/30 hover:text-mm-cream transition-all"
            >
              <SlidersHorizontal size={13} />
              {SORT_OPTIONS.find((o) => o.id === sort)?.label}
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{   opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 bg-white border border-mm-border
                             rounded-2xl shadow-[0_12px_40px_rgba(42,30,27,0.12)]
                             overflow-hidden z-20 min-w-[190px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setSort(opt.id); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 font-body text-sm transition-colors
                                  ${sort === opt.id
                                    ? "bg-mm-red/8 text-mm-red font-700"
                                    : "text-mm-muted hover:bg-mm-card2 hover:text-mm-cream"
                                  }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* click-outside closer */}
            {sortOpen && (
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
            )}
          </div>
        </div>
      </div>

      {/* ── item grid ── */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key={`${category}-${search}-${vegOnly}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filtered.map((item, idx) => (
              <motion.div
                key={item.itemId ?? item.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3), duration: 0.4, ease: [0.22,1,0.36,1] }}
              >
                <MenuItemCard
                  item={item}
                  cartQty={getQty(item)}
                  onAdd={() => onAdd(toCartItem(item))}
                  onInc={() => onUpdate(item.itemId ?? item.id,  1)}
                  onDec={() => onUpdate(item.itemId ?? item.id, -1)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* ── empty state ── */
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{   opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
          >
            <span className="text-6xl animate-float">🔍</span>
            <h3 className="font-display text-3xl text-mm-cream">Nothing Found</h3>
            <p className="font-body text-mm-muted text-sm max-w-xs">
              We couldn't find anything matching{" "}
              <span className="text-mm-red font-700">"{search}"</span>.
              Try a different keyword or clear the search.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}