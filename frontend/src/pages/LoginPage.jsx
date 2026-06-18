import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNav } from "../context/NavigationContext";
import api, { getAdminToken, getDeliveryToken } from "../services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export default function LoginPage() {
  const { login }    = useAuth();
  const { navigate } = useNav();

  useEffect(() => {
    if (getAdminToken()) {
      navigate("admin");
    } else if (getDeliveryToken()) {
      navigate("delivery");
    }
  }, [navigate]);

  const [form,        setForm]        = useState({ email: "", password: "" });
  const [focused,     setFocused]     = useState(null);
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim())    errs.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password)        errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    setError("");
    try {
      await login(form);
      navigate("account");
    } catch (err) {
      try {
        await api.admin.login(form);
        navigate("admin");
      } catch (adminErr) {
        try {
          await api.delivery.login(form);
          navigate("delivery");
        } catch (deliveryErr) {
          setError(err.message || "Invalid email or password.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase = (field) => `
    w-full bg-white border-2 rounded-xl px-4 py-3.5 pl-11
    font-body text-sm text-mm-cream placeholder:text-mm-muted
    focus:outline-none transition-all duration-200
    ${fieldErrors[field]
      ? "border-red-400 focus:border-red-500"
      : focused === field
        ? "border-mm-red/60 shadow-[0_0_0_3px_rgba(232,40,75,0.10)]"
        : "border-mm-border hover:border-mm-red/30"
    }
  `;

  return (
    <div className="min-h-screen bg-mm-black flex overflow-hidden">

      {/* ── LEFT PANEL: branding ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between
                   bg-mm-card border-r border-mm-border p-12 overflow-hidden"
      >
        {/* ambient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px]
                          bg-mm-red/[0.12] rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -right-20 w-[400px] h-[400px]
                          bg-mm-gold/[0.10] rounded-full blur-[110px]" />
          {/* dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.045]">
            <defs>
              <pattern id="login-dots" x="0" y="0" width="28" height="28"
                patternUnits="userSpaceOnUse">
                <circle cx="1.4" cy="1.4" r="1.4" fill="#FFF9E6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-dots)" />
          </svg>
        </div>

        {/* logo */}
        <div className="relative z-10 flex items-center gap-3 select-none">
          <motion.span
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl"
          >🥟</motion.span>
          <div className="leading-none">
            <span className="block font-brand text-[1.6rem] text-mm-gold leading-tight">Magic</span>
            <span className="block font-display text-[1.2rem] tracking-[0.22em] text-mm-cream leading-tight">MOMOS</span>
          </div>
        </div>

        {/* centre headline */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-5"
          >
            — Welcome back —
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[5.5rem] xl:text-[6.5rem] leading-none
                       text-mm-cream tracking-tight mb-6"
          >
            TASTE<br />
            <span style={{
              background: "linear-gradient(110deg,#F5A623 0%,#FFD166 50%,#F5A623 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              THE MAGIC
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="font-body text-mm-muted text-base leading-relaxed max-w-xs"
          >
            Log in to track your orders, save your favourite items, and
            re-order with one tap.
          </motion.p>

          {/* floating perks */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-col gap-3 mt-10"
          >
            {[
              { emoji: "🛵", text: "Track every order in real time"   },
              { emoji: "⭐", text: "Earn loyalty points on each order" },
              { emoji: "⚡", text: "One-tap re-order your favourites"  },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-mm-red/10 border border-mm-red/20
                                flex items-center justify-center text-base shrink-0">
                  {emoji}
                </div>
                <span className="font-body text-sm text-mm-cream/70">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* bottom quote */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="relative z-10 pl-4 border-l-2 border-mm-red/40"
        >
          <p className="font-brand text-mm-cream/60 text-sm italic leading-relaxed">
            "Every bite is a little spell."
          </p>
        </motion.blockquote>
      </motion.div>

      {/* ── RIGHT PANEL: form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center
                      px-6 sm:px-10 py-12 relative">

        {/* mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10 select-none">
          <span className="text-3xl">🥟</span>
          <div className="leading-none">
            <span className="block font-brand text-[1.4rem] text-mm-gold leading-tight">Magic</span>
            <span className="block font-display text-[1rem] tracking-[0.2em] text-mm-cream">MOMOS</span>
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-[420px]"
        >
          {/* heading */}
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="font-display text-4xl sm:text-5xl text-mm-cream tracking-tight leading-none mb-2">
              SIGN IN
            </h1>
            <p className="font-body text-mm-muted text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("register")}
                className="text-mm-red font-700 hover:underline transition-colors"
              >
                Create one →
              </button>
            </p>
          </motion.div>

          {/* error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0,  height: "auto" }}
                exit={{   opacity: 0, y: -8,  height: 0 }}
                className="flex items-center gap-2.5 bg-red-50 border border-red-200
                           rounded-xl px-4 py-3 mb-5 overflow-hidden"
              >
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="font-body text-sm text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* email */}
            <div>
              <label className="block font-body text-xs font-700 text-mm-cream
                                uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className={`absolute left-4 top-1/2 -translate-y-1/2
                  pointer-events-none transition-colors
                  ${focused === "email" ? "text-mm-red" : "text-mm-muted"}`} />
                <input
                  type="email" name="email" value={form.email}
                  placeholder="you@email.com"
                  autoComplete="email"
                  className={inputBase("email")}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1 font-body">{fieldErrors.email}</p>
              )}
            </div>

            {/* password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-body text-xs font-700 text-mm-cream
                                  uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("forgot-password")}
                  className="font-body text-xs text-mm-muted hover:text-mm-red
                             transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className={`absolute left-4 top-1/2 -translate-y-1/2
                  pointer-events-none transition-colors
                  ${focused === "password" ? "text-mm-red" : "text-mm-muted"}`} />
                <input
                  type={showPass ? "text" : "password"}
                  name="password" value={form.password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={inputBase("password") + " pr-11"}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                             text-mm-muted hover:text-mm-cream transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1 font-body">{fieldErrors.password}</p>
              )}
            </div>

            {/* submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02,
                            boxShadow: loading ? "none" : "0 0 32px rgba(232,40,75,0.45)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2.5
                         bg-mm-red hover:bg-red-600 text-white
                         py-4 rounded-xl font-body font-800 text-sm tracking-wide
                         transition-all duration-200 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                  />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* divider */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-mm-border" />
            <span className="font-body text-xs text-mm-muted">or continue as</span>
            <div className="flex-1 h-px bg-mm-border" />
          </motion.div>

          {/* guest shortcut */}
          <motion.button
            variants={fadeUp}
            onClick={() => navigate("menu")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2
                       border border-mm-border text-mm-cream/60 hover:text-mm-cream
                       hover:border-mm-red/30 py-3.5 rounded-xl font-body font-700
                       text-sm transition-all duration-200"
          >
            <span className="text-lg">👤</span>
            Continue as Guest
          </motion.button>

          {/* register nudge */}
          <motion.p
            variants={fadeUp}
            className="text-center font-body text-xs text-mm-muted mt-8"
          >
            New to Magic Momos?{" "}
            <button
              onClick={() => navigate("register")}
              className="text-mm-gold font-700 hover:underline"
            >
              Create a free account
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}