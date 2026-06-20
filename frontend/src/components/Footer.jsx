import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Instagram, Facebook, Twitter, ArrowUp } from "lucide-react";
import { useNav } from "../context/NavigationContext";

const QUICK_LINKS = [
  { label: "Home",        href: "home"       },
  { label: "Menu",        href: "menu"        },
  { label: "Why Us",      href: "why-us"      },
  { label: "Bestsellers", href: "bestsellers" },
  { label: "Reviews",     href: "reviews"     },
  { label: "Contact",     href: "contact"     },
];

const HOURS = [
  { day: "Mon – Fri",   time: "06:00 PM – 12:00 PM" },
  { day: "Saturday",    time: "05:00 PM – 12:00 PM" },
  { day: "Sunday",      time: "05:00 PM – 12:00 PM" },
];

const SOCIALS = [
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-400"   },
  { icon: Facebook,  href: "#", label: "Facebook",  color: "hover:text-blue-400"   },
  { icon: Twitter,   href: "#", label: "Twitter",   color: "hover:text-sky-400"    },
];

const DIVIDER = (
  <div className="w-full h-px bg-gradient-to-r from-transparent via-mm-border to-transparent my-12" />
);

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const { navigate } = useNav();

  return (
    <footer className="relative bg-mm-black border-t border-mm-border overflow-hidden">
      {/* top glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2
                      w-[600px] h-[200px] bg-mm-red/[0.06] rounded-full blur-[80px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-8">

        {/* ── main grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* brand column */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <a href="#home" className="flex items-center gap-2.5 select-none w-fit">
              <motion.span
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-3xl"
              >
                🥟
              </motion.span>
              <div className="leading-none">
                <span className="block font-brand text-[1.4rem] text-mm-gold leading-tight">Magic</span>
                <span className="block font-display text-[1.05rem] tracking-[0.2em] text-mm-cream leading-tight">MOMOS</span>
              </div>
            </a>

            <p className="font-body text-sm text-mm-muted leading-relaxed max-w-[220px]">
              Delhi's favourite street food spot — serving steaming magic since 2024.
            </p>

            {/* socials */}
            <div className="flex items-center gap-3 mt-1">
              {SOCIALS.map(({ icon: Icon, href, label, color }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-9 h-9 rounded-full bg-mm-card border border-mm-border
                             flex items-center justify-center text-mm-muted ${color} transition-colors`}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* quick links */}
          <div>
            <h4 className="font-display text-lg text-mm-cream tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    onClick={() => navigate(href)}
                    className="font-body text-sm text-mm-muted hover:text-mm-gold
                               transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-mm-gold transition-all duration-200" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* hours */}
          <div>
            <h4 className="font-display text-lg text-mm-cream tracking-wider mb-5">
              Opening Hours
            </h4>
            <ul className="flex flex-col gap-3">
              {HOURS.map(({ day, time }) => (
                <li key={day} className="flex items-start gap-2">
                  <Clock size={13} className="text-mm-gold mt-1 shrink-0" />
                  <div>
                    <p className="font-body text-xs text-mm-muted uppercase tracking-wider">{day}</p>
                    <p className="font-body text-sm text-mm-cream/80">{time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className="font-display text-lg text-mm-cream tracking-wider mb-5">
              Find Us
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-mm-red mt-0.5 shrink-0" />
                <p className="font-body text-sm text-mm-muted leading-relaxed">
                  Magic Momos, Gyan Mandir Chowk<br />
                  Ekta Vihar, New Delhi – 110044
                </p>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-mm-red shrink-0" />
                <a
                  href="tel:+917042289004"
                  className="font-body text-sm text-mm-muted hover:text-mm-gold transition-colors"
                >
                  +91 70422 89004
                </a>
              </li>
            </ul>

            {/* newsletter stub */}
            <div className="mt-6 p-4 rounded-2xl bg-mm-card border border-mm-border">
              <p className="font-body text-xs text-mm-muted mb-3 font-600 uppercase tracking-wider">
                Get deals & updates
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-mm-black border border-mm-border rounded-full
                             px-3 py-1.5 text-xs font-body text-mm-cream placeholder:text-mm-muted
                             focus:outline-none focus:border-mm-red/50 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="bg-mm-red text-white text-xs px-4 py-1.5 rounded-full font-body font-700
                             hover:bg-red-600 transition-colors shrink-0"
                >
                  Join
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {DIVIDER}

        {/* ── bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-mm-muted text-center sm:text-left">
            © {new Date().getFullYear()} Magic Momos. All rights reserved.
            <span className="mx-2 text-mm-border">|</span>
            Made with ❤️ in Delhi
          </p>

          <motion.button
            onClick={scrollTop}
            whileHover={{ scale: 1.1, y: -2, boxShadow: "0 0 18px rgba(232,40,75,0.4)" }}
            whileTap={{ scale: 0.92 }}
            className="w-9 h-9 rounded-full bg-mm-red flex items-center justify-center
                       text-white shrink-0 shadow-glow-red"
          >
            <ArrowUp size={16} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}