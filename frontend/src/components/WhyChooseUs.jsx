import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Leaf, Zap, Heart, BadgeIndianRupee } from "lucide-react";

/* ── animated counter hook ── */
function useCounter(target, duration = 1800, start = false) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!start) return;
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
            setCount(Math.round(ease * target));
            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }, [start, target, duration]);

    return count;
}

/* ── data ── */
const FEATURES = [
    {
        icon: Leaf,
        title: "Fresh Every Day",
        desc: "We source ingredients daily. No freezer packs, no shortcuts — just honest, fresh food made to order.",
        color: "text-green-400",
        border: "group-hover:border-green-500/40",
        glow: "group-hover:shadow-[0_0_30px_rgba(74,222,128,0.15)]",
    },
    {
        icon: Zap,
        title: "Lightning Fast",
        desc: "Your order is hot and on its way in under 30 minutes. Because hunger doesn't like to wait.",
        color: "text-mm-gold",
        border: "group-hover:border-mm-gold/40",
        glow: "group-hover:shadow-[0_0_30px_rgba(245,166,35,0.15)]",
    },
    {
        icon: Heart,
        title: "Made With Love",
        desc: "Every recipe has been perfected over years. We cook the way your grandma would — with full heart.",
        color: "text-mm-red",
        border: "group-hover:border-mm-red/40",
        glow: "group-hover:shadow-[0_0_30px_rgba(232,40,75,0.15)]",
    },
    {
        icon: BadgeIndianRupee,
        title: "Best Value",
        desc: "Premium street food shouldn't break the bank. World-class flavour at honest Delhi prices.",
        color: "text-blue-400",
        border: "group-hover:border-blue-400/40",
        glow: "group-hover:shadow-[0_0_30px_rgba(96,165,250,0.15)]",
    },
];

const STATS = [
    { target: 500, suffix: "+", label: "Happy Customers" },
    { target: 20, suffix: "+", label: "Menu Items" },
    { target: 2, suffix: " ★", label: "Years Serving" },
    { target: 4.6, suffix: "", label: "Avg Rating" },
];

/* ── CounterCell component ── */
function CounterCell({ target, suffix, label, started }) {
    const value = useCounter(
        Number.isInteger(target) ? target : target * 10,
        2000,
        started
    );
    const display = Number.isInteger(target)
        ? value
        : (value / 10).toFixed(1);

    return (
        <div className="text-center px-4">
            <p className="font-display text-4xl sm:text-5xl text-mm-gold leading-none">
                {display}{suffix}
            </p>
            <p className="font-body text-xs text-mm-muted uppercase tracking-widest mt-1">{label}</p>
        </div>
    );
}

export default function WhyChooseUs() {
    const statsRef = useRef(null);
    const inView = useInView(statsRef, { once: true, margin: "-100px" });

    return (
        <section id="why-us" className="relative py-24 sm:py-32 overflow-hidden">
            {/* background */}
            <div className="absolute inset-0 bg-gradient-to-b from-mm-black via-mm-card/60 to-mm-black pointer-events-none" />
            <div className="pointer-events-none absolute bottom-0 right-0
                      w-[500px] h-[400px] bg-mm-gold/[0.06] rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">

                {/* section header */}
                <div className="max-w-xl mb-16">
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-3"
                    >
                        — Why Us —
                    </motion.p>

                    <motion.h2
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="font-display text-5xl sm:text-6xl lg:text-7xl text-mm-cream leading-none mb-4"
                    >
                        THE MAGIC<br />
                        <span
                            style={{
                                background: "linear-gradient(100deg,#E8284B,#FF6B6B)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            FORMULA
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="font-body text-mm-muted text-base leading-relaxed"
                    >
                        We're not just another fast-food stall. Here's what makes us the go-to
                        spot for thousands of hungry Delhiites every month.
                    </motion.p>
                </div>

                {/* feature cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
                    {FEATURES.map(({ icon: Icon, title, desc, color, border, glow }, i) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 36 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -5 }}
                            className={`group relative p-6 rounded-2xl bg-mm-card border border-mm-border
                          ${border} ${glow} transition-all duration-350 cursor-default`}
                        >
                            {/* icon bubble */}
                            <div className={`w-12 h-12 rounded-xl bg-mm-card2 border border-mm-border
                              flex items-center justify-center mb-5 ${color}
                              group-hover:scale-110 transition-transform duration-300`}>
                                <Icon size={22} />
                            </div>

                            <h3 className="font-display text-2xl text-mm-cream mb-2 tracking-wide">{title}</h3>
                            <p className="font-body text-sm text-mm-muted leading-relaxed">{desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* stats bar */}
                <motion.div
                    ref={statsRef}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-3xl bg-mm-card border border-mm-border overflow-hidden"
                >
                    {/* decorative stripe */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-mm-red via-mm-gold to-mm-red" />

                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-mm-border py-10">
                        {STATS.map((stat) => (
                            <CounterCell
                                key={stat.label}
                                {...stat}
                                started={inView}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}