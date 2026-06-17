import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed,
  Settings, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { useNav } from "../context/NavigationContext";
import api from "../services/api";

const NAV_ITEMS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard"  },
  { id: "orders",    icon: ShoppingBag,     label: "Orders"     },
  { id: "menu",      icon: UtensilsCrossed, label: "Menu Items" },
  { id: "settings",  icon: Settings,        label: "Settings"   },
];

export default function AdminLayout({ children, subPage, onNavigate }) {
  const [open, setOpen] = useState(true);
  const { navigate }    = useNav();

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── sidebar ── */}
      <aside
        className={`${open ? "w-64" : "w-[72px]"} shrink-0
                    bg-[#1a0d00] text-white fixed h-screen z-50
                    flex flex-col transition-all duration-300 shadow-2xl`}
      >
        {/* logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5"
              >
                <span className="text-2xl">🥟</span>
                <div className="leading-none">
                  <p className="font-brand text-[#F5A623] text-lg leading-tight">Magic</p>
                  <p className="font-display text-[0.7rem] tracking-[0.25em] text-white/60 leading-tight">
                    ADMIN
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center
                       text-white/70 hover:text-white transition-colors shrink-0"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const active = subPage === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                title={!open ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl
                            font-body font-600 text-sm transition-all duration-200
                            ${active
                              ? "bg-[#E8284B] text-white shadow-[0_4px_14px_rgba(232,40,75,0.4)]"
                              : "text-white/65 hover:bg-white/10 hover:text-white"
                            }`}
              >
                <Icon size={18} className="shrink-0" />
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 text-left"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {open && active && <ChevronRight size={13} className="ml-auto opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* exit */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => {
              api.admin.logout();
              navigate("home");
            }}
            title={!open ? "Exit Admin" : undefined}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl
                       text-white/60 hover:bg-white/10 hover:text-white
                       font-body text-sm transition-colors"
          >
            <LogOut size={17} className="shrink-0" />
            <AnimatePresence initial={false}>
              {open && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  Exit Admin
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>

      {/* ── main area ── */}
      <div className={`flex-1 ${open ? "ml-64" : "ml-[72px]"} transition-all duration-300 min-h-screen flex flex-col`}>

        {/* topbar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl text-gray-900 tracking-wide">
                {NAV_ITEMS.find((n) => n.id === subPage)?.label?.toUpperCase() ?? "ADMIN"}
              </h1>
              <p className="font-body text-xs text-gray-400 mt-0.5">
                Magic Momos Restaurant Management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200
                              px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-body text-xs text-green-700 font-600">System Online</span>
              </div>
              <button
                onClick={() => navigate("home")}
                className="font-body text-xs text-gray-500 hover:text-red-600
                           underline underline-offset-2 transition-colors"
              >
                ← View Website
              </button>
            </div>
          </div>
        </header>

        {/* page content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}