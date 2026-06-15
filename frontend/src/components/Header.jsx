import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ShoppingBag } from "lucide-react";
import { useNav } from "../context/NavigationContext";

const NAV_LINKS = [
  { label: "Home", page: "home", section: "home" },
  { label: "Menu", page: "menu" },
  { label: "About", page: "about"},
  { label: "Contact Us", page: "contact"},
  { label: "Why Us", page: "home", section: "why-us" },
  { label: "Bestsellers", page: "home", section: "bestsellers" },
  { label: "Reviews", page: "home", section: "reviews" },
];

/**
 * Header
 * Optional props (used by MenuPage):
 *   cartCount   – number of items in cart
 *   onCartOpen  – () => void   opens the CartSidebar
 */
export default function Header({ cartCount = 0, onCartOpen }) {
  const { page, navigate } = useNav();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (page !== "home") return;

    const sectionIds = ["home", "why-us", "bestsellers", "reviews"];
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          if (id) {
            setActiveSection(id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0,
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [page]);

  const handleNavClick = (link) => {
    setMobileOpen(false);
    if (link.page === "home" && link.section) {
      if (page === "home") {
        const el = document.getElementById(link.section);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate("home", { noScroll: true });
        setTimeout(() => {
          const el = document.getElementById(link.section);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      }
    } else if (link.page) {
      navigate(link.page);
    }
  };

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
          <motion.button
            onClick={() => navigate("home")}
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
          </motion.button>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href, page: linkPage, section }) => {
              const isActive = page === "home" ? (section === activeSection) : (linkPage === page);
              return (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick({ label, href, page: linkPage, section });
                  }}
                  className={`relative group font-body font-600 text-sm tracking-wide
                              transition-colors duration-200 cursor-pointer
                              ${isActive ? "text-mm-red" : "text-mm-cream/75 hover:text-mm-cream"}`}
                >
                  {label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] bg-mm-red rounded-full
                                transition-all duration-300
                                ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                  />
                </a>
              );
            })}
          </nav>

          {/* ── Desktop CTAs ── */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 text-mm-cream/50 hover:text-mm-gold
                         text-sm font-body transition-colors"
            >
              <Phone size={14} />
              <span>+91 98765 43210</span>
            </a>

            {/* Cart button — shown on menu page */}
            {onCartOpen && (
              <motion.button
                onClick={onCartOpen}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="relative flex items-center gap-2 border border-mm-border
                           bg-white text-mm-cream px-4 py-2.5 rounded-full
                           font-body font-700 text-sm hover:border-mm-red/40 transition-all"
              >
                <ShoppingBag size={15} className="text-mm-red" />
                Cart
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full
                               bg-mm-red text-white text-[10px] font-800
                               flex items-center justify-center shadow-[0_2px_8px_rgba(232,40,75,0.5)]"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </motion.button>
            )}

            <motion.button
              onClick={() => navigate("menu")}
              whileHover={{ scale: 1.06, boxShadow: "0 0 28px rgba(232,40,75,0.35)" }}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-2 bg-mm-red text-white px-5 py-2.5 rounded-full
                         font-body font-700 text-sm tracking-wide hover:bg-red-600 transition-colors"
            >
              <ShoppingBag size={15} />
              Order Now
            </motion.button>
          </div>

          {/* ── Mobile right side ── */}
          <div className="flex items-center gap-3 md:hidden">
            {/* mobile cart icon */}
            {onCartOpen && (
              <button onClick={onCartOpen} className="relative text-mm-cream p-1">
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full
                                   bg-mm-red text-white text-[9px] font-800
                                   flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="text-mm-cream p-1"
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
              {NAV_LINKS.map(({ label, href, page: linkPage, section }, i) => {
                const isActive = page === "home" ? (section === activeSection) : (linkPage === page);
                return (
                  <motion.a
                    key={label}
                    href={href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick({ label, href, page: linkPage, section });
                    }}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0,  opacity: 1 }}
                    transition={{ delay: i * 0.06 + 0.1 }}
                    className={`font-display text-4xl transition-colors cursor-pointer
                               ${isActive ? "text-mm-red" : "text-mm-cream/80 hover:text-mm-red"}`}
                  >
                    {label}
                  </motion.a>
                );
              })}
            </nav>

            <div className="flex flex-col gap-3 pt-8 border-t border-mm-border">
              <a
                href="tel:+919876543210"
                className="text-mm-cream/50 text-sm font-body flex items-center gap-2"
              >
                <Phone size={14} /> +91 98765 43210
              </a>
              <button
                onClick={() => { setMobileOpen(false); navigate("menu"); }}
                className="w-full bg-mm-red text-white py-3.5 rounded-full font-body font-700 text-base"
              >
                Order Now 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}