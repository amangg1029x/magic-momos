import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Flame, Leaf } from "lucide-react";
import { useNav } from "../context/NavigationContext";
import api from "../services/api";





function MenuCard({ item, index }) {
    const [hovered, setHovered] = useState(false);
    const { navigate } = useNav();

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            className="relative group"
        >
            <motion.div
                onClick={() => navigate("menu")}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative group rounded-3xl bg-mm-card border border-mm-border
                           overflow-hidden p-7 flex flex-col gap-5 cursor-pointer shadow-card
                           hover:border-mm-red/30 transition-all duration-350"
            >
                <div
                    className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
                    style={{ background: item.gradient }}
                />

                {/* background glow on hover */}
                <motion.div
                    animate={{ opacity: hovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-mm-red/10 to-transparent pointer-events-none rounded-2xl"
                />

                {/* tag */}
                <div className="flex items-center justify-between">
                    <span className={`${item.tagColor} text-[11px] font-body font-700 px-2.5 py-0.5 rounded-full`}>
                        {item.tag}
                    </span>
                    <div className="flex items-center gap-1.5">
                        {item.spicy && <Flame size={14} className="text-orange-400" />}
                        {item.veg && <Leaf size={14} className="text-green-400" />}
                    </div>
                </div>

                {/* emoji */}
                <motion.div
                    animate={{ scale: hovered ? 1.15 : 1, rotate: hovered ? 8 : 0 }}
                    transition={{ duration: 0.35, ease: "backOut" }}
                    className="text-[4rem] leading-none w-fit"
                >
                    {item.emoji}
                </motion.div>

                {/* text */}
                <div className="flex-1">
                    <h3 className="font-display text-2xl text-mm-cream mb-1 tracking-wide">{item.name}</h3>
                    <p className="font-body text-sm text-mm-muted leading-relaxed">{item.desc}</p>
                </div>

                {/* footer */}
                <div className="flex items-center justify-between pt-3 border-t border-mm-border">
                    <span className="font-display text-xl text-mm-gold">{item.price}</span>

                    <motion.button
                        onClick={(e) => { e.stopPropagation(); navigate("menu"); }}
                        whileHover={{ scale: 1.1, boxShadow: "0 0 18px rgba(232,40,75,0.5)" }}
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center gap-1.5 bg-mm-red/90 hover:bg-mm-red
                       text-white text-xs font-body font-700 px-4 py-2 rounded-full
                       transition-colors duration-200"
                    >
                        <ShoppingCart size={13} />
                        Add
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function MenuHighlights() {
    const { navigate } = useNav();

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

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



    // Define color and gradient mappings based on category
    const TAG_COLOR_MAP = {
        momos: "text-red-600",
        rolls: "text-purple-600",
        snacks: "text-green-600",
        sides: "text-pink-600",
        drinks: "text-blue-600",
    };
    const GRADIENT_MAP = {
        momos: "bg-gradient-to-br from-red-500 to-pink-500",
        rolls: "bg-gradient-to-br from-purple-500 to-indigo-500",
        snacks: "bg-gradient-to-br from-green-500 to-yellow-500",
        sides: "bg-gradient-to-br from-pink-500 to-purple-500",
        drinks: "bg-gradient-to-br from-blue-500 to-teal-500",
    };

    // Use popular flag as a placeholder for highlights
    const highlightsRaw = menuItems.filter(item => item.popular);

    const HIGHLIGHTS = highlightsRaw.map(item => ({
        id: item.itemId,
        tag: item.category,
        tagColor: TAG_COLOR_MAP[item.category] || "text-mm-muted",
        gradient: GRADIENT_MAP[item.category] || "",
        price: `₹${item.price}`,
        name: item.name,
        desc: item.desc,
        emoji: item.emoji,
    }));
    if (loading) {
        return (
            <section id="menu" className="relative py-24 sm:py-32 bg-mm-black overflow-hidden">
                <div className="max-w-7xl mx-auto px-5 sm:px-8">
                    <p className="text-center text-mm-cream">Loading highlights...</p>
                </div>
            </section>
        );
    }

    return (
        <section id="menu" className="relative py-24 sm:py-32 bg-mm-black overflow-hidden">
            {/* ambient glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2
                      w-[600px] h-[300px] bg-mm-red/[0.07] rounded-full blur-[90px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
                {/* section header */}
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-3"
                    >
                        — Our Specialties —
                    </motion.p>

                    <motion.h2
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="font-display text-5xl sm:text-6xl lg:text-7xl text-mm-cream mb-4"
                    >
                        WHAT'S COOKING
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="font-body text-mm-muted text-base max-w-md mx-auto leading-relaxed"
                    >
                        Every item on our menu is made fresh, daily, with hand-picked ingredients
                        and a whole lot of passion.
                    </motion.p>
                </div>

                {/* grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {HIGHLIGHTS.map((item, i) => (
                        <MenuCard key={item.id} item={item} index={i} />
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center mt-14"
                >
                    <motion.button
                        onClick={() => navigate("menu")}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(232,40,75,0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 border border-mm-red/50 text-mm-red
                       hover:bg-mm-red hover:text-white px-10 py-4 rounded-full
                       font-body font-700 text-sm tracking-wide transition-all duration-300"
                    >
                        View Full Menu &nbsp;→
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}