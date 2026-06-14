import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const REVIEWS = [
    {
        id: 1,
        name: "Priya Sharma",
        location: "Lajpat Nagar, Delhi",
        avatar: "🧕",
        rating: 5,
        text: "I've been coming here every week for the last two years. The steam momos are absolutely divine — the chutney alone is worth the trip. Honestly, the best in all of South Delhi!",
        item: "Steam Momos",
        color: "#E8284B",
    },
    {
        id: 2,
        name: "Rahul Verma",
        location: "Hauz Khas, Delhi",
        avatar: "👨‍💼",
        rating: 5,
        text: "Chilli Potato here is NEXT LEVEL. The Indo-Chinese balance, the texture, the spice — perfect. My friends and I order every Friday night without fail. Magic Momos is our ritual now.",
        item: "Chilli Potato",
        color: "#F5A623",
    },
    {
        id: 3,
        name: "Anjali Kapoor",
        location: "Saket, Delhi",
        avatar: "👩‍🎓",
        rating: 5,
        text: "As a picky vegetarian, I was blown away. The paneer roll is flaky and flavourful — nothing like what you find at regular stalls. Delivery is always on time and food arrives hot. 10/10!",
        item: "Paneer Roll",
        color: "#4CAF50",
    },
    {
        id: 4,
        name: "Arjun Mehta",
        location: "Malviya Nagar, Delhi",
        avatar: "🧑‍🍳",
        rating: 5,
        text: "I'm a chef and I rarely compliment street food, but Magic Momos deserves every star. The seasoning is perfect, the quality is consistent, and they genuinely care about the food they make.",
        item: "Fried Momos",
        color: "#60A5FA",
    },
];

const SLIDE_DURATION = 5000;

function StarRow({ rating, color }) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={14}
                    fill={i < rating ? color : "transparent"}
                    stroke={i < rating ? color : "#7A6C6F"}
                    strokeWidth={1.5}
                />
            ))}
        </div>
    );
}

export default function Testimonials() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);

    const total = REVIEWS.length;

    const go = (dir) => {
        setDirection(dir);
        setCurrent((c) => (c + dir + total) % total);
    };

    useEffect(() => {
        const t = setInterval(() => go(1), SLIDE_DURATION);
        return () => clearInterval(t);
    }, [current]);

    const review = REVIEWS[current];

    const variants = {
        enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
        center: { opacity: 1, x: 0 },
        exit: (d) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
    };

    return (
        <section id="reviews" className="relative py-24 sm:py-32 overflow-hidden">
            {/* bg */}
            <div className="absolute inset-0 bg-gradient-to-b from-mm-black via-mm-card/50 to-mm-black pointer-events-none" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[700px] h-[400px] bg-mm-red/[0.05] rounded-full blur-[120px]" />

            <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8">

                {/* header */}
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45 }}
                        className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-3"
                    >
                        — Real Stories —
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="font-display text-5xl sm:text-6xl lg:text-7xl text-mm-cream"
                    >
                        THE CROWD SPEAKS
                    </motion.h2>
                </div>

                {/* carousel */}
                <div className="relative">
                    {/* giant quote mark */}
                    <Quote
                        size={80}
                        className="absolute -top-6 -left-2 sm:-left-6 text-mm-red/[0.12] rotate-180"
                        strokeWidth={1}
                    />

                    {/* card */}
                    <div className="relative min-h-[280px] sm:min-h-[260px] overflow-hidden">
                        <AnimatePresence custom={direction} mode="wait">
                            <motion.div
                                key={review.id}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0 flex flex-col gap-6"
                            >
                                {/* rating + item tag */}
                                <div className="flex items-center gap-4">
                                    <StarRow rating={review.rating} color={review.color} />
                                    <span
                                        className="text-[11px] font-body font-700 px-2.5 py-0.5 rounded-full"
                                        style={{ background: review.color + "20", color: review.color }}
                                    >
                                        Tried: {review.item}
                                    </span>
                                </div>

                                {/* review text */}
                                <p className="font-body text-lg sm:text-xl text-mm-cream/85 leading-relaxed max-w-3xl">
                                    &ldquo;{review.text}&rdquo;
                                </p>

                                {/* reviewer */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl
                               border border-mm-border"
                                        style={{ background: review.color + "18" }}
                                    >
                                        {review.avatar}
                                    </div>
                                    <div>
                                        <p className="font-body font-700 text-mm-cream text-sm">{review.name}</p>
                                        <p className="font-body text-mm-muted text-xs">{review.location}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* controls */}
                    <div className="flex items-center justify-between mt-10">
                        {/* dots */}
                        <div className="flex items-center gap-2">
                            {REVIEWS.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                                    className="transition-all duration-300"
                                >
                                    <div
                                        className={`rounded-full transition-all duration-300 ${i === current
                                                ? "w-8 h-2 bg-mm-red"
                                                : "w-2 h-2 bg-mm-muted hover:bg-mm-cream/50"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* prev / next */}
                        <div className="flex items-center gap-2">
                            <motion.button
                                onClick={() => go(-1)}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                className="w-10 h-10 rounded-full border border-mm-border bg-mm-card
                           hover:border-mm-red/50 hover:text-mm-red flex items-center justify-center
                           text-mm-cream/60 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </motion.button>
                            <motion.button
                                onClick={() => go(1)}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                className="w-10 h-10 rounded-full border border-mm-border bg-mm-card
                           hover:border-mm-red/50 hover:text-mm-red flex items-center justify-center
                           text-mm-cream/60 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* small avatar row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center justify-center gap-3 mt-14 flex-wrap"
                >
                    <div className="flex -space-x-3">
                        {["👩", "👨", "🧕", "👦", "👧"].map((av, i) => (
                            <div
                                key={i}
                                className="w-9 h-9 rounded-full bg-mm-card border-2 border-mm-black
                           flex items-center justify-center text-base"
                            >
                                {av}
                            </div>
                        ))}
                    </div>
                    <p className="font-body text-mm-muted text-sm">
                        Trusted by <span className="text-mm-cream font-700">500+ customers</span> in Delhi
                    </p>
                </motion.div>
            </div>
        </section>
    );
}