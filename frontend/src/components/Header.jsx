import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ShoppingBag, User, LogOut, ChevronDown } from "lucide-react";
import { useNav } from "../context/NavigationContext";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { label: "Home",        page: "home",    section: "home"        },
  { label: "Menu",        page: "menu"                            },
  { label: "About",       page: "about"                           },
  { label: "Contact Us",  page: "contact"                         },
  { label: "Why Us",      page: "home",    section: "why-us"      },
  { label: "Bestsellers", page: "home",    section: "bestsellers"  },
];

export default function Header({ cartCount = 0, onCartOpen }) {
  const { page, navigate }       = useNav();
  const { user, isAuthenticated, logout } = useAuth();

  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (page !== "home") return;
    const sectionIds = ["home", "why-us", "bestsellers", "reviews"];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [page]);

  const handleNavClick = (link) => {
    setMobileOpen(false);
    if (link.page === "home" && link.section) {
      if (page === "home") {
        document.getElementById(link.section)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("home", null, { noScroll: true });
        setTimeout(() => document.getElementById(link.section)?.scrollIntoView({ behavior: "smooth" }), 150);
      }
    } else if (link.page) {
      navigate(link.page);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("home");
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass shadow-[0_4px_40px_rgba(42,30,27,0.06)]" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-6">

          {/* logo */}
          <motion.button
            onClick={() => navigate("home")}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 select-none"
          >
            <motion.span
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl leading-none"
            >🥟</motion.span>
            <div className="leading-none">
              <span className="block font-brand text-[1.4rem] text-mm-gold leading-tight">Magic</span>
              <span className="block font-display text-[1.05rem] tracking-[0.2em] text-mm-cream leading-tight">MOMOS</span>
            </div>
          </motion.button>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href, page: linkPage, section }) => {
              const isActive = page === "home"
                ? section === activeSection
                : linkPage === page;
              return (
                <a key={label} href={href}
                  onClick={(e) => { e.preventDefault(); handleNavClick({ label, href, page: linkPage, section }); }}
                  className={`relative group font-body font-600 text-sm tracking-wide
                              transition-colors duration-200 cursor-pointer
                              ${isActive ? "text-mm-red" : "text-mm-cream/75 hover:text-mm-cream"}`}
                >
                  {label}
                  <span className={`absolute -bottom-1 left-0 h-[2px] bg-mm-red rounded-full
                                    transition-all duration-300
                                    ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
                </a>
              );
            })}
          </nav>

          {/* desktop right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+919876543210"
              className="flex items-center gap-1.5 text-mm-cream/50 hover:text-mm-gold text-sm font-body transition-colors">
              <Phone size={14} />
              <span>+91 98765 43210</span>
            </a>

            {/* cart button */}
            {onCartOpen && (
              <motion.button onClick={onCartOpen} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                className="relative flex items-center gap-2 border border-mm-border bg-white
                           text-mm-cream px-4 py-2.5 rounded-full font-body font-700 text-sm
                           hover:border-mm-red/40 transition-all">
                <ShoppingBag size={15} className="text-mm-red" />
                Cart
                {cartCount > 0 && (
                  <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-mm-red text-white
                               text-[10px] font-800 flex items-center justify-center
                               shadow-[0_2px_8px_rgba(232,40,75,0.5)]">
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </motion.button>
            )}

            {/* ── Auth: user menu or login button ── */}
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 border border-mm-border bg-white
                             px-3.5 py-2.5 rounded-full font-body font-700 text-sm
                             text-mm-cream hover:border-mm-red/40 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-mm-red/15 border border-mm-red/30
                                  flex items-center justify-center text-xs text-mm-red font-800 select-none">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="max-w-[80px] truncate">{user?.name?.split(" ")[0]}</span>
                  <ChevronDown size={12} className={`text-mm-muted transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 z-20 w-48
                                   bg-white border border-mm-border rounded-2xl
                                   shadow-[0_12px_40px_rgba(42,30,27,0.12)] overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-mm-border">
                          <p className="font-body text-xs font-700 text-mm-cream truncate">{user?.name}</p>
                          <p className="font-body text-xs text-mm-muted truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate("account"); }}
                          className="w-full flex items-center gap-2.5 px-4 py-3 font-body text-sm
                                     text-mm-muted hover:text-mm-cream hover:bg-mm-card2 transition-colors text-left"
                        >
                          <User size={14} /> My Account
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-3 font-body text-sm
                                     text-red-500 hover:bg-red-50 transition-colors text-left border-t border-mm-border"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={() => navigate("login")}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-2 border border-mm-border text-mm-cream/70
                           hover:text-mm-cream hover:border-mm-red/40
                           px-4 py-2.5 rounded-full font-body font-700 text-sm transition-all"
              >
                <User size={14} /> Sign In
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

          {/* mobile right */}
          <div className="flex items-center gap-3 md:hidden">
            {onCartOpen && (
              <button onClick={onCartOpen} className="relative text-mm-cream p-1">
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-mm-red
                                   text-white text-[9px] font-800 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            )}
            {isAuthenticated && (
              <button onClick={() => navigate("account")} className="p-1">
                <div className="w-8 h-8 rounded-full bg-mm-red/15 border border-mm-red/30
                                flex items-center justify-center text-sm text-mm-red font-800 select-none">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              </button>
            )}
            <button onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu" className="text-mm-cream p-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={mobileOpen ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="block">
                  {mobileOpen ? <X size={26} /> : <Menu size={26} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div key="mobile-menu"
            initial={{ x: "100%", opacity: 0 }} animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col glass pt-24 px-8 pb-10 md:hidden"
          >
            <nav className="flex flex-col gap-5 flex-1">
              {NAV_LINKS.map(({ label, href, page: linkPage, section }, i) => {
                const isActive = page === "home" ? section === activeSection : linkPage === page;
                return (
                  <motion.a key={label} href={href}
                    onClick={(e) => { e.preventDefault(); handleNavClick({ label, href, page: linkPage, section }); }}
                    initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 + 0.1 }}
                    className={`font-display text-4xl transition-colors cursor-pointer
                               ${isActive ? "text-mm-red" : "text-mm-cream/80 hover:text-mm-red"}`}>
                    {label}
                  </motion.a>
                );
              })}

              {isAuthenticated ? (
                <motion.button
                  initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: NAV_LINKS.length * 0.06 + 0.1 }}
                  onClick={() => { setMobileOpen(false); navigate("account"); }}
                  className="font-display text-4xl text-mm-cream/80 hover:text-mm-gold text-left"
                >
                  My Account
                </motion.button>
              ) : (
                <motion.button
                  initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: NAV_LINKS.length * 0.06 + 0.1 }}
                  onClick={() => { setMobileOpen(false); navigate("login"); }}
                  className="font-display text-4xl text-mm-cream/80 hover:text-mm-gold text-left"
                >
                  Sign In
                </motion.button>
              )}
            </nav>

            <div className="flex flex-col gap-3 pt-8 border-t border-mm-border">
              {isAuthenticated ? (
                <>
                  <p className="font-body text-sm text-mm-muted">
                    Signed in as <span className="text-mm-cream font-700">{user?.name}</span>
                  </p>
                  <button onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="w-full flex items-center justify-center gap-2 border border-red-200
                               text-red-500 py-3 rounded-full font-body font-700 text-sm">
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <a href="tel:+919876543210"
                  className="text-mm-cream/50 text-sm font-body flex items-center gap-2">
                  <Phone size={14} /> +91 98765 43210
                </a>
              )}
              <button
                onClick={() => { setMobileOpen(false); navigate("menu"); }}
                className="w-full bg-mm-red text-white py-3.5 rounded-full font-body font-700 text-base">
                Order Now 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}