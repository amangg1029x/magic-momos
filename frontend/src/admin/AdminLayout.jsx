import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed,
  Settings, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { useNav } from "../context/NavigationContext";
import api from "../services/api";

const NAV_ITEMS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "orders",    icon: ShoppingBag,     label: "Orders"    },
  { id: "menu",      icon: UtensilsCrossed, label: "Menu Items"},
  { id: "settings",  icon: Settings,        label: "Settings"  },
];

export default function AdminLayout({ children, subPage, onNavigate }) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const { navigate } = useNav();

  const handleNav = (id) => { onNavigate(id); setMobileOpen(false); };
  const showLabel  = desktopOpen || mobileOpen;

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── mobile backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mob-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      {/*
          Mobile  : always w-64, slide in/out with translate
          Desktop : fixed, width toggles between 256px and 72px
      */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col
          bg-[#1a0d00] text-white shadow-2xl transition-all duration-300
          w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${!desktopOpen ? "md:w-[72px]" : "md:w-64"}
        `}
      >
        {/* logo row */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 min-h-[73px]">
          <AnimatePresence initial={false}>
            {showLabel && (
              <motion.div
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5"
              >
                <span className="text-2xl">🥟</span>
                <div className="leading-none">
                  <p className="font-brand text-[#F5A623] text-lg leading-tight">Magic</p>
                  <p className="font-display text-[0.7rem] tracking-[0.25em] text-white/60 leading-tight">ADMIN</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* desktop collapse toggle */}
          <button
            onClick={() => setDesktopOpen((v) => !v)}
            className="hidden md:flex w-9 h-9 rounded-xl hover:bg-white/10 items-center justify-center
                       text-white/70 hover:text-white transition-colors shrink-0 ml-auto"
          >
            {desktopOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center
                       text-white/70 hover:text-white transition-colors shrink-0 ml-auto"
          >
            <X size={18} />
          </button>
        </div>

        {/* nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const active = subPage === id;
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                title={!showLabel ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-body font-600 text-sm
                            transition-all duration-200
                            ${active
                              ? "bg-[#E8284B] text-white shadow-[0_4px_14px_rgba(232,40,75,0.4)]"
                              : "text-white/65 hover:bg-white/10 hover:text-white"
                            }`}
              >
                <Icon size={18} className="shrink-0" />
                <AnimatePresence initial={false}>
                  {showLabel && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 text-left"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {showLabel && active && <ChevronRight size={13} className="ml-auto opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => { api.admin.logout(); navigate("home"); }}
            title={!showLabel ? "Exit Admin" : undefined}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/60
                       hover:bg-white/10 hover:text-white font-body text-sm transition-colors"
          >
            <LogOut size={17} className="shrink-0" />
            <AnimatePresence initial={false}>
              {showLabel && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  Exit Admin
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className={`
        flex-1 min-h-screen flex flex-col transition-all duration-300
        ml-0
        ${desktopOpen ? "md:ml-64" : "md:ml-[72px]"}
      `}>

        {/* topbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors shrink-0"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="font-display text-lg sm:text-xl md:text-2xl text-gray-900 tracking-wide truncate">
                  {NAV_ITEMS.find((n) => n.id === subPage)?.label?.toUpperCase() ?? "ADMIN"}
                </h1>
                <p className="font-body text-xs text-gray-400 mt-0.5 hidden sm:block">
                  Magic Momos Restaurant Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-body text-xs text-green-700 font-600">Online</span>
              </div>
              <button
                onClick={() => navigate("home")}
                className="font-body text-xs text-gray-500 hover:text-red-600
                           underline underline-offset-2 transition-colors whitespace-nowrap"
              >
                ← Website
              </button>
            </div>
          </div>
        </header>

        {/* page content */}
        <main className="flex-1 p-3 sm:p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}