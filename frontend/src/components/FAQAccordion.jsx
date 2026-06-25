import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useNav } from "../context/NavigationContext";
import { DELIVERY_RADIUS_KM } from "../data/restaurantConfig";

// FAQS built dynamically inside the component (see below)

function AccordionItem({ item, index, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300
                  ${isOpen ? "border-mm-red/30 shadow-[0_4px_24px_rgba(232,40,75,0.10)]"
          : "border-mm-border hover:border-mm-red/20 shadow-card"}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-body font-700 text-mm-cream text-sm sm:text-base leading-snug pr-2">
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors
                      ${isOpen ? "bg-mm-red text-white" : "bg-mm-card2 text-mm-muted"}`}
        >
          <Plus size={14} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="font-body text-mm-muted text-sm leading-relaxed px-6 pb-5">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQAccordion() {
  const [open, setOpen] = useState(0);
  const { settings } = useNav();

  const phone      = settings?.phone                 || "+91 70422 89004";
  const email      = settings?.email                 || "magicmomos12@gmail.com";
  const fee        = settings?.deliveryFee           ?? 30;
  const freeAbove  = settings?.freeDeliveryThreshold ?? 199;
  const radius     = DELIVERY_RADIUS_KM;

  const FAQS = [
    {
      q: "Do you offer home delivery?",
      a: `Yes! We deliver to all areas within ${radius} km of our location. Delivery is free on orders above ₹${freeAbove}. Orders below that carry a ₹${fee} delivery charge. Average delivery time is 20–30 minutes.`,
    },
    {
      q: "Can I place a bulk/catering order?",
      a: "Absolutely. We love catering to offices, college events, birthday parties, and corporate dos. For orders above 50 plates, please call us or email at least 24 hours in advance and we'll arrange special pricing and packaging.",
    },
    {
      q: "How fresh are your ingredients?",
      a: "Every ingredient is sourced fresh each morning from our local vegetable market. We use zero frozen ingredients, zero artificial preservatives, and zero shortcuts. If something runs out, we'd rather say 'sold out' than compromise on freshness.",
    },
    {
      q: "What if I have a complaint about my order?",
      a: `Call us immediately at ${phone}. If there's a genuine issue — wrong order, cold food, or anything else — we'll either re-deliver or issue a full refund. No lengthy processes, just quick solutions. Your satisfaction is our priority.`,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-mm-card overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        {/* heading */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-3"
          >
            — Quick Answers —
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-display text-5xl sm:text-6xl text-mm-cream tracking-tight"
          >
            FAQ
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-body text-mm-muted text-sm mt-3 max-w-sm mx-auto"
          >
            Most questions answered here. Can't find yours?{" "}
            <a href={`mailto:${email}`} className="text-mm-red hover:underline">
              Email us.
            </a>
          </motion.p>
        </div>

        {/* items */}
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              item={item}
              index={i}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}