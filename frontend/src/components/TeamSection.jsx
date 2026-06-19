import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const TEAM = [
  {
    emoji:  "👨‍🍳",
    name:   "Raju Sharma",
    role:   "Founder & Head Chef",
    since:  "2020",
    bio:    "Started with a handcart and his mother's recipe. Raju perfected every momo by hand before serving it to the public.",
    quote:  "If it's not good enough for my family, it's not good enough for our customers.",
    accent: "#E8284B",
    bg:     "from-red-50 to-rose-50",
  },
  {
    emoji:  "👩‍🍳",
    name:   "Priya Sharma",
    role:   "Co-founder & Kitchen Head",
    since:  "2020",
    bio:    "Raju's wife and the quiet force behind every recipe. Priya's Chilli Potato is the single most-ordered item on the menu.",
    quote:  "Food is love made visible. We pour that into every plate.",
    accent: "#F5A623",
    bg:     "from-amber-50 to-yellow-50",
  },
  {
    emoji:  "👨‍💼",
    name:   "Arjun Mehta",
    role:   "Operations & Delivery Head",
    since:  "2024",
    bio:    "Former logistics professional who joined after becoming a regular customer. Arjun built our delivery system from scratch.",
    quote:  "Hot food, on time, every time. That's the only KPI that matters.",
    accent: "#3B82F6",
    bg:     "from-blue-50 to-sky-50",
  },
  {
    emoji:  "👩‍💻",
    name:   "Sneha Kapoor",
    role:   "Customer Experience",
    since:  "2023",
    bio:    "Handles everything from online orders to complaints. Sneha turns every negative review into a loyal customer.",
    quote:  "A complaint is just an opportunity wearing a grumpy face.",
    accent: "#059669",
    bg:     "from-emerald-50 to-green-50",
  },
];

export default function TeamSection() {
  return (
    <section className="relative py-24 sm:py-32 bg-mm-black overflow-hidden">
      {/* ambient */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2
                      w-[700px] h-[300px] bg-mm-red/[0.05] rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* heading */}
        <div className="max-w-xl mb-16">
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-3"
          >
            — The People —
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl text-mm-cream leading-none"
          >
            BEHIND THE
            <br />
            <span
              style={{
                background: "linear-gradient(110deg,#F5A623,#E8284B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              MAGIC
            </span>
          </motion.h2>
        </div>

        {/* cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map(({ emoji, name, role, since, bio, quote, accent, bg }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col rounded-3xl bg-white
                         border border-mm-border overflow-hidden shadow-card
                         hover:shadow-[0_12px_40px_rgba(42,30,27,0.10)]
                         hover:border-mm-red/20 transition-all duration-350"
            >
              {/* coloured top bar */}
              <div
                className="h-1.5 w-full transition-all duration-300 group-hover:h-2"
                style={{ background: accent }}
              />

              <div className="flex flex-col gap-4 p-6 flex-1">
                {/* avatar */}
                <motion.div
                  whileHover={{ scale: 1.12, rotate: 5 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl
                             shadow-sm self-start"
                  style={{ background: accent + "15" }}
                >
                  {emoji}
                </motion.div>

                {/* identity */}
                <div>
                  <h3 className="font-display text-xl text-mm-cream tracking-wide leading-tight">
                    {name}
                  </h3>
                  <p className="font-body text-sm font-700 mt-0.5" style={{ color: accent }}>
                    {role}
                  </p>
                  <p className="font-body text-[11px] text-mm-muted mt-0.5 uppercase tracking-wider">
                    Since {since}
                  </p>
                </div>

                {/* bio */}
                <p className="font-body text-sm text-mm-muted leading-relaxed flex-1">
                  {bio}
                </p>

                {/* quote */}
                <div
                  className="relative mt-1 p-3.5 rounded-xl"
                  style={{ background: accent + "0D" }}
                >
                  <Quote
                    size={14}
                    style={{ color: accent }}
                    className="absolute top-2 left-2 opacity-50"
                  />
                  <p className="font-brand text-[0.95rem] leading-snug text-mm-cream pl-3 italic">
                    {quote}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}