import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useEffect, useState } from "react";

const TOAST_DURATION = 5000;

const TOAST_STYLES = {
  success: {
    bg:     "bg-emerald-950 border-emerald-700/60",
    icon:   <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
    bar:    "bg-emerald-500",
    title:  "text-emerald-200",
    body:   "text-emerald-300/70",
  },
  info: {
    bg:     "bg-blue-950 border-blue-700/60",
    icon:   <Info size={18} className="text-blue-400 shrink-0" />,
    bar:    "bg-blue-500",
    title:  "text-blue-200",
    body:   "text-blue-300/70",
  },
  warning: {
    bg:     "bg-amber-950 border-amber-700/60",
    icon:   <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
    bar:    "bg-amber-500",
    title:  "text-amber-200",
    body:   "text-amber-300/70",
  },
  error: {
    bg:     "bg-red-950 border-red-700/60",
    icon:   <XCircle size={18} className="text-red-400 shrink-0" />,
    bar:    "bg-red-500",
    title:  "text-red-200",
    body:   "text-red-300/70",
  },
};

function Toast({ toast }) {
  const { removeToast } = useNotifications();
  const [progress, setProgress] = useState(100);
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 64, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 64, scale: 0.9 }}
      transition={{ type: "spring", damping: 22, stiffness: 260 }}
      className={`relative w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-md ${style.bg}`}
    >
      {/* progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/10">
        <motion.div
          className={`h-full ${style.bar}`}
          style={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
        />
      </div>

      <div className="flex items-start gap-3 p-4">
        {style.icon}
        <div className="flex-1 min-w-0">
          <p className={`font-body text-sm font-700 leading-snug ${style.title}`}>
            {toast.title}
          </p>
          {toast.body && (
            <p className={`font-body text-xs mt-0.5 leading-snug ${style.body}`}>
              {toast.body}
            </p>
          )}
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default function ToastContainer() {
  const { toasts } = useNotifications();

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
      style={{ maxWidth: "calc(100vw - 2rem)" }}
    >
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
