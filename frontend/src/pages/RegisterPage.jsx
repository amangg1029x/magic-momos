import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNav } from "../context/NavigationContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

// Password strength checker
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6)                    score++;
  if (pw.length >= 10)                   score++;
  if (/[A-Z]/.test(pw))                  score++;
  if (/[0-9]/.test(pw))                  score++;
  if (/[^A-Za-z0-9]/.test(pw))          score++;
  const map = [
    { label: "",         color: ""                },
    { label: "Weak",     color: "bg-red-400"      },
    { label: "Fair",     color: "bg-orange-400"   },
    { label: "Good",     color: "bg-yellow-400"   },
    { label: "Strong",   color: "bg-green-400"    },
    { label: "Perfect",  color: "bg-green-500"    },
  ];
  return { score, ...map[score] };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const { navigate } = useNav();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
  });
  const [focused,     setFocused]     = useState(null);
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const strength = getStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = "Full name is required";
    if (!form.email.trim())   errs.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
                              errs.phone   = "Enter a valid 10-digit number";
    if (!form.password)       errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "At least 6 characters required";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    setError("");
    try {
      await register({
        name:     form.name,
        email:    form.email,
        phone:    form.phone || undefined,
        password: form.password,
      });
      navigate("account");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
        className="hidden lg:flex lg:w-[48%] relative flex-col justify-between
                   bg-mm-card border-r border-mm-border p-12 overflow-hidden"
      >
        {/* ambient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 w-[420px] h-[420px]
                          bg-mm-red/[0.10] rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -left-16 w-[360px] h-[360px]
                          bg-mm-gold/[0.09] rounded-full blur-[110px]" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
            <defs>
              <pattern id="reg-dots" x="0" y="0" width="28" height="28"
                patternUnits="userSpaceOnUse">
                <circle cx="1.4" cy="1.4" r="1.4" fill="#FFF9E6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#reg-dots)" />
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

        {/* centre content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-5"
          >
            — Join the magic —
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[5rem] xl:text-[6rem] leading-none
                       text-mm-cream tracking-tight mb-6"
          >
            YOUR<br />FIRST<br />
            <span style={{
              background: "linear-gradient(110deg,#E8284B 0%,#F5A623 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              MOMO
            </span><br />
            <span className="text-mm-cream">IS WAITING</span>
          </motion.h2>

          {/* benefits list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-3 mt-2"
          >
            {[
              { emoji: "🎁", text: "10% off your first order" },
              { emoji: "📦", text: "Live order tracking"      },
              { emoji: "❤️", text: "Save your favourites"    },
              { emoji: "🔔", text: "Exclusive deals & offers" },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-mm-red/10 border border-mm-red/15
                                flex items-center justify-center text-sm shrink-0">
                  {emoji}
                </div>
                <span className="font-body text-sm text-mm-cream/70">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* member count strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="relative z-10 flex items-center gap-3 p-4 rounded-2xl
                     bg-white/[0.04] border border-mm-border"
        >
          <div className="flex -space-x-2.5">
            {["👩","👨","🧕","👦"].map((av, i) => (
              <div key={i}
                className="w-8 h-8 rounded-full bg-mm-card2 border-2 border-mm-black
                           flex items-center justify-center text-sm">
                {av}
              </div>
            ))}
          </div>
          <p className="font-body text-xs text-mm-muted">
            <span className="text-mm-cream font-700">500+</span> happy customers already
          </p>
        </motion.div>
      </motion.div>

      {/* ── RIGHT PANEL: form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center
                      px-6 sm:px-10 py-10 overflow-y-auto relative">

        {/* mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-8 select-none">
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
          className="w-full max-w-[440px]"
        >
          {/* heading */}
          <motion.div variants={fadeUp} className="mb-7">
            <h1 className="font-display text-4xl sm:text-5xl text-mm-cream tracking-tight leading-none mb-2">
              CREATE ACCOUNT
            </h1>
            <p className="font-body text-mm-muted text-sm">
              Already a member?{" "}
              <button
                onClick={() => navigate("login")}
                className="text-mm-red font-700 hover:underline transition-colors"
              >
                Sign in →
              </button>
            </p>
          </motion.div>

          {/* error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
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
            {/* name */}
            <div>
              <label className="block font-body text-xs font-700 text-mm-cream
                                uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User size={15} className={`absolute left-4 top-1/2 -translate-y-1/2
                  pointer-events-none transition-colors
                  ${focused === "name" ? "text-mm-red" : "text-mm-muted"}`} />
                <input
                  type="text" name="name" value={form.name}
                  placeholder="Raju Sharma"
                  autoComplete="name"
                  className={inputBase("name")}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-red-500 text-xs mt-1 font-body">{fieldErrors.name}</p>
              )}
            </div>

            {/* email + phone row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-xs font-700 text-mm-cream
                                  uppercase tracking-wider mb-1.5">
                  Email *
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

              <div>
                <label className="block font-body text-xs font-700 text-mm-cream
                                  uppercase tracking-wider mb-1.5">
                  Phone
                </label>
                <div className="relative">
                  <Phone size={15} className={`absolute left-4 top-1/2 -translate-y-1/2
                    pointer-events-none transition-colors
                    ${focused === "phone" ? "text-mm-red" : "text-mm-muted"}`} />
                  <input
                    type="tel" name="phone" value={form.phone}
                    placeholder="98765 43210"
                    autoComplete="tel"
                    className={inputBase("phone")}
                    onFocus={() => setFocused("phone")}
                    onBlur={() => setFocused(null)}
                    onChange={handleChange}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-red-500 text-xs mt-1 font-body">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            {/* password */}
            <div>
              <label className="block font-body text-xs font-700 text-mm-cream
                                uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock size={15} className={`absolute left-4 top-1/2 -translate-y-1/2
                  pointer-events-none transition-colors
                  ${focused === "password" ? "text-mm-red" : "text-mm-muted"}`} />
                <input
                  type={showPass ? "text" : "password"}
                  name="password" value={form.password}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
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

              {/* strength meter */}
              <AnimatePresence>
                {form.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 overflow-hidden"
                  >
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300
                            ${i <= strength.score ? strength.color : "bg-mm-border"}`}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <p className={`font-body text-xs font-700
                        ${strength.score <= 1 ? "text-red-400"
                          : strength.score <= 2 ? "text-orange-400"
                          : strength.score <= 3 ? "text-yellow-400"
                          : "text-green-400"}`}>
                        {strength.label} password
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1 font-body">{fieldErrors.password}</p>
              )}
            </div>

            {/* confirm password */}
            <div>
              <label className="block font-body text-xs font-700 text-mm-cream
                                uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock size={15} className={`absolute left-4 top-1/2 -translate-y-1/2
                  pointer-events-none transition-colors
                  ${focused === "confirm" ? "text-mm-red" : "text-mm-muted"}`} />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm" value={form.confirm}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={inputBase("confirm") + " pr-11"}
                  onFocus={() => setFocused("confirm")}
                  onBlur={() => setFocused(null)}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                             text-mm-muted hover:text-mm-cream transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>

                {/* match tick */}
                <AnimatePresence>
                  {form.confirm && form.password === form.confirm && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute right-10 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 size={15} className="text-green-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {fieldErrors.confirm && (
                <p className="text-red-500 text-xs mt-1 font-body">{fieldErrors.confirm}</p>
              )}
            </div>

            {/* terms note */}
            <p className="font-body text-xs text-mm-muted leading-relaxed">
              By creating an account you agree to our{" "}
              <span className="text-mm-cream underline cursor-pointer">Terms of Service</span>
              {" "}and{" "}
              <span className="text-mm-cream underline cursor-pointer">Privacy Policy</span>.
            </p>

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
                         transition-all duration-200 disabled:opacity-60 mt-1"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                  />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.p
            variants={fadeUp}
            className="text-center font-body text-xs text-mm-muted mt-6"
          >
            Already have an account?{" "}
            <button
              onClick={() => navigate("login")}
              className="text-mm-gold font-700 hover:underline"
            >
              Sign in
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}