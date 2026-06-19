import { motion } from "framer-motion";
import { MapPin, Phone, Home, ArrowLeft } from "lucide-react";
import { useNav } from "../context/NavigationContext";
import { DELIVERY_RADIUS_KM } from "../data/restaurantConfig";

export default function OutOfRangePage() {
  const { pageData, navigate } = useNav();
  const distance = pageData?.distanceKm;

  return (
    <div className="min-h-screen bg-mm-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-mm-red/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-mm-gold/15 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-[0_24px_80px_rgba(42,30,27,0.18)] overflow-hidden"
      >
        <div className="bg-gradient-to-br from-mm-red to-red-600 p-9 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 240, damping: 16 }}
            className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
          >
            <MapPin size={30} className="text-mm-red" />
          </motion.div>
          <h1 className="font-display text-3xl text-white tracking-tight">
            SORRY, WE'RE NOT THERE YET
          </h1>
        </div>

        <div className="p-7 space-y-5 text-center">
          <p className="font-body text-sm text-mm-muted leading-relaxed">
            We currently deliver within{" "}
            <span className="font-700 text-mm-cream">{DELIVERY_RADIUS_KM} km</span> of our
            kitchen, and your location looks like it's
            {distance != null ? (
              <> about <span className="font-700 text-mm-cream">{distance} km</span> away</>
            ) : (
              " outside that range"
            )}
            . We don't want to promise a delivery time we can't keep, so we're not taking
            orders to your area just yet.
          </p>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-left">
            <p className="font-body text-xs text-amber-700">
              Growing every month! Check back soon, or give us a call — we're sometimes
              able to make exceptions for nearby pickup.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <motion.a
              href="tel:+917042289004"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 bg-mm-red hover:bg-red-600
                         text-white py-3.5 rounded-xl font-body font-700 text-sm transition-colors"
            >
              <Phone size={15} /> Call the Restaurant
            </motion.a>
            <motion.button
              onClick={() => navigate("home")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 border border-mm-border
                         text-mm-cream hover:border-mm-red/40 hover:text-mm-red
                         py-3.5 rounded-xl font-body font-700 text-sm transition-all"
            >
              <Home size={15} /> Back to Home
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}