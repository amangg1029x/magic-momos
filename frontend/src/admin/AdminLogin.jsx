import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import api from "../services/api";

import { initPushNotifications } from "../services/pushNotifications";

export default function AdminLogin({ onSuccess }) {
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
      await api.admin.login(form);
      initPushNotifications("admin");
      onSuccess();
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0d00] flex items-center justify-center px-3 sm:px-4 relative overflow-hidden">
      {/* ambient glow */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#E8284B]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-[#F5A623]/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <span className="text-4xl">🥟</span>
          <p className="font-brand text-[#E8284B] text-2xl mt-1">Magic Momos</p>
          <h1 className="font-display text-xl text-gray-900 mt-3 tracking-wide">ADMIN LOGIN</h1>
          <p className="font-body text-sm text-gray-400 mt-1">
            Sign in to manage orders, menu &amp; more
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-body
                       px-4 py-3 rounded-xl mb-5"
          >
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-body text-xs font-600 text-gray-500 mb-1.5 block">
              Email
            </label>
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="admin@magicmomos.in"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200
                           font-body text-sm focus:outline-none focus:ring-2
                           focus:ring-[#E8284B]/30 focus:border-[#E8284B] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-600 text-gray-500 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPw ? "text" : "password"}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200
                           font-body text-sm focus:outline-none focus:ring-2
                           focus:ring-[#E8284B]/30 focus:border-[#E8284B] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8284B] hover:bg-[#d11f40] text-white font-body font-700
                       py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2
                       disabled:opacity-60 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}