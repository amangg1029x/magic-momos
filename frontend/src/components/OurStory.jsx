import { motion } from "framer-motion";

const TIMELINE = [
  {
    year: "2020",
    emoji: "🌱",
    title: "The Humble Beginning",
    desc: "Raju started with a small handcart near Lajpat Nagar metro, selling just 3 types of steamed momos. ₹5,000 capital, a family recipe, and pure hustle.",
    highlight: "50 momos/day",
    color: "#4CAF50",
  },
  {
    year: "2021",
    emoji: "⭐",
    title: "Word Spread Fast",
    desc: "No ads, no budget — just great food. Queues started forming. We moved to a proper stall, added Rolls and Samosa to the menu.",
    highlight: "First 100 regulars",
    color: "#F5A623",
  },
  {
    year: "2022",
    emoji: "🚀",
    title: "Magic Momos is Born",
    desc: "The name became official. Menu grew to 15 items. First Google review: ⭐⭐⭐⭐⭐. A local food blogger called us 'Delhi's best kept secret'.",
    highlight: "4.9 ⭐ first review",
    color: "#E8284B",
  },
  {
    year: "2023",
    emoji: "🛵",
    title: "Delivery Goes Live",
    desc: "Launched home delivery across the neighbourhood. Orders doubled within 3 months. Chilli Potato became a viral favourite.",
    highlight: "2× orders in 90 days",
    color: "#9C27B0",
  },
  {
    year: "2024",
    emoji: "🏆",
    title: "Delhi's Favourite",
    desc: "500+ regulars, 4.8 rating across platforms. Featured in Delhi Food Chronicles as one of the city's top street food spots.",
    highlight: "Featured in media",
    color: "#FF9800",
  },
  {
    year: "2025",
    emoji: "✨",
    title: "The Future is Magic",
    desc: "Online ordering, a loyalty programme, and a second location in Saket are in the works. The magic is only getting bigger.",
    highlight: "Expanding soon",
    color: "#E8284B",
  },
];

const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export default function OurStory() {
  return (
    <section className="relative py-24 sm:py-32 bg-mm-black overflow-hidden">
      {/* subtle blob */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px]
                      bg-mm-gold/[0.06] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* section label */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-4"
        >
          — The Journey —
        </motion.p>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-start">

          {/* ── LEFT: narrative ── */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="lg:sticky lg:top-32"
          >
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-mm-cream
                           leading-none mb-8 tracking-tight">
              HOW IT<br />
              <span
                style={{
                  background: "linear-gradient(110deg,#E8284B,#F5A623)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ALL BEGAN
              </span>
            </h2>

            <div className="space-y-5 font-body text-mm-muted text-[15px] leading-relaxed max-w-md">
              <p>
                In 2020, with ₹5,000 in savings and his mother's handwritten recipe book,
                <strong className="text-mm-cream font-700"> Raju Sharma</strong> set up a small
                handcart near the Lajpat Nagar metro exit. He had one goal: to make momos
                so good that people would come back tomorrow.
              </p>
              <p>
                They did. And they brought friends. And their friends brought more friends.
                No ads, no influencers — just the kind of honest food that doesn't need a
                marketing budget.
              </p>
              <p>
                Five years later, Magic Momos serves over{" "}
                <strong className="text-mm-cream font-700">500 regular customers</strong>,
                has a 4.8-star rating, and is still run by the same family with the same
                values — fresh ingredients, fair prices, and a little magic in every bite.
              </p>
            </div>

            {/* pull quote */}
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-10 pl-5 border-l-4 border-mm-red"
            >
              <p className="font-brand text-xl sm:text-2xl text-mm-cream leading-relaxed italic">
                "I had ₹5,000, a recipe from my mother, and a dream to feed Delhi.
                That's how Magic Momos was born."
              </p>
              <footer className="mt-3 font-body text-sm text-mm-muted font-600">
                — Raju Sharma, Founder & Head Chef
              </footer>
            </motion.blockquote>
          </motion.div>

          {/* ── RIGHT: timeline ── */}
          <div className="relative">
            {/* continuous vertical line */}
            <div className="absolute left-6 top-3 bottom-3 w-px bg-gradient-to-b
                            from-mm-red/30 via-mm-gold/30 to-mm-red/10" />

            <div className="space-y-2">
              {TIMELINE.map(({ year, emoji, title, desc, highlight, color }, i) => (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex gap-5 pl-14 pb-10 last:pb-0 group"
                >
                  {/* dot on the line */}
                  <div
                    className="absolute left-[18px] top-1.5 w-3 h-3 -translate-x-1/2
                               rounded-full border-2 border-white shadow-sm z-10
                               transition-transform duration-300 group-hover:scale-150"
                    style={{ background: color }}
                  />

                  {/* card */}
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 bg-white border border-mm-border rounded-2xl p-5
                               shadow-[0_2px_16px_rgba(42,30,27,0.07)]
                               hover:shadow-[0_6px_28px_rgba(42,30,27,0.11)]
                               hover:border-mm-red/25 transition-all duration-300"
                  >
                    {/* year + highlight */}
                    <div className="flex items-center justify-between mb-3 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">{emoji}</span>
                        <span
                          className="font-display text-lg leading-none"
                          style={{ color }}
                        >
                          {year}
                        </span>
                      </div>
                      <span
                        className="text-[11px] font-body font-700 px-2.5 py-1 rounded-full"
                        style={{ background: color + "18", color }}
                      >
                        {highlight}
                      </span>
                    </div>

                    <h3 className="font-display text-xl text-mm-cream mb-1.5 tracking-wide">
                      {title}
                    </h3>
                    <p className="font-body text-sm text-mm-muted leading-relaxed">
                      {desc}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}