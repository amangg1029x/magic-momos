import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import { useNav } from "../context/NavigationContext";
import api from "../services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const ErrorBox = ({ error }) => (
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
);

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
    <motion.div key="request" variants={fadeUp} initial="hidden" animate="show" exit="hidden" className="w-full max-w-[420px]">
      <h1 className="font-display text-4xl sm:text-5xl text-mm-cream tracking-tight leading-none mb-2">
        FORGOT<br />PASSWORD?
      </h1>
      <p className="font-body text-mm-muted text-sm mb-8">
        Enter your email and we'll send you a 6-digit code to reset your password.
      </p>

      <ErrorBox error={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-body text-xs font-700 text-mm-cream uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-mm-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@example.com"
              autoComplete="email"
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
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
              />
              Sending…
            </>
          ) : (
            <>Send Code <ArrowRight size={15} /></>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

// ── Step 2: Enter OTP ─────────────────────────────────────────────────────────
function OTPStep({ email, onSuccess, onReset }) {
  const [otp,     setOtp]     = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) { setError("Enter the 6-digit code from your email"); return; }
    // Just advance to password step with the OTP
    onSuccess(otp.trim());
  };

  return (
    <motion.div key="otp" variants={fadeUp} initial="hidden" animate="show" exit="hidden" className="w-full max-w-[420px]">
      <h1 className="font-display text-4xl sm:text-5xl text-mm-cream tracking-tight leading-none mb-2">
        CHECK<br />YOUR EMAIL
      </h1>
      <p className="font-body text-mm-muted text-sm mb-1">
        We sent a 6-digit code to
      </p>
      <p className="font-body font-700 text-mm-cream text-sm mb-8 break-all">{email}</p>

      <ErrorBox error={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-body text-xs font-700 text-mm-cream uppercase tracking-wider mb-1.5">
            6-Digit Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
            placeholder="000000"
            autoComplete="one-time-code"
            className="w-full bg-white border-2 rounded-xl px-4 py-3.5
                       font-body text-2xl text-center tracking-[0.5em] text-mm-cream placeholder:text-mm-muted
                       focus:outline-none transition-all duration-200
                       border-mm-border hover:border-mm-red/30 focus:border-mm-red/60"
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading || otp.length !== 6}
          whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? "none" : "0 0 32px rgba(232,40,75,0.45)" }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2.5
                     bg-mm-red hover:bg-red-600 text-white
                     py-4 rounded-xl font-body font-800 text-sm tracking-wide
                     transition-all duration-200 disabled:opacity-60 mt-2"
        >
          Continue <ArrowRight size={15} />
        </motion.button>
      </form>

      <p className="font-body text-xs text-mm-muted mt-6 text-center">
        Didn't receive it?{" "}
        <button onClick={onReset} className="text-mm-red hover:underline">
          Try again
        </button>
      </p>
      <p className="font-body text-xs text-mm-muted mt-1 text-center">
        The code expires in <strong className="text-mm-cream">10 minutes</strong>. Check your spam folder.
      </p>
    </motion.div>
  );
}

// ── Step 3: Set new password ──────────────────────────────────────────────────
function ResetStep({ otp, email }) {
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
      await api.auth.resetPassword({ otp, email, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(() => navigate("login"), 2500);
    } catch (err) {
      setError(err.message || "OTP is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div key="success" variants={fadeUp} initial="hidden" animate="show" className="w-full max-w-[420px] text-center">
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
    <motion.div key="reset" variants={fadeUp} initial="hidden" animate="show" exit="hidden" className="w-full max-w-[420px]">
      <h1 className="font-display text-4xl sm:text-5xl text-mm-cream tracking-tight leading-none mb-2">
        SET NEW<br />PASSWORD
      </h1>
      <p className="font-body text-mm-muted text-sm mb-8">
        Choose a strong password for <span className="text-mm-cream font-700 break-all">{email}</span>
      </p>

      <ErrorBox error={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
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
  const [step,       setStep]       = useState("request"); // "request" | "otp" | "reset"
  const [sentEmail,  setSentEmail]  = useState("");
  const [verifiedOTP, setVerifiedOTP] = useState("");

  return (
    <div className="min-h-screen bg-mm-black flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        {/* back button */}
        <button
          onClick={() => step === "request" ? navigate("login") : setStep("request")}
          className="flex items-center gap-2 font-body text-sm text-mm-muted hover:text-mm-cream
                     transition-colors mb-10"
        >
          <ArrowLeft size={15} /> {step === "request" ? "Back to Sign In" : "Back"}
        </button>

        <AnimatePresence mode="wait">
          {step === "request" && (
            <RequestStep
              key="request"
              onSuccess={(email) => { setSentEmail(email); setStep("otp"); }}
            />
          )}
          {step === "otp" && (
            <OTPStep
              key="otp"
              email={sentEmail}
              onSuccess={(otp) => { setVerifiedOTP(otp); setStep("reset"); }}
              onReset={() => setStep("request")}
            />
          )}
          {step === "reset" && (
            <ResetStep
              key="reset"
              otp={verifiedOTP}
              email={sentEmail}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
