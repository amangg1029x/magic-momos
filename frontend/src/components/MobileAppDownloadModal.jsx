import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Smartphone } from "lucide-react";

export default function MobileAppDownloadModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed it in this session/device
    const dismissed = localStorage.getItem("dismissedAppDownloadModal");
    if (dismissed) return;

    // Detect mobile device (either by screen width or User Agent)
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768;

    if (isMobileDevice) {
      // Small delay of 1.5s to ensure page finishes rendering before modal slides up
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("dismissedAppDownloadModal", "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={handleClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 120 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 120 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-mm-card border border-mm-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-center z-10"
          >
            {/* Close icon */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-mm-muted hover:text-mm-cream transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Smartphone Graphic */}
            <div className="mx-auto w-16 h-16 bg-mm-red/10 rounded-2xl flex items-center justify-center mb-4 border border-mm-red/20">
              <Smartphone size={32} className="text-mm-red" />
            </div>

            <h3 className="font-display text-2xl text-mm-cream mb-2 tracking-wide">
              GET THE MOBILE APP
            </h3>
            
            <p className="font-body text-sm text-mm-muted mb-6 leading-relaxed max-w-xs mx-auto">
              Craving momos? Experience live tracking, exclusive app discounts, and 1-tap checkout with our official Android app!
            </p>

            <div className="space-y-3">
              <a
                href="/magic-momos.apk"
                download
                onClick={handleClose}
                className="flex items-center justify-center gap-3 w-full bg-mm-red text-white py-3.5 rounded-full font-body font-800 text-sm sm:text-base tracking-wide hover:bg-red-600 transition-all duration-300 shadow-glow-red cursor-pointer"
              >
                <Download size={18} />
                Download Android APK
              </a>
              
              <button
                onClick={handleClose}
                className="w-full py-2 text-mm-muted hover:text-mm-cream font-body text-xs font-600 tracking-wider transition-colors cursor-pointer"
              >
                CONTINUE TO MOBILE WEBSITE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
