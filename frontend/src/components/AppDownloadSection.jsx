import { motion } from "framer-motion";
import { Download, CheckCircle, Smartphone, Wifi, Battery } from "lucide-react";

export default function AppDownloadSection() {
  const features = [
    "Real-time live order tracking directly on your phone",
    "App-only exclusive discount codes and rewards",
    "Lightning fast one-tap checkout and saved addresses",
    "Instant notifications for fresh momo batches"
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-mm-card2 border-y border-mm-border">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-mm-red/[0.08] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-mm-gold/[0.06] rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 grid md:grid-cols-12 gap-12 items-center">
        {/* Left Column: Text & Downloads */}
        <div className="md:col-span-7 space-y-8">
          <div className="space-y-4">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-body text-mm-red text-xs tracking-[0.3em] uppercase font-600"
            >
              — Magic on the Go —
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl text-mm-cream leading-none"
            >
              DOWNLOAD THE<br />
              <span className="text-red-gradient">MAGIC MOMOS APP</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-body text-mm-muted text-base sm:text-lg max-w-xl leading-relaxed"
            >
              Craving momos? Experience ordering like never before. Get our official Android app on Google Play and enjoy lightning-fast performance, live tracking, and exclusive discounts.
            </motion.p>
          </div>

          {/* Features check list */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle size={18} className="text-mm-red mt-0.5 shrink-0" />
                <span className="font-body text-sm text-mm-cream/80">{feature}</span>
              </div>
            ))}
          </motion.div>

          {/* Download Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center gap-5"
          >
            <a
              href="https://play.google.com/store/apps/details?id=com.magicmomos.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3.5 bg-mm-red text-white px-7 py-3.5 rounded-2xl font-body font-800 text-sm sm:text-base tracking-wide hover:bg-red-600 transition-all duration-300 shadow-glow-red hover:scale-105"
            >
              <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a2.21 2.21 0 0 1-.22-.962V2.776c0-.361.08-.696.219-.962zm11.238 11.241l2.42 2.42-12.062 6.945 9.642-9.365zm2.42-2.11l2.87 1.65c.98.563.98 1.487 0 2.05l-2.87 1.65-2.695-2.675 2.695-2.675zM5.205 1.58l12.062 6.945-2.42 2.42-9.642-9.365z"/>
              </svg>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] font-600 tracking-wider uppercase opacity-85">GET IT ON</span>
                <span className="text-sm sm:text-base font-800">Google Play</span>
              </div>
            </a>
            
            <div className="flex flex-col text-left">
              <span className="font-body text-xs text-mm-muted font-600 uppercase tracking-wider">Official Release</span>
              <span className="font-body text-sm text-mm-cream font-700">Google Play · Verified & Secure</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Simulated CSS Mobile Phone Mockup */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            whileHover={{ scale: 1.03, rotate: 1 }}
            className="relative w-[280px] h-[550px] bg-[#FFF9E6] border-[10px] border-mm-cream rounded-[42px] shadow-[0_24px_60px_rgba(42,30,27,0.18)] overflow-hidden flex flex-col cursor-pointer select-none"
          >
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-mm-cream rounded-b-2xl z-50 flex items-center justify-center gap-1.5 px-4">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="w-12 h-1 rounded-full bg-zinc-800" />
            </div>

            {/* Status bar */}
            <div className="h-9 px-6 pt-2 flex justify-between items-center text-[10px] font-bold text-mm-cream/60 z-40 bg-[#FFF9E6]">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <Wifi size={10} />
                <Battery size={12} />
              </div>
            </div>

            {/* Mock App Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 bg-[#FFFDF6]">
              {/* App Header */}
              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="block font-brand text-lg text-mm-gold leading-none">Magic</span>
                  <span className="block font-display text-sm tracking-wider text-mm-cream leading-none">MOMOS</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-mm-red/10 flex items-center justify-center text-xs">
                  🛵
                </div>
              </div>

              {/* Banner */}
              <div className="bg-mm-red text-white p-3 rounded-2xl space-y-1 shadow-md">
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">Fresh Batch</p>
                <h4 className="font-display text-lg leading-tight">GET 50% OFF TODAY</h4>
                <p className="text-[9px] font-body">Code: MOMOMAGIC at checkout</p>
              </div>

              {/* Category selector */}
              <div className="flex gap-2 text-[10px] font-bold">
                <span className="bg-mm-red text-white px-2.5 py-1 rounded-full">Steamed</span>
                <span className="bg-mm-card2 text-mm-cream/60 px-2.5 py-1 rounded-full">Pan Fried</span>
                <span className="bg-mm-card2 text-mm-cream/60 px-2.5 py-1 rounded-full">Soup</span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {[
                  { name: "Classic Chicken Steamed Momos", price: "₹129", rating: "⭐ 4.9", emoji: "🥟" },
                  { name: "Schezwan Veg Momos", price: "₹119", rating: "⭐ 4.8", emoji: "🔥" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-mm-border p-2.5 rounded-xl flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-lg bg-mm-red/5 flex items-center justify-center text-lg shadow-inner shrink-0">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[11px] font-bold text-mm-cream truncate">{item.name}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-mm-red font-bold">{item.price}</span>
                        <span className="text-[8px] text-mm-muted">{item.rating}</span>
                      </div>
                    </div>
                    <button className="bg-mm-red text-white text-[9px] font-extrabold px-3 py-1.5 rounded-lg shadow-sm">
                      ADD
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Navigation Bar */}
            <div className="h-14 border-t border-mm-border flex justify-around items-center px-4 bg-[#FFF9E6] z-40">
              <span className="text-mm-red text-xs font-bold">🥟 Menu</span>
              <span className="text-mm-cream/40 text-xs font-bold">📞 Contact</span>
              <span className="text-mm-cream/40 text-xs font-bold">👤 Profile</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
