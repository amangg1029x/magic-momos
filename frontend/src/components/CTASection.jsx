import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { useNav } from "../context/NavigationContext";

export default function CTASection() {
    const { navigate, settings } = useNav();

    const phone      = settings?.phone                 || "+91 70422 89004";
    const openTime   = settings?.openTime              || "06:00 PM";
    const closeTime  = settings?.closeTime             || "12:00 PM";
    const freeAbove  = settings?.freeDeliveryThreshold ?? 199;

    return (
        <section className="relative py-24 sm:py-32 overflow-hidden bg-mm-black">
            {/* ── layered background ── */}
            <div className="pointer-events-none absolute inset-0">
                {/* red glow centre */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[700px] h-[400px] bg-mm-red/[0.18] rounded-full blur-[120px]" />
                {/* gold corner accents */}
                <div className="absolute top-0 left-0 w-[300px] h-[300px]
                        bg-mm-gold/[0.06] rounded-full blur-[90px]" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px]
                        bg-mm-gold/[0.06] rounded-full blur-[90px]" />

                {/* faint radial grid */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
                    <defs>
                        <pattern id="grid-cta" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="48" height="48" fill="none" stroke="#FFF8F0" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-cta)" />
                </svg>

                {/* top/bottom vignette */}
                <div className="absolute top-0 left-0 right-0 h-24
                        bg-gradient-to-b from-mm-black to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-24
                        bg-gradient-to-t from-mm-black to-transparent" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center">

                {/* floating emoji */}
                <motion.div
                    animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-6xl mb-6 select-none"
                >
                    🥟
                </motion.div>

                {/* eyebrow */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                    className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-4"
                >
                    — Ready? Let's Eat —
                </motion.p>

                {/* headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="font-display text-6xl sm:text-7xl lg:text-8xl text-mm-cream leading-none mb-6"
                >
                    HUNGRY YET?
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="font-body text-mm-cream/60 text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-10"
                >
                    Don't let that craving wait. Order your Magic Momos fix right now and
                    have it at your door in under 30 minutes — hot, fresh, magical.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <motion.button
                        onClick={() => navigate("menu")}
                        whileHover={{ scale: 1.07, boxShadow: "0 0 50px rgba(232,40,75,0.7)" }}
                        whileTap={{ scale: 0.93 }}
                        className="group flex items-center gap-3 bg-mm-red text-white
                       px-9 py-4 rounded-full font-body font-800 text-base tracking-wide
                       hover:bg-red-600 transition-all duration-300 shadow-glow-red"
                    >
                        Order Now
                        <span className="text-xl group-hover:animate-wiggle inline-block">🚀</span>
                    </motion.button>

                    <motion.a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2.5 glass border border-mm-border
                       text-mm-cream/75 hover:text-mm-gold hover:border-mm-gold/40
                       px-8 py-4 rounded-full font-body font-700 text-sm
                       transition-all duration-300"
                    >
                        <Phone size={15} />
                        Call to Order
                    </motion.a>
                </motion.div>

                {/* trust strip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-6 mt-12 text-mm-muted"
                >
                    {[
                        `🕐 Open ${openTime} – ${closeTime}`,
                        `🛵 Free delivery on ₹${freeAbove}+`,
                        "❄️ No preservatives",
                        "♻️ Eco packaging",
                    ].map((item) => (
                        <span key={item} className="font-body text-sm">{item}</span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}