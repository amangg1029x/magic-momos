import { motion } from "framer-motion";
import { MapPin, Clock, Navigation } from "lucide-react";

const HOURS = [
  { days: "Monday – Friday", time: "06:00 PM – 12:00 PM", note: ""         },
  { days: "Saturday",        time: "05:00 PM – 12:00 PM", note: "Extended" },
  { days: "Sunday",          time: "05:00 PM – 12:00 PM", note: "Extended"         },
  { days: "Public Holidays", time: "06:00 PM – 12:00 PM", note: "Open!"   },
];

export default function MapAndHours() {
  return (
    <section className="py-20 sm:py-28 bg-mm-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* heading */}
        <div className="mb-12">
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-3"
          >
            — Find Us —
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-display text-5xl sm:text-6xl text-mm-cream leading-none"
          >
            WE'RE RIGHT<br />
            <span style={{
              background: "linear-gradient(110deg,#E8284B,#F5A623)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
            }}>HERE</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── map placeholder ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden bg-white border border-mm-border
                       shadow-card min-h-[340px] flex flex-col"
          >
            {/* map visual */}
            <div className="flex-1 relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50
                            min-h-[260px] flex items-center justify-center overflow-hidden">
              {/* grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                  <pattern id="map-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2A1E1B" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#map-grid)" />
              </svg>

              {/* roads */}
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 260">
                <line x1="0" y1="130" x2="400" y2="130" stroke="#C4A882" strokeWidth="8" />
                <line x1="200" y1="0"   x2="200" y2="260" stroke="#C4A882" strokeWidth="6" />
                <line x1="0"   y1="70"  x2="400" y2="70"  stroke="#C4A882" strokeWidth="4" />
                <line x1="0"   y1="200" x2="400" y2="200" stroke="#C4A882" strokeWidth="4" />
                <line x1="100" y1="0"   x2="100" y2="260" stroke="#C4A882" strokeWidth="4" />
                <line x1="300" y1="0"   x2="300" y2="260" stroke="#C4A882" strokeWidth="4" />
              </svg>

              {/* pin */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-mm-red shadow-glow-red
                                flex items-center justify-center mb-2">
                  <MapPin size={24} className="text-white" />
                </div>
                <div className="bg-white border border-mm-border rounded-2xl px-4 py-2 shadow-card text-center">
                  <p className="font-body font-700 text-mm-cream text-sm">Magic Momos</p>
                  <p className="font-body text-mm-muted text-xs">Gyan Mandir Chowk, Ekta Vihar, New Delhi</p>
                </div>
              </motion.div>
            </div>

            {/* address bar */}
            <div className="p-5 flex items-start gap-3 border-t border-mm-border">
              <MapPin size={16} className="text-mm-red mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-body font-700 text-mm-cream text-sm">
                  Magic Momos
                </p>
                <p className="font-body text-mm-muted text-xs mt-0.5">
                  Gyan Mandir Chowk, Ekta Vihar, New Delhi - 110044
                </p>
              </div>
              <motion.a
                href="https://maps.app.goo.gl/9aG2kQ6yRAPVxo437"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.06 }}
                className="flex items-center gap-1.5 bg-mm-red text-white px-3.5 py-2
                           rounded-xl font-body font-700 text-xs hover:bg-red-600 transition-colors shrink-0"
              >
                <Navigation size={12} />
                Directions
              </motion.a>
            </div>
          </motion.div>

          {/* ── hours ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            {/* opening hours card */}
            <div className="bg-white border border-mm-border rounded-3xl p-7 shadow-card">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-mm-red/10 border border-mm-red/20
                                flex items-center justify-center">
                  <Clock size={16} className="text-mm-red" />
                </div>
                <h3 className="font-display text-2xl text-mm-cream tracking-wide">OPENING HOURS</h3>
              </div>

              <ul className="space-y-3">
                {HOURS.map(({ days, time, note }, i) => {
                  const isToday = i === new Date().getDay() === 6 ? 1
                    : new Date().getDay() === 0 ? 2 : 0;
                  return (
                    <motion.li
                      key={days}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.07 }}
                      className="flex items-center justify-between py-3
                                 border-b border-mm-border last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-body text-sm text-mm-cream font-600">{days}</span>
                        {note && (
                          <span className="text-[10px] font-body font-700 px-1.5 py-0.5 rounded-full
                                           bg-green-100 text-green-700">
                            {note}
                          </span>
                        )}
                      </div>
                      <span className="font-body text-sm text-mm-muted">{time}</span>
                    </motion.li>
                  );
                })}
              </ul>

              {/* open now badge */}
              <div className="mt-5 flex items-center gap-2 bg-green-50 border border-green-200
                              rounded-xl px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="font-body text-sm font-700 text-green-700">
                  We're open right now!
                </p>
                <span className="ml-auto font-body text-xs text-green-600">
                  Closes at 12 PM
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}