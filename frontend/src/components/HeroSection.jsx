import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, MapPin } from "lucide-react";

/* ── animation variants ── */
const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 36 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/* ── floating food badges ── */
const BADGES = [
    { emoji: "🌯", label: "Rolls", cls: "-right-6 top-6", delay: 0 },
    { emoji: "🫕", label: "Samosa", cls: "-right-2 bottom-14", delay: 0.4 },
    { emoji: "🍟", label: "Fries", cls: "-left-8 top-1/2 -translate-y-1/2", delay: 0.8 },
    { emoji: "🌶️", label: "Chilli", cls: "-left-4 bottom-6", delay: 1.2 },
];

/* ── mini stat pills ── */
const STATS = [
    { icon: Star, value: "4.8", label: "Avg Rating" },
    { icon: Clock, value: "20 min", label: "Avg Delivery" },
    { icon: MapPin, value: "Delhi", label: "Serving Since 2020" },
];

export default function HeroSection() {
    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center overflow-hidden bg-mm-black pt-20"
        >
            {/* ── ambient blobs ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -left-32 w-[520px] h-[520px]
                        bg-mm-red/[0.12] rounded-full blur-[110px]" />
                <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px]
                        bg-mm-gold/[0.10] rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[300px] h-[300px] bg-mm-red/[0.05] rounded-full blur-[80px]" />
                {/* dot grid */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
                    <defs>
                        <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#FFF8F0" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
            </div>

            {/* ── main grid ── */}
            <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full
                      grid md:grid-cols-2 gap-12 lg:gap-20 items-center py-16">

                {/* ── LEFT: text ── */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-6"
                >
                    {/* eyebrow */}
                    <motion.div variants={fadeUp}>
                        <span className="inline-flex items-center gap-2 bg-mm-red/15 border border-mm-red/30
                             text-mm-red px-4 py-1.5 rounded-full text-sm font-body font-600 tracking-wide">
                            <motion.span
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-mm-red inline-block"
                            />
                            Delhi's Finest Street Food
                        </span>
                    </motion.div>

                    {/* headline */}
                    <motion.div variants={fadeUp} className="leading-none">
                        <h1>
                            <span className="block font-display text-[4.5rem] sm:text-[5.5rem] lg:text-[6.5rem]
                               text-mm-cream tracking-tight">
                                TASTE
                            </span>
                            <span className="block font-display text-[4.5rem] sm:text-[5.5rem] lg:text-[6.5rem]
                               tracking-tight text-gold-gradient"
                                style={{
                                    background: "linear-gradient(100deg,#F5A623 0%,#FFD166 45%,#F5A623 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}>
                                THE MAGIC
                            </span>
                        </h1>
                        <p className="font-body font-600 text-mm-red/80 text-xl sm:text-2xl mt-1 tracking-widest uppercase">
                            — Magic Momos —
                        </p>
                    </motion.div>

                    {/* sub-copy */}
                    <motion.p
                        variants={fadeUp}
                        className="font-body text-mm-cream/65 text-base sm:text-lg max-w-[26rem] leading-relaxed"
                    >
                        From steaming dumplings to crispy fries — every bite is a little spell.
                        Made fresh, served hot, delivered to your door.
                    </motion.p>

                    {/* CTA row */}
                    <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-2">
                        <motion.button
                            whileHover={{ scale: 1.06, boxShadow: "0 0 34px rgba(232,40,75,0.6)" }}
                            whileTap={{ scale: 0.94 }}
                            className="group flex items-center gap-2 btn-shimmer text-white
                         px-7 py-3.5 rounded-full font-body font-800 text-sm tracking-wide
                         transition-all duration-300"
                        >
                            Order Now
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>

                        <motion.a
                            href="#menu"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 border border-mm-cream/25 text-mm-cream
                         px-7 py-3.5 rounded-full font-body font-700 text-sm tracking-wide
                         hover:border-mm-gold hover:text-mm-gold transition-all duration-300"
                        >
                            View Menu
                        </motion.a>
                    </motion.div>

                    {/* stats row */}
                    <motion.div
                        variants={fadeUp}
                        className="flex flex-wrap gap-5 pt-4 border-t border-mm-border"
                    >
                        {STATS.map(({ icon: Icon, value, label }) => (
                            <div key={label} className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-mm-card border border-mm-border
                                flex items-center justify-center text-mm-gold">
                                    <Icon size={14} />
                                </div>
                                <div>
                                    <p className="font-display text-lg text-mm-cream leading-none">{value}</p>
                                    <p className="font-body text-[11px] text-mm-muted uppercase tracking-wider leading-none mt-0.5">{label}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* ── RIGHT: food showcase ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="relative flex items-center justify-center min-h-[360px] md:min-h-0"
                >
                    {/* outer rotating dashed ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] lg:w-[420px] lg:h-[420px]
                       rounded-full border-2 border-dashed border-mm-gold/25"
                    />
                    {/* inner counter-rotating ring */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[240px] h-[240px] sm:w-[290px] sm:h-[290px] lg:w-[340px] lg:h-[340px]
                       rounded-full border border-mm-red/20"
                    />

                    {/* glow behind central circle */}
                    <div className="absolute w-48 h-48 rounded-full bg-mm-red/25 blur-[60px]" />
                    <div className="absolute w-40 h-40 rounded-full bg-mm-gold/20 blur-[50px]" />

                    {/* central plate */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 w-52 h-52 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-full
                       bg-gradient-to-br from-mm-card2 to-mm-black
                       border border-mm-border shadow-[0_0_60px_rgba(232,40,75,0.2)]
                       flex items-center justify-center"
                    >
                        <span className="text-[6rem] sm:text-[7rem] lg:text-[8rem] select-none drop-shadow-2xl">
                            🥟
                        </span>

                        {/* "Hot & Fresh" ribbon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: -15 }}
                            transition={{ delay: 1.2, type: "spring", stiffness: 260 }}
                            className="absolute -top-3 -right-2 bg-mm-red text-white
                         px-3 py-1 rounded-full font-body font-800 text-[11px] tracking-wide
                         shadow-glow-red"
                        >
                            ⭐ Best Seller
                        </motion.div>

                        {/* price badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.5, type: "spring", stiffness: 220 }}
                            className="absolute -bottom-3 -left-3 glass px-3 py-1.5 rounded-2xl
                         border border-mm-gold/30 text-mm-gold font-body font-800 text-xs"
                        >
                            From ₹60
                        </motion.div>
                    </motion.div>

                    {/* floating food badges */}
                    {BADGES.map(({ emoji, label, cls, delay }) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
                            transition={{
                                opacity: { delay: delay + 0.6, duration: 0.4 },
                                scale: { delay: delay + 0.6, duration: 0.4 },
                                y: { delay: delay + 1, duration: 3.5 + delay * 0.3, repeat: Infinity, ease: "easeInOut" },
                            }}
                            className={`absolute ${cls} glass px-3 py-2 rounded-2xl
                          flex items-center gap-2 shadow-card z-20`}
                        >
                            <span className="text-2xl">{emoji}</span>
                            <span className="font-body text-mm-cream text-xs font-600">{label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* ── scroll cue ── */}
            <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10
                   flex flex-col items-center gap-1 text-mm-cream/25"
            >
                <span className="font-body text-[10px] tracking-[0.25em] uppercase">Scroll</span>
                <div className="w-px h-10 bg-gradient-to-b from-mm-cream/25 to-transparent" />
            </motion.div>
        </section>
    );
}