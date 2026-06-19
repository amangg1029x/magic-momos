import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, ShoppingBag, Star, UtensilsCrossed } from "lucide-react";

/* ── counter hook (local) ── */
function useCounter(target, duration = 2000, started = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const isFloat = !Number.isInteger(target);
    const realTarget = isFloat ? target * 10 : target;

    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * realTarget));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return count;
}

const MILESTONES = [
  {
    icon:    Users,
    rawValue: 500,
    suffix:  "+",
    label:   "Happy Customers",
    sub:     "Regulars who return every week",
    accent:  "#E8284B",
    bg:      "from-red-50 to-rose-50/50",
    border:  "border-red-100",
  },
  {
    icon:    ShoppingBag,
    rawValue: 10000,
    suffix:  "+",
    label:   "Orders Served",
    sub:     "Hot, fresh, on time — every one",
    accent:  "#F5A623",
    bg:      "from-amber-50 to-yellow-50/50",
    border:  "border-amber-100",
  },
  {
    icon:    Star,
    rawValue: 4.6,
    suffix:  "★",
    label:   "Avg Rating",
    sub:     "Across Google & Zomato",
    accent:  "#7C3AED",
    bg:      "from-violet-50 to-purple-50/50",
    border:  "border-violet-100",
  },
  {
    icon:    UtensilsCrossed,
    rawValue: 22,
    suffix:  "",
    label:   "Menu Items",
    sub:     "Across 5 delicious categories",
    accent:  "#059669",
    bg:      "from-emerald-50 to-green-50/50",
    border:  "border-emerald-100",
  },
];

/* ── single counter card ── */
function MilestoneCard({ milestone, index, started }) {
  const { icon: Icon, rawValue, suffix, label, sub, accent, bg, border } = milestone;
  const isFloat  = !Number.isInteger(rawValue);
  const rawCount = useCounter(rawValue, 2000 + index * 100, started);
  const display  = isFloat ? (rawCount / 10).toFixed(1) : rawCount.toLocaleString("en-IN");

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bg}
                  border ${border} p-7 flex flex-col gap-4 shadow-card
                  hover:shadow-[0_12px_40px_rgba(42,30,27,0.10)] transition-all duration-350`}
    >
      {/* decorative circle */}
      <div
        className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-[0.08]"
        style={{ background: accent }}
      />

      {/* icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: accent + "18" }}
      >
        <Icon size={22} style={{ color: accent }} />
      </div>

      {/* number */}
      <div>
        <div className="flex items-end gap-1 leading-none">
          <span
            className="font-display text-[3.5rem] sm:text-[4rem] leading-none"
            style={{ color: accent }}
          >
            {display}
          </span>
          <span
            className="font-display text-[2rem] leading-none pb-1"
            style={{ color: accent }}
          >
            {suffix}
          </span>
        </div>
        <p className="font-display text-xl text-mm-cream tracking-wide mt-2">{label}</p>
        <p className="font-body text-xs text-mm-muted mt-1">{sub}</p>
      </div>
    </motion.div>
  );
}

export default function MilestonesSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32 bg-mm-card overflow-hidden">
      {/* stripe accent */}
      <div className="absolute top-0 left-0 right-0 h-1
                      bg-gradient-to-r from-mm-red via-mm-gold to-mm-red" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* heading */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-3"
          >
            — By The Numbers —
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl text-mm-cream tracking-tight"
          >
            THE MAGIC IN
            <br />
            <span
              style={{
                background: "linear-gradient(110deg,#E8284B,#F5A623)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NUMBERS
            </span>
          </motion.h2>
        </div>

        {/* cards grid */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MILESTONES.map((m, i) => (
            <MilestoneCard key={m.label} milestone={m} index={i} started={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}