import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import { useNav } from "../context/NavigationContext";
import api from "../services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ── Step 1: Enter email ────────────────────────────────────────────────────────
function RequestStep({ onSuccess }) {
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email"); return; }

    setLoading(true);
    setError("");
    try {
      await api.auth.forgotPassword(email.trim());
      onSuccess(email.trim());
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="w-full max-w-[420px]">
      <h1 className="font-display text-4xl sm:text-5xl text-mm-cream tracking-tight leading-none mb-2">
        FORGOT<br />PASSWORD?
      </h1>
      <p className="font-body text-mm-muted text-sm mb-8">
        No worries. Enter your email and we'll send you a reset link.
      </p>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2.5 bg-red-50 border border-red-200
                       rounded-xl px-4 py-3 mb-5 overflow-hidden"
          >
            <AlertCircle size={15} className="text-red-500 shrink-0" />
            <p className="font-body text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-body text-xs font-700 text-mm-cream uppercase tracking-wider mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-mm-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@email.com"
              autoComplete="email"
              className="w-full bg-white border-2 rounded-xl px-4 py-3.5 pl-11
                         font-body text-sm text-mm-cream placeholder:text-mm-muted
                         focus:outline-none transition-all duration-200
                         border-mm-border hover:border-mm-red/30 focus:border-mm-red/60
                         focus:shadow-[0_0_0_3px_rgba(232,40,75,0.10)]"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? "none" : "0 0 32px rgba(232,40,75,0.45)" }}
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
              Sending…
            </>
          ) : (
            <>Send Reset Link <ArrowRight size={15} /></>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

// ── Step 2: Check email confirmation ──────────────────────────────────────────
function SentStep({ email, onReset }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="w-full max-w-[420px] text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle size={42} className="text-green-600" />
      </motion.div>
      <h1 className="font-display text-4xl text-mm-cream tracking-tight mb-3">CHECK YOUR EMAIL</h1>
      <p className="font-body text-mm-muted text-sm leading-relaxed mb-2">
        We sent a password reset link to
      </p>
      <p className="font-body font-700 text-mm-cream text-sm mb-6 break-all">{email}</p>
      <p className="font-body text-mm-muted text-xs mb-8">
        The link expires in <strong className="text-mm-cream">1 hour</strong>. Check your spam folder if you don't see it.
      </p>
      <button
        onClick={onReset}
        className="font-body text-xs text-mm-muted hover:text-mm-red transition-colors"
      >
        Didn't receive it? Try again
      </button>
    </motion.div>
  );
}

// ── Step 3: Set new password (reached via deep-link) ─────────────────────────
function ResetStep({ token, email }) {
  const { navigate } = useNav();
  const [form,      setForm]      = useState({ newPassword: "", confirm: "" });
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (form.newPassword !== form.confirm) { setError("Passwords don't match"); return; }

    setLoading(true);
    setError("");
    try {
      await api.auth.resetPassword({ token, email, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(() => navigate("login"), 2500);
    } catch (err) {
      setError(err.message || "Reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="w-full max-w-[420px] text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={42} className="text-green-600" />
        </motion.div>
        <h1 className="font-display text-3xl text-mm-cream mb-3">PASSWORD RESET!</h1>
        <p className="font-body text-mm-muted text-sm">Redirecting you to sign in…</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="w-full max-w-[420px]">
      <h1 className="font-display text-4xl sm:text-5xl text-mm-cream tracking-tight leading-none mb-2">
        SET NEW<br />PASSWORD
      </h1>
      <p className="font-body text-mm-muted text-sm mb-8">
        Choose a strong password for <span className="text-mm-cream font-700 break-all">{email}</span>
      </p>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2.5 bg-red-50 border border-red-200
                       rounded-xl px-4 py-3 mb-5 overflow-hidden"
          >
            <AlertCircle size={15} className="text-red-500 shrink-0" />
            <p className="font-body text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* new password */}
        <div>
          <label className="block font-body text-xs font-700 text-mm-cream uppercase tracking-wider mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-mm-muted" />
            <input
              type={showPass ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) => { setForm((f) => ({ ...f, newPassword: e.target.value })); setError(""); }}
              placeholder="Min. 6 characters"
              className="w-full bg-white border-2 rounded-xl px-4 py-3.5 pl-11 pr-11
                         font-body text-sm text-mm-cream placeholder:text-mm-muted
                         focus:outline-none transition-all duration-200
                         border-mm-border hover:border-mm-red/30 focus:border-mm-red/60"
            />
            <button type="button" onClick={() => setShowPass((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-mm-muted hover:text-mm-cream transition-colors">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* confirm */}
        <div>
          <label className="block font-body text-xs font-700 text-mm-cream uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-mm-muted" />
            <input
              type={showPass ? "text" : "password"}
              value={form.confirm}
              onChange={(e) => { setForm((f) => ({ ...f, confirm: e.target.value })); setError(""); }}
              placeholder="Repeat password"
              className="w-full bg-white border-2 rounded-xl px-4 py-3.5 pl-11
                         font-body text-sm text-mm-cream placeholder:text-mm-muted
                         focus:outline-none transition-all duration-200
                         border-mm-border hover:border-mm-red/30 focus:border-mm-red/60"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? "none" : "0 0 32px rgba(232,40,75,0.45)" }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2.5
                     bg-mm-red hover:bg-red-600 text-white
                     py-4 rounded-xl font-body font-800 text-sm tracking-wide
                     transition-all duration-200 disabled:opacity-60 mt-2"
        >
          {loading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" />
              Resetting…
            </>
          ) : (
            <>Reset Password <ArrowRight size={15} /></>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

// ── Main page component ────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const { navigate } = useNav();

  // Parse token + email from URL hash query string (deep link from reset email)
  const [urlToken, setUrlToken] = useState(null);
  const [urlEmail, setUrlEmail] = useState(null);
  const [step,     setStep]     = useState("request"); // "request" | "sent" | "reset"
  const [sentEmail, setSentEmail] = useState("");

  useEffect(() => {
    const hash = window.location.hash || "";
    // Expected format: #reset-password?token=xxx&email=yyy
    const qIndex = hash.indexOf("?");
    if (qIndex !== -1) {
      const params = new URLSearchParams(hash.slice(qIndex + 1));
      const t = params.get("token");
      const e = params.get("email");
      if (t && e) {
        setUrlToken(t);
        setUrlEmail(decodeURIComponent(e));
        setStep("reset");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-mm-black flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        {/* back to login */}
        <button
          onClick={() => navigate("login")}
          className="flex items-center gap-2 font-body text-sm text-mm-muted hover:text-mm-cream
                     transition-colors mb-10"
        >
          <ArrowLeft size={15} /> Back to Sign In
        </button>

        <AnimatePresence mode="wait">
          {step === "request" && (
            <RequestStep
              key="request"
              onSuccess={(email) => { setSentEmail(email); setStep("sent"); }}
            />
          )}
          {step === "sent" && (
            <SentStep
              key="sent"
              email={sentEmail}
              onReset={() => setStep("request")}
            />
          )}
          {step === "reset" && (
            <ResetStep
              key="reset"
              token={urlToken}
              email={urlEmail}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
