import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNav } from "../context/NavigationContext";

export default function PolicyPage({ title, lastUpdated, children }) {
  const { isNative } = useNav();

  return (
    <div className="relative min-h-screen bg-mm-black overflow-x-hidden">
      <Header />

      {/* hero strip */}
      <div className="relative pt-28 pb-14 bg-gradient-to-b from-mm-card to-mm-black border-b border-mm-border overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-mm-red/[0.07] rounded-full blur-[90px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-body text-xs text-mm-red uppercase tracking-[0.18em] mb-3 font-600"
          >
            Legal
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-4xl sm:text-5xl text-mm-cream tracking-tight"
          >
            {title}
          </motion.h1>
          {lastUpdated && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="font-body text-sm text-mm-muted mt-3"
            >
              Last updated: {lastUpdated}
            </motion.p>
          )}
        </div>
      </div>

      {/* body */}
      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="prose-policy"
        >
          {children}
        </motion.div>
      </main>

      {!isNative && <Footer />}
    </div>
  );
}

/* ── Mini components for consistent prose ── */
export function PolicySection({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl text-mm-cream mb-3 tracking-wide border-l-2 border-mm-red pl-4">
        {title}
      </h2>
      <div className="font-body text-sm text-mm-muted leading-relaxed space-y-3 pl-4">
        {children}
      </div>
    </section>
  );
}

export function PolicyList({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
