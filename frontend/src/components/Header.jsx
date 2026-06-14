import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ShoppingBag } from "lucide-react";

const NAV_LINKS = [
  { label: "Home",        href: "#home"       },
  { label: "Menu",        href: "#menu"        },
  { label: "Why Us",      href: "#why-us"      },
  { label: "Bestsellers", href: "#bestsellers" },
  { label: "Reviews",     href: "#reviews"     },
];

export default function Header() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [activeLink,  setActiveLink]  = useState("Home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass shadow-[0_4px_40px_rgba(42,30,27,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-6">

          {/* ── Logo ── */}
          <motion.a
            href="#home"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 select-none"
          >
            <motion.span
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl leading-none"
            >
              🥟
            </motion.span>
            <div className="leading-none">
              <span className="block font-brand text-[1.4rem] text-mm-gold leading-tight">
                Magic
              </span>
              <span className="block font-display text-[1.05rem] tracking-[0.2em] text-mm-cream leading-tight">
                MOMOS
              </span>
            </div>
          </motion.a>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setActiveLink(label)}
                className="relative group font-body font-600 text-sm tracking-wide text-mm-cream/75 hover:text-mm-cream transition-colors duration-200"
              >
                {label}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] bg-mm-gold rounded-full transition-all duration-300 ${
                    activeLink === label ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </a>
            ))}
          </nav>

          {/* ── Desktop CTAs ── */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:+911234567890"
              className="flex items-center gap-1.5 text-mm-cream/50 hover:text-mm-gold text-sm font-body transition-colors"
            >
              <Phone size={14} />
              <span>+91 98765 43210</span>
            </a>

            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 0 28px rgba(232,40,75,0.55)" }}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-2 bg-mm-red text-white px-5 py-2.5 rounded-full
                         font-body font-700 text-sm tracking-wide hover:bg-red-600 transition-colors"
            >
              <ShoppingBag size={15} />
              Order Now
            </motion.button>
          </div>

          {/* ── Hamburger ── */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="md:hidden text-mm-cream p-1"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{    rotate:  90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {mobileOpen ? <X size={26} /> : <Menu size={26} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: "0%",   opacity: 1 }}
            exit={{    x: "100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col glass pt-24 px-8 pb-10 md:hidden"
          >
            <nav className="flex flex-col gap-5 flex-1">
              {NAV_LINKS.map(({ label, href }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  onClick={() => { setMobileOpen(false); setActiveLink(label); }}
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0,  opacity: 1 }}
                  transition={{ delay: i * 0.06 + 0.1 }}
                  className="font-display text-4xl text-mm-cream/80 hover:text-mm-gold transition-colors"
                >
                  {label}
                </motion.a>
              ))}
            </nav>

            <div className="flex flex-col gap-3 pt-8 border-t border-mm-border">
              <a href="tel:+911234567890" className="text-mm-cream/50 text-sm font-body flex items-center gap-2">
                <Phone size={14} /> +91 98765 43210
              </a>
              <button className="w-full bg-mm-red text-white py-3.5 rounded-full font-body font-700 text-base">
                Order Now 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}