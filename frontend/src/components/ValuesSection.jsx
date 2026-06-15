import { motion } from "framer-motion";
import { Leaf, Heart, BadgeIndianRupee } from "lucide-react";

const VALUES = [
  {
    icon:    Leaf,
    emoji:   "🌿",
    title:   "Fresh Over Fast",
    tagline: "Never frozen. Ever.",
    body:    "Every single ingredient we use is sourced fresh each morning from the local sabzi mandi. We'd rather run out early than serve food that isn't at its best. Our kitchen rule is simple: if it's not fresh, it's not served.",
    proof:   ["Zero frozen ingredients", "Daily sourcing from local market", "No preservatives, no shortcuts"],
    accent:  "#059669",
    bg:      "from-emerald-50/80 to-green-50/40",
    border:  "hover:border-emerald-200",
  },
  {
    icon:    Heart,
    emoji:   "❤️",
    title:   "Community First",
    tagline: "We're neighbours, not just a business.",
    body:    "Magic Momos was born in this neighbourhood and we intend to grow here. We source from local vendors, hire locally, and price our food so that the office peon and the office VP can both afford to eat here.",
    proof:   ["Fair prices, always", "Local vendors & suppliers", "100+ neighbourhood regulars"],
    accent:  "#E8284B",
    bg:      "from-red-50/80 to-rose-50/40",
    border:  "hover:border-red-200",
  },
  {
    icon:    BadgeIndianRupee,
    emoji:   "🏆",
    title:   "Value for Every Rupee",
    tagline: "Premium taste, honest price.",
    body:    "We believe great food shouldn't be a luxury. Every item on our menu is priced so that a student on a tight budget can enjoy the same quality as someone celebrating a promotion. Great food is for everyone.",
    proof:   ["Menu starts at ₹20", "No hidden charges", "Free delivery above ₹199"],
    accent:  "#F5A623",
    bg:      "from-amber-50/80 to-yellow-50/40",
    border:  "hover:border-amber-200",
  },
];

export default function ValuesSection() {
  return (
    <section className="relative py-24 sm:py-32 bg-mm-card overflow-hidden">
      {/* decorative stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-px
                      bg-gradient-to-r from-transparent via-mm-border to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* heading */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-3"
          >
            — Our Principles —
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl text-mm-cream tracking-tight"
          >
            WHAT DRIVES US
          </motion.h2>
        </div>

        {/* value cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {VALUES.map(({ icon: Icon, emoji, title, tagline, body, proof, accent, bg, border }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className={`group relative flex flex-col gap-6 p-7 rounded-3xl
                          bg-gradient-to-br ${bg} border border-mm-border ${border}
                          shadow-card hover:shadow-[0_14px_48px_rgba(42,30,27,0.10)]
                          transition-all duration-350 overflow-hidden`}
            >
              {/* decorative large emoji watermark */}
              <span
                className="absolute -bottom-4 -right-4 text-[7rem] opacity-[0.07]
                           select-none pointer-events-none leading-none"
              >
                {emoji}
              </span>

              {/* icon + number */}
              <div className="flex items-start justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center
                             shadow-sm shrink-0"
                  style={{ background: accent + "20" }}
                >
                  <Icon size={26} style={{ color: accent }} />
                </div>
                <span
                  className="font-display text-6xl opacity-20 leading-none"
                  style={{ color: accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* text */}
              <div>
                <h3 className="font-display text-3xl text-mm-cream tracking-wide leading-tight mb-1">
                  {title}
                </h3>
                <p className="font-body text-sm font-700 italic" style={{ color: accent }}>
                  {tagline}
                </p>
              </div>

              <p className="font-body text-sm text-mm-muted leading-relaxed flex-1">
                {body}
              </p>

              {/* proof points */}
              <ul className="space-y-2">
                {proof.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 font-body text-sm text-mm-cream">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center
                                 text-white text-[9px] font-800 shrink-0"
                      style={{ background: accent }}
                    >
                      ✓
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}