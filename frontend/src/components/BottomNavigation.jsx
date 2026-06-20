import { motion } from "framer-motion";
import { UtensilsCrossed, Phone, User } from "lucide-react";
import { useNav } from "../context/NavigationContext";

export default function BottomNavigation() {
  const { page, navigate, isNative } = useNav();

  if (!isNative) return null;

  // Hide on admin and delivery pages
  if (page === "admin" || page === "delivery") return null;

  const tabs = [
    { label: "Menu",       page: "menu",    icon: UtensilsCrossed },
    { label: "Contact Us", page: "contact", icon: Phone           },
    { label: "Account",    page: "account", icon: User            },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-mm-border px-6 pb-6 pt-3 md:hidden">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = page === tab.page;
          const Icon = tab.icon;

          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.page)}
              className="flex flex-col items-center gap-1 group relative"
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                isActive ? "bg-mm-red text-white shadow-glow-red" : "text-mm-muted group-hover:text-mm-red"
              }`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-700 uppercase tracking-wider transition-colors duration-300 ${
                isActive ? "text-mm-red" : "text-mm-muted"
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-mm-red"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
