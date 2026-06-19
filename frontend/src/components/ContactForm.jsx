import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Mail, Phone, MessageSquare, CheckCircle, ChevronDown } from "lucide-react";
import api from "../services/api";

const SUBJECTS = [
  "General Enquiry",
  "Bulk / Catering Order",
  "Feedback",
  "Complaint",
  "Delivery Issue",
  "Other",
];

const WHY_POINTS = [
  { emoji: "⚡", title: "Fast Response",   desc: "We reply within 4 hours during business hours." },
  { emoji: "🎁", title: "Bulk Orders",     desc: "Special pricing for orders above 50 plates." },
  { emoji: "🛵", title: "Custom Delivery", desc: "We deliver to offices and events. Ask us!" },
];

export default function ContactForm() {
  const [form, setForm]           = useState({ name:"", email:"", phone:"", subject: SUBJECTS[0], message:"" });
  const [focused, setFocused]     = useState(null);
  const [errors,  setErrors]      = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await api.contact.submit(form);
      setSubmitted(true);
    } catch (err) {
        setErrors({ message: err.message || "Something went wrong. Please try again." });
    } finally {
        setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3.5 bg-white border-2 rounded-xl font-body text-sm text-mm-cream
     placeholder:text-mm-muted focus:outline-none transition-all duration-200
     ${errors[field]
       ? "border-red-400 focus:border-red-500"
       : focused === field
         ? "border-mm-red/60 shadow-[0_0_0_3px_rgba(232,40,75,0.08)]"
         : "border-mm-border hover:border-mm-red/30"}`;

  return (
    <section className="py-20 sm:py-28 bg-mm-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-start">

          {/* ── LEFT: form ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-mm-card border border-mm-border rounded-3xl p-7 sm:p-10 shadow-card"
          >
            <h2 className="font-display text-4xl sm:text-5xl text-mm-cream tracking-tight mb-2">
              SEND A MESSAGE
            </h2>
            <p className="font-body text-mm-muted text-sm mb-8">
              Fill in the form and we'll get back to you as soon as possible.
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                /* ── success state ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-10 gap-5"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
                  >
                    <CheckCircle size={42} className="text-green-600" />
                  </motion.div>
                  <h3 className="font-display text-3xl text-mm-cream">MESSAGE SENT!</h3>
                  <p className="font-body text-mm-muted text-sm max-w-xs">
                    Thanks {form.name.split(" ")[0]}! We've received your message and will
                    reply to <strong className="text-mm-cream">{form.email}</strong> within 4 hours.
                  </p>
                  <motion.button
                    onClick={() => { setSubmitted(false); setForm({ name:"", email:"", phone:"", subject:SUBJECTS[0], message:"" }); }}
                    whileHover={{ scale: 1.05 }}
                    className="mt-2 border border-mm-border text-mm-muted hover:text-mm-cream
                               hover:border-mm-red/40 px-6 py-2.5 rounded-full font-body text-sm
                               font-600 transition-all"
                  >
                    Send another message
                  </motion.button>
                </motion.div>
              ) : (
                /* ── form ── */
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* name */}
                  <div>
                    <label className="block font-body text-xs font-700 text-mm-cream uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none
                        ${focused === "name" ? "text-mm-red" : "text-mm-muted"}`} />
                      <input
                        type="text" name="name" value={form.name}
                        placeholder="Raju Sharma"
                        className={inputClass("name") + " pl-10"}
                        onFocus={() => setFocused("name")}
                        onBlur={() => setFocused(null)}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* email + phone */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-body text-xs font-700 text-mm-cream uppercase tracking-wider mb-1.5">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none
                          ${focused === "email" ? "text-mm-red" : "text-mm-muted"}`} />
                        <input
                          type="email" name="email" value={form.email}
                          placeholder="you@email.com"
                          className={inputClass("email") + " pl-10"}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block font-body text-xs font-700 text-mm-cream uppercase tracking-wider mb-1.5">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none
                          ${focused === "phone" ? "text-mm-red" : "text-mm-muted"}`} />
                        <input
                          type="tel" name="phone" value={form.phone}
                          placeholder="9876543210"
                          className={inputClass("phone") + " pl-10"}
                          onFocus={() => setFocused("phone")}
                          onBlur={() => setFocused(null)}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* subject */}
                  <div>
                    <label className="block font-body text-xs font-700 text-mm-cream uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <div className="relative">
                      <select
                        name="subject" value={form.subject} onChange={handleChange}
                        className={inputClass("subject") + " appearance-none pr-10 cursor-pointer"}
                        onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
                      >
                        {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-mm-muted" />
                    </div>
                  </div>

                  {/* message */}
                  <div>
                    <label className="block font-body text-xs font-700 text-mm-cream uppercase tracking-wider mb-1.5">
                      Message * (Min 10 characters)
                    </label>
                    <div className="relative">
                      <MessageSquare size={15} className={`absolute left-4 top-4 pointer-events-none
                        ${focused === "message" ? "text-mm-red" : "text-mm-muted"}`} />
                      <textarea
                        name="message" value={form.message} rows={5}
                        placeholder="Tell us what's on your mind..."
                        className={inputClass("message") + " pl-10 resize-none"}
                        onFocus={() => setFocused("message")}
                        onBlur={() => setFocused(null)}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  </div>

                  {/* submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? "none" : "0 0 28px rgba(232,40,75,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2.5
                               bg-mm-red hover:bg-red-600 text-white
                               py-4 rounded-xl font-body font-800 text-sm tracking-wide
                               transition-all duration-200 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <><Send size={15} /> Send Message</>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── RIGHT: why / points ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 lg:pt-16"
          >
            <div>
              <p className="font-body text-mm-red text-sm tracking-[0.3em] uppercase font-600 mb-3">
                — Why reach out —
              </p>
              <h3 className="font-display text-4xl sm:text-5xl text-mm-cream leading-none mb-5">
                WE'RE<br />
                <span style={{
                  background: "linear-gradient(110deg,#F5A623,#E8284B)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>LISTENING</span>
              </h3>
              <p className="font-body text-mm-muted text-sm leading-relaxed max-w-sm">
                Whether it's a compliment, a complaint, or a 100-plate catering order —
                every message matters to us. We built Magic Momos on feedback.
              </p>
            </div>

            {/* why points */}
            <div className="space-y-4">
              {WHY_POINTS.map(({ emoji, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="flex items-start gap-4 p-5 bg-white border border-mm-border
                             rounded-2xl shadow-[0_2px_12px_rgba(42,30,27,0.06)]
                             hover:border-mm-red/25 hover:shadow-[0_6px_24px_rgba(42,30,27,0.09)]
                             transition-all duration-300 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300 leading-none">
                    {emoji}
                  </span>
                  <div>
                    <p className="font-body font-700 text-mm-cream text-sm mb-0.5">{title}</p>
                    <p className="font-body text-mm-muted text-xs leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* social strip */}
            <div className="pt-2">
              <p className="font-body text-xs text-mm-muted uppercase tracking-widest mb-3">
                Also find us on
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: "Instagram",  emoji: "📸", href: "#" },
                  { label: "Facebook",   emoji: "👥", href: "#" },
                  { label: "WhatsApp",   emoji: "💬", href: "#" },
                ].map(({ label, emoji, href }) => (
                  <motion.a
                    key={label}
                    href={href}
                    whileHover={{ scale: 1.08, y: -2 }}
                    className="flex items-center gap-1.5 bg-white border border-mm-border
                               text-mm-muted hover:text-mm-cream hover:border-mm-red/30
                               px-3.5 py-2 rounded-xl text-xs font-body font-600
                               transition-all duration-200 shadow-sm"
                  >
                    {emoji} {label}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}