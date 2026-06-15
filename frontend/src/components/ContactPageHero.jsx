import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, ChevronRight } from "lucide-react";
import { useNav } from "../context/NavigationContext";

const INFO_CARDS = [
  {
    icon:   Phone,
    title:  "Call Us",
    line1:  "+91 98765 43210",
    line2:  "Mon – Sun, 10 AM – 11 PM",
    accent: "#E8284B",
    bg:     "bg-red-50",
    border: "border-red-100",
  },
  {
    icon:   Mail,
    title:  "Email Us",
    line1:  "hello@magicmomos.in",
    line2:  "Reply within 4 hours",
    accent: "#7C3AED",
    bg:     "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon:   MapPin,
    title:  "Find Us",
    line1:  "42 Food Street, Lajpat Nagar",
    line2:  "New Delhi – 110024",
    accent: "#059669",
    bg:     "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon:   Clock,
    title:  "Hours",
    line1:  "Open Daily",
    line2:  "10:00 AM – 11:00 PM",
    accent: "#F5A623",
    bg:     "bg-amber-50",
    border: "border-amber-100",
  },
];

export default function ContactPageHero() {
  const { navigate } = useNav();

  return (
    <section className="relative overflow-hidden bg-mm-card2 border-b border-mm-border">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(232,40,75,0.10) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)" }} />
        {/* dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
          <defs>
            <pattern id="contact-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.4" cy="1.4" r="1.4" fill="#2A1E1B" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contact-dots)" />
        </svg>
        {/* watermark */}
        <span className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2
                         font-display text-[10rem] sm:text-[14rem] text-mm-cream/[0.04]
                         select-none pointer-events-none leading-none">
          HELLO
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-32 pb-14">
        {/* breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-1.5 text-xs font-body text-mm-muted mb-6"
        >
          <button onClick={() => navigate("home")}
            className="hover:text-mm-red transition-colors font-600">
            Home
          </button>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-mm-cream font-600">Contact</span>
        </motion.nav>

        {/* heading */}
        <div className="grid lg:grid-cols-2 gap-8 items-end mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-4"
            >
              — Say Hello —
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-display leading-none text-mm-cream"
            >
              <span className="block text-[3.8rem] sm:text-[5.5rem] lg:text-[6rem] tracking-tight">
                GET IN
              </span>
              <span
                className="block text-[3.8rem] sm:text-[5.5rem] lg:text-[6rem] tracking-tight"
                style={{
                  background: "linear-gradient(110deg,#E8284B 0%,#F5A623 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                TOUCH
              </span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="pb-2"
          >
            <p className="font-body text-mm-muted text-base sm:text-lg leading-relaxed mb-5 max-w-md">
              Have a question, a bulk order request, or just want to tell us your favourite
              momo? We'd genuinely love to hear from you.
            </p>
            <div className="flex items-center gap-3">
              <motion.a
                href="tel:+919876543210"
                whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(232,40,75,0.25)" }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 bg-mm-red text-white
                           px-6 py-3 rounded-full font-body font-700 text-sm
                           hover:bg-red-600 transition-colors"
              >
                <Phone size={14} /> Call Now
              </motion.a>
              <motion.a
                href="mailto:hello@magicmomos.in"
                whileHover={{ scale: 1.04 }}
                className="inline-flex items-center gap-2 border border-mm-border text-mm-cream
                           px-6 py-3 rounded-full font-body font-700 text-sm
                           hover:border-mm-red/40 hover:text-mm-red transition-all"
              >
                <Mail size={14} /> Email Us
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* quick-info cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {INFO_CARDS.map(({ icon: Icon, title, line1, line2, accent, bg, border }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className={`group ${bg} border ${border} rounded-2xl p-5 transition-all duration-300
                          hover:shadow-[0_8px_30px_rgba(42,30,27,0.10)]`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm
                           group-hover:scale-110 transition-transform duration-300"
                style={{ background: accent + "20" }}
              >
                <Icon size={18} style={{ color: accent }} />
              </div>
              <p className="font-body text-[11px] text-mm-muted uppercase tracking-wider mb-1">{title}</p>
              <p className="font-body font-700 text-mm-cream text-sm leading-tight">{line1}</p>
              <p className="font-body text-mm-muted text-xs mt-0.5">{line2}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}