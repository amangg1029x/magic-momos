import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import api from "../services/api";

import { initPushNotifications } from "../services/pushNotifications";

export default function DeliveryLogin({ onSuccess }) {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.delivery.login(form);
      initPushNotifications("delivery");
      onSuccess();
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
         style={{ background: "linear-gradient(135deg, #0f1923 0%, #1a2d1a 50%, #0d1f0d 100%)" }}>

      {/* ambient glows */}
      <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
           style={{ background: "rgba(34,197,94,0.15)" }} />
      <div className="absolute bottom-1/3 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
           style={{ background: "rgba(16,185,129,0.12)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* card */}
        <div className="rounded-3xl p-8 md:p-10 shadow-2xl"
             style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>

          {/* icon + heading */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg"
                 style={{ background: "linear-gradient(135deg, #22c55e, #10b981)" }}>
              🛵
            </div>
            <h1 className="font-display text-2xl text-white tracking-wide">DELIVERY PORTAL</h1>
            <p className="font-body text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Magic Momos · Delivery Partner Login
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 text-sm font-body px-4 py-3 rounded-xl mb-5"
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
            >
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-body text-xs font-600 mb-2 block"
                     style={{ color: "rgba(255,255,255,0.5)" }}>
                EMAIL
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2"
                     style={{ color: "rgba(255,255,255,0.3)" }} />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="delivery@magicmomos.in"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl font-body text-sm text-white placeholder-white/20
                             focus:outline-none transition-all animate-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(34,197,94,0.6)")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-600 mb-2 block"
                     style={{ color: "rgba(255,255,255,0.5)" }}>
                PASSWORD
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2"
                     style={{ color: "rgba(255,255,255,0.3)" }} />
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl font-body text-sm text-white placeholder-white/20
                             focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(34,197,94,0.6)")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-white transition-colors"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="w-full py-3.5 rounded-xl font-body font-700 text-white text-sm
                         flex items-center justify-center gap-2 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              {loading ? (
                <><Loader2 size={17} className="animate-spin" /> Verifying…</>
              ) : (
                "Access Dashboard →"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 font-body text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          Authorised delivery partners only
        </p>
      </motion.div>
    </div>
  );
}
