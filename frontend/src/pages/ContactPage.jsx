import { motion } from "framer-motion";
import { FileText, Shield, RefreshCw, XCircle, ChevronRight } from "lucide-react";
import Header          from "../components/Header";
import Footer          from "../components/Footer";
import ContactPageHero from "../components/ContactPageHero";
import ContactForm     from "../components/ContactForm";
import FAQAccordion    from "../components/FAQAccordion";
import MapAndHours     from "../components/MapAndHours";
import { useNav }      from "../context/NavigationContext";

const POLICIES = [
  {
    id:     "terms",
    icon:   FileText,
    title:  "Terms & Conditions",
    desc:   "Rules governing the use of our platform and services.",
    accent: "#E8284B",
    bg:     "from-red-500/10 to-red-600/5",
    border: "border-red-500/20",
  },
  {
    id:     "privacy",
    icon:   Shield,
    title:  "Privacy Policy",
    desc:   "How we collect, use, and protect your personal data.",
    accent: "#7C3AED",
    bg:     "from-violet-500/10 to-violet-600/5",
    border: "border-violet-500/20",
  },
  {
    id:     "refund",
    icon:   RefreshCw,
    title:  "Refund Policy",
    desc:   "When and how we process refunds for your orders.",
    accent: "#059669",
    bg:     "from-emerald-500/10 to-emerald-600/5",
    border: "border-emerald-500/20",
  },
  {
    id:     "cancellation",
    icon:   XCircle,
    title:  "Cancellation Policy",
    desc:   "Rules for cancelling orders and what happens next.",
    accent: "#F5A623",
    bg:     "from-amber-500/10 to-amber-600/5",
    border: "border-amber-500/20",
  },
];

export default function ContactPage() {
  const { isNative, navigate } = useNav();

  return (
    <div className="relative min-h-screen bg-mm-black overflow-x-hidden">
      <Header />

      <main>
        {/* Banner + quick-info cards */}
        <ContactPageHero />

        {/* Contact form + why reach out */}
        <ContactForm />

        {/* Map + opening hours */}
        <MapAndHours />

        {/* FAQ accordion */}
        <FAQAccordion />

        {/* ── Legal & Policies ──────────────────────────────────────────────── */}
        <section className="py-20 sm:py-24 bg-mm-black border-t border-mm-border">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">

            {/* heading */}
            <div className="text-center mb-12">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-semibold mb-3"
              >
                — Transparency First —
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.07 }}
                className="font-display text-4xl sm:text-5xl text-mm-cream"
              >
                Legal &amp; Policies
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.14 }}
                className="font-body text-mm-muted text-sm mt-3 max-w-sm mx-auto"
              >
                Read our policies to understand your rights and how we operate.
              </motion.p>
            </div>

            {/* policy cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {POLICIES.map(({ id, icon: Icon, title, desc, accent, bg, border }, i) => (
                <motion.button
                  key={id}
                  onClick={() => navigate(id)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group relative w-full text-left bg-gradient-to-br ${bg} border ${border}
                              rounded-2xl p-6 transition-all duration-300 overflow-hidden
                              hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}
                >
                  {/* glow blob on hover */}
                  <div
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-0
                                group-hover:opacity-30 transition-opacity duration-500"
                    style={{ background: accent }}
                  />

                  {/* icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4
                                transition-transform duration-300 group-hover:scale-110"
                    style={{ background: accent + "22" }}
                  >
                    <Icon size={20} style={{ color: accent }} />
                  </div>

                  {/* text */}
                  <p className="font-body font-semibold text-sm text-mm-cream mb-1.5">{title}</p>
                  <p className="font-body text-xs text-mm-muted leading-relaxed">{desc}</p>

                  {/* read more arrow */}
                  <div className="mt-4 flex items-center gap-1" style={{ color: accent }}>
                    <span className="font-body text-xs font-semibold">Read more</span>
                    <ChevronRight
                      size={13}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {!isNative && <Footer />}
    </div>
  );
}