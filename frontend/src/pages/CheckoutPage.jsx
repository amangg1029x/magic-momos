import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronLeft, MapPin, User, Phone, Mail, Home,
  Wallet, Banknote, CreditCard, AlertCircle, ShoppingBag,
  CheckCircle, MessageSquare, Tag, Edit3, ShieldCheck,
} from "lucide-react";
import { useNav } from "../context/NavigationContext";
import { useAuth } from "../context/AuthContext";
import { useRazorpay } from "../hooks/useRazorpay";
import Header from "../components/Header";
import AddressSelectorModal from "../components/AddressSelectorModal";
import api from "../services/api";

const PINCODE_RE = /^\d{6}$/;
const PHONE_RE   = /^[6-9]\d{9}$/;

const PAYMENT_METHODS = [
  {
    id:    "cod",
    icon:  Banknote,
    title: "Cash on Delivery",
    desc:  "Pay in cash when your order arrives",
    accent:"#059669",
  },
  {
    id:    "online",
    icon:  CreditCard,
    title: "Pay Online",
    desc:  "UPI, Cards & Wallets — instant",
    accent:"#3B82F6",
    badge: "Recommended",
  },
];

/**
 * CheckoutPage
 * Props:
 *   cart — the full useCart() return object, passed down from MenuPage
 */
export default function CheckoutPage({ cart }) {
  const { navigate, isNative, storeStatus, settings }  = useNav();
  const { user, isAuthenticated } = useAuth();
  const isClosed = storeStatus && !storeStatus.open;

  const {
    items, subtotal, discount, deliveryFee, total,
    coupon, clearCart,
  } = cart;

  // ── Redirect home if the cart is empty (e.g. page refresh after order) ────
  useEffect(() => {
    if (items.length === 0) navigate("home");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step state: 1 = details, 2 = review & pay ──────────────────────────────
  const [step, setStep] = useState(1);

  // ── Address modal state ──────────────────────────────────────────────────────
  // confirmedAddr: { street, city, pincode, lat, lng, inRange, distance } | null
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [confirmedAddr, setConfirmedAddr] = useState(null);

  const [form, setForm] = useState({
    name:    user?.name  || "",
    phone:   user?.phone || "",
    email:   user?.email || "",
    street:  "",
    city:    "New Delhi",
    pincode: "",
    instructions: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [focused, setFocused] = useState(null);
  const [errors,  setErrors]  = useState({});
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");

  // Granular stage so the button text reflects exactly what's happening
  // during an online payment, rather than one generic spinner the whole time.
  const [paymentStage, setPaymentStage] = useState(null); // null | "creating" | "awaiting" | "verifying"

  const { open: openRazorpay } = useRazorpay();

  // ── Called when user confirms a location in the modal ───────────────────────
  const handleModalConfirm = ({ street, city, pincode, lat, lng, inRange, distance }) => {
    setConfirmedAddr({ street, city, pincode, lat, lng, inRange, distance });
    setForm((f) => ({
      ...f,
      street:  street  || f.street,
      city:    city    || f.city,
      pincode: pincode || f.pincode,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim())     errs.name    = "Name is required";
    if (!PHONE_RE.test(form.phone))
                                errs.phone   = "Enter a valid 10-digit mobile number";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email))
                                errs.email   = "Enter a valid email";
    if (!confirmedAddr)         errs.location = "Please select a delivery location";
    if (!form.street.trim())   errs.street  = "Delivery address is required";
    if (!PINCODE_RE.test(form.pincode))
                                errs.pincode = "Enter a valid 6-digit pincode";
    if (confirmedAddr?.inRange === false)
                                errs.zone    = "This location is outside our delivery area";
    return errs;
  };

  const goToReview = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Place the order ──────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    // Defense in depth: goToReview() already blocks step 2 from being
    // reached while out of zone, but never let an order through this
    // function regardless of how it's called.
    if (confirmedAddr?.inRange === false) {
      setPlaceError("This location is outside our delivery area — please adjust the pin and try again.");
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setPlacing(true);
    setPlaceError("");
    setPaymentStage(paymentMethod === "online" ? "creating" : null);

    const payload = {
      customer: {
        name:  form.name,
        phone: form.phone,
        email: form.email || undefined,
      },
      // Use the stored id (numeric) directly
      items: items.filter(i => i.id && Number(i.id) > 0).map(i => ({ itemId: Number(i.id), qty: i.qty })),
      address: {
        street:  form.street,
        pincode: form.pincode,
        ...(confirmedAddr ? { lat: confirmedAddr.lat, lng: confirmedAddr.lng } : {}),
      },
      paymentMethod,
      specialInstructions: form.instructions || undefined,
      couponCode: coupon?.code || undefined,
    };

    console.log('Placing order payload:', JSON.stringify(payload));
    try {
      const { order, razorpay } = await api.orders.place(payload);

      // ── Auto-save delivery address for logged-in users ──────────────────
      if (isAuthenticated) {
        try {
          await api.auth.update({
            address: {
              street: form.street, city: form.city, pincode: form.pincode,
              ...(confirmedAddr ? { lat: confirmedAddr.lat, lng: confirmedAddr.lng } : {}),
            },
          });
        } catch (addrErr) {
          console.error("Failed to auto-save address:", addrErr);
        }
      }

      // ── COD: we're done, go straight to the success page ──────────────────
      if (paymentMethod === "cod") {
        clearCart();
        navigate("success", { ...order, delivery: order.deliveryCharge, grandTotal: order.total });
        return;
      }

      // ── Online: open Razorpay Checkout with the order it just created ─────
      if (!razorpay) {
        throw new Error("Could not start online payment. Please try again or use Cash on Delivery.");
      }

      setPaymentStage("awaiting"); // modal is up, waiting on the customer

      let result;
      try {
        result = await openRazorpay({
          key:      razorpay.keyId,
          amount:   razorpay.amount,
          currency: razorpay.currency,
          order_id: razorpay.orderId,
          name:     "Magic Momos",
          description: `Order ${order.orderNumber}`,
          prefill: {
            name:    form.name,
            contact: form.phone,
            email:   form.email || undefined,
          },
          theme: { color: "#E8284B" },
        });
      } catch (rpErr) {
        // User closed the modal or the payment failed inside Razorpay's UI.
        // Cancel the pending order server‑side so it does not appear in histories.
        try {
          await api.orders.cancel(order._id);
        } catch (cancelErr) {
          console.error('Failed to cancel order after payment abort:', cancelErr);
        }
        // Do not clear the cart or navigate away; show error message on checkout page.
        setPlaceError(
          rpErr.cancelled
            ? 'Payment was not completed. Please try again or choose another payment method.'
            : (rpErr.message || 'Payment failed. Please try again.')
        );
        return;
      }

      // ── Payment succeeded in the modal — now verify server-side ────────────
      setPaymentStage("verifying");
      const { order: verifiedOrder } = await api.orders.verifyPayment(result);

      clearCart();
      navigate("success", {
        ...verifiedOrder,
        delivery:   verifiedOrder.deliveryCharge,
        grandTotal: verifiedOrder.total,
      });
    } catch (err) {
      setPlaceError(err.message || "Something went wrong placing your order. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setPlacing(false);
      setPaymentStage(null);
    }
  };

  if (items.length === 0) return null; // brief flash before redirect effect fires

  const inputClass = (field) => `
    w-full pl-11 pr-4 py-3.5 bg-white border-2 rounded-xl
    font-body text-sm text-mm-cream placeholder:text-mm-muted
    focus:outline-none transition-all duration-200
    ${errors[field]
      ? "border-red-400 focus:border-red-500"
      : focused === field
        ? "border-mm-red/60 shadow-[0_0_0_3px_rgba(232,40,75,0.10)]"
        : "border-mm-border hover:border-mm-red/30"
    }
  `;

  return (
    <div className={`min-h-screen bg-mm-black ${isNative ? "pb-24" : ""}`}>
      <Header />

      {/* ── page hero ── */}
      <section className="relative bg-mm-card2 border-b border-mm-border overflow-hidden pt-20 sm:pt-28 pb-6 sm:pb-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-[380px] h-[380px] rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, rgba(232,40,75,0.08) 0%, transparent 65%)" }} />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8">
          <p className="font-body text-mm-red text-xs tracking-[0.3em] uppercase font-600 mb-3">
            — Almost there —
          </p>
          <h1 className="font-display text-3xl sm:text-5xl text-mm-cream tracking-tight leading-none mb-4 sm:mb-5">
            CHECKOUT
          </h1>

          {/* step indicator */}
          <div className="flex items-center gap-3">
            {[
              { n: 1, label: "Delivery Details" },
              { n: 2, label: "Review & Pay"     },
            ].map(({ n, label }, i) => (
              <div key={n} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center
                                  font-body text-xs font-800 transition-all duration-300
                                  ${step >= n
                                    ? "bg-mm-red text-white shadow-[0_2px_10px_rgba(232,40,75,0.4)]"
                                    : "bg-mm-card2 border border-mm-border text-mm-muted"}`}>
                    {step > n ? <CheckCircle size={13} /> : n}
                  </div>
                  <span className={`font-body text-sm font-600 transition-colors
                                    ${step >= n ? "text-mm-cream" : "text-mm-muted"}`}>
                    {label}
                  </span>
                </div>
                {i === 0 && <div className="w-10 h-px bg-mm-border" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── main content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 sm:gap-8 items-start">

          {/* ── LEFT: form steps ── */}
          <div>
            <AnimatePresence>
              {placeError && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 bg-red-50 border border-red-200
                             rounded-xl px-4 py-3 mb-5 overflow-hidden"
                >
                  <AlertCircle size={15} className="text-red-500 shrink-0" />
                  <p className="font-body text-sm text-red-700">{placeError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  {/* contact info */}
                  <div className="bg-white border border-mm-border rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card">
                    <h2 className="font-display text-xl sm:text-2xl text-mm-cream mb-5 flex items-center gap-2.5">
                      <User size={18} className="text-mm-red" />
                      Contact Information
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block font-body text-xs font-700 text-mm-cream
                                          uppercase tracking-wider mb-1.5">Full Name *</label>
                        <div className="relative">
                          <User size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none
                            ${focused === "name" ? "text-mm-red" : "text-mm-muted"}`} />
                          <input
                            type="text" name="name" value={form.name}
                            placeholder="Raju Sharma"
                            className={inputClass("name")}
                            onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                            onChange={handleChange}
                          />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1 font-body">{errors.name}</p>}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-body text-xs font-700 text-mm-cream
                                            uppercase tracking-wider mb-1.5">Phone *</label>
                          <div className="relative">
                            <Phone size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none
                              ${focused === "phone" ? "text-mm-red" : "text-mm-muted"}`} />
                            <input
                              type="tel" name="phone" value={form.phone}
                              placeholder="98765 43210"
                              className={inputClass("phone")}
                              onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
                              onChange={handleChange}
                            />
                          </div>
                          {errors.phone && <p className="text-red-500 text-xs mt-1 font-body">{errors.phone}</p>}
                        </div>

                        <div>
                          <label className="block font-body text-xs font-700 text-mm-cream
                                            uppercase tracking-wider mb-1.5">Email (optional)</label>
                          <div className="relative">
                            <Mail size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none
                              ${focused === "email" ? "text-mm-red" : "text-mm-muted"}`} />
                            <input
                              type="email" name="email" value={form.email}
                              placeholder="you@email.com"
                              className={inputClass("email")}
                              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                              onChange={handleChange}
                            />
                          </div>
                          {errors.email && <p className="text-red-500 text-xs mt-1 font-body">{errors.email}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* delivery address */}
                  <div className="bg-white border border-mm-border rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card">
                    <h2 className="font-display text-xl sm:text-2xl text-mm-cream mb-5 flex items-center gap-2.5">
                      <MapPin size={18} className="text-mm-red" />
                      Delivery Address
                    </h2>

                    <div className="space-y-4">
                      {/* ── Location selector trigger ── */}
                      <motion.button
                        type="button"
                        onClick={() => setAddressModalOpen(true)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2
                                    text-left transition-all duration-200
                                    ${
                                      confirmedAddr
                                        ? confirmedAddr.inRange === false
                                          ? "border-red-300 bg-red-50"
                                          : "border-mm-red/40 bg-mm-red/5"
                                        : errors.location
                                          ? "border-red-300 bg-red-50"
                                          : "border-mm-border hover:border-mm-red/30 bg-mm-card2"
                                    }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                        ${
                                          confirmedAddr
                                            ? confirmedAddr.inRange === false ? "bg-red-100" : "bg-mm-red/10"
                                            : "bg-mm-card2 border border-mm-border"
                                        }`}>
                          <MapPin size={18} className={confirmedAddr ? (confirmedAddr.inRange === false ? "text-red-500" : "text-mm-red") : "text-mm-muted"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          {confirmedAddr ? (
                            <>
                              <p className="font-body text-sm font-700 text-mm-cream">
                                {confirmedAddr.inRange === false ? "⚠️ Outside delivery zone" : "📍 Location confirmed"}
                              </p>
                              <p className="font-body text-xs text-mm-muted truncate mt-0.5">
                                {[confirmedAddr.street, confirmedAddr.city, confirmedAddr.pincode].filter(Boolean).join(", ") || "Location set on map"}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-body text-sm font-700 text-mm-cream">Select Delivery Location</p>
                              <p className="font-body text-xs text-mm-muted mt-0.5">Search, use GPS, or pick from saved addresses</p>
                            </>
                          )}
                        </div>
                        <span className="font-body text-xs font-700 text-mm-red shrink-0">
                          {confirmedAddr ? "Change" : "Select"}
                        </span>
                      </motion.button>
                      {errors.location && <p className="text-red-500 text-xs mt-1 font-body">{errors.location}</p>}

                      {/* Address selector modal */}
                      <AddressSelectorModal
                        isOpen={addressModalOpen}
                        onClose={() => setAddressModalOpen(false)}
                        onConfirm={handleModalConfirm}
                        savedAddresses={user?.addresses || []}
                      />

                      {/* Fine-tune fields — pre-filled by modal, editable */}
                      <div>
                        <label className="block font-body text-xs font-700 text-mm-cream
                                          uppercase tracking-wider mb-1.5">Street / House No. *</label>
                        <div className="relative">
                          <Home size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none
                            ${focused === "street" ? "text-mm-red" : "text-mm-muted"}`} />
                          <input
                            type="text" name="street" value={form.street}
                            placeholder="House no., Street, Landmark"
                            className={inputClass("street")}
                            onFocus={() => setFocused("street")} onBlur={() => setFocused(null)}
                            onChange={handleChange}
                          />
                        </div>
                        {errors.street && <p className="text-red-500 text-xs mt-1 font-body">{errors.street}</p>}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-body text-xs font-700 text-mm-cream
                                            uppercase tracking-wider mb-1.5">City</label>
                          <input
                            type="text" name="city" value={form.city}
                            placeholder="New Delhi"
                            className={inputClass("city").replace("pl-11", "pl-4")}
                            onFocus={() => setFocused("city")} onBlur={() => setFocused(null)}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label className="block font-body text-xs font-700 text-mm-cream
                                            uppercase tracking-wider mb-1.5">Pincode *</label>
                          <input
                            type="text" name="pincode" value={form.pincode}
                            placeholder="110024" maxLength={6}
                            className={inputClass("pincode").replace("pl-11", "pl-4")}
                            onFocus={() => setFocused("pincode")} onBlur={() => setFocused(null)}
                            onChange={(e) => handleChange({ target: { name: "pincode", value: e.target.value.replace(/\D/g, "") } })}
                          />
                          {errors.pincode && <p className="text-red-500 text-xs mt-1 font-body">{errors.pincode}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block font-body text-xs font-700 text-mm-cream
                                          uppercase tracking-wider mb-1.5">
                          Delivery Instructions (optional)
                        </label>
                        <div className="relative">
                          <MessageSquare size={15} className="absolute left-4 top-4 text-mm-muted pointer-events-none" />
                          <textarea
                            name="instructions" value={form.instructions} rows={2}
                            placeholder="E.g. Ring the bell twice, leave at the door…"
                            className={inputClass("instructions") + " resize-none"}
                            onFocus={() => setFocused("instructions")} onBlur={() => setFocused(null)}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* zone warning */}
                  {confirmedAddr?.inRange === false && (
                    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200
                                    rounded-xl px-4 py-3">
                      <AlertCircle size={15} className="text-mm-red shrink-0" />
                      <p className="font-body text-sm text-mm-red">
                        This location is {Math.round((confirmedAddr.distance || 0) * 10) / 10} km away —
                        outside our delivery area. Please change your location.
                      </p>
                    </div>
                  )}

                  {isClosed && (
                    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200
                                    rounded-xl px-4 py-3">
                      <AlertCircle size={15} className="text-red-500 shrink-0" />
                      <p className="font-body text-sm text-red-700">
                        We are currently closed. Operational hours: {settings?.openTime || "11:00"} to {settings?.closeTime || "23:00"}.
                      </p>
                    </div>
                  )}

                  <motion.button
                    onClick={goToReview}
                    disabled={confirmedAddr?.inRange === false || isClosed}
                    whileHover={confirmedAddr?.inRange === false || isClosed ? {} : { scale: 1.02, boxShadow: "0 0 28px rgba(232,40,75,0.35)" }}
                    whileTap={confirmedAddr?.inRange === false || isClosed ? {} : { scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2
                               bg-mm-red hover:bg-red-600 text-white
                               py-4 rounded-xl font-body font-800 text-sm tracking-wide
                               transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-mm-red"
                  >
                    Continue to Payment
                    <ChevronRight size={16} />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  {/* delivery summary (editable shortcut) */}
                  <div className="bg-white border border-mm-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-lg text-mm-cream flex items-center gap-2">
                        <MapPin size={15} className="text-mm-red" />
                        Delivering To
                      </h3>
                      <button
                        onClick={goBack}
                        className="flex items-center gap-1 text-mm-red font-body text-xs font-700 hover:underline"
                      >
                        <Edit3 size={11} /> Edit
                      </button>
                    </div>
                    <p className="font-body text-sm text-mm-cream font-700">{form.name} · {form.phone}</p>
                    <p className="font-body text-sm text-mm-muted mt-0.5">
                      {form.street}, {form.city} – {form.pincode}
                    </p>
                    {form.instructions && (
                      <p className="font-body text-xs text-mm-muted mt-2 italic">
                        "{form.instructions}"
                      </p>
                    )}
                  </div>

                  {/* payment method */}
                  <div className="bg-white border border-mm-border rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card">
                    <h2 className="font-display text-xl sm:text-2xl text-mm-cream mb-5 flex items-center gap-2.5">
                      <Wallet size={18} className="text-mm-red" />
                      Payment Method
                    </h2>

                    <div className="space-y-3">
                      {PAYMENT_METHODS.map(({ id, icon: Icon, title, desc, accent, badge }) => {
                        const active = paymentMethod === id;
                        return (
                          <motion.button
                            key={id}
                            onClick={() => setPaymentMethod(id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2
                                        text-left transition-all duration-200
                                        ${active
                                          ? "border-mm-red bg-mm-red/5"
                                          : "border-mm-border hover:border-mm-red/30"}`}
                          >
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: accent + "18" }}
                            >
                              <Icon size={20} style={{ color: accent }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-body font-700 text-sm text-mm-cream">{title}</p>
                                {badge && (
                                  <span className="text-[10px] font-800 px-1.5 py-0.5 rounded-full
                                                   bg-mm-gold/20 text-amber-700">{badge}</span>
                                )}
                              </div>
                              <p className="font-body text-xs text-mm-muted mt-0.5">{desc}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                            shrink-0 transition-all duration-200
                                            ${active ? "border-mm-red" : "border-mm-border"}`}>
                              {active && (
                                <motion.div
                                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  className="w-2.5 h-2.5 rounded-full bg-mm-red"
                                />
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {paymentMethod === "online" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 flex items-center gap-2 bg-blue-50 border border-blue-100
                                   rounded-xl px-4 py-3 overflow-hidden"
                      >
                        <AlertCircle size={14} className="text-blue-600 shrink-0" />
                        <p className="font-body text-xs text-blue-700">
                          You'll be redirected to complete payment after placing the order.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={goBack}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1.5 border border-mm-border text-mm-cream/70
                                 hover:text-mm-cream hover:border-mm-red/30 px-5 py-4 rounded-xl
                                 font-body font-700 text-sm transition-all"
                    >
                      <ChevronLeft size={15} /> Back
                    </motion.button>

                    <motion.button
                      onClick={handlePlaceOrder}
                      disabled={placing || isClosed}
                      whileHover={placing || isClosed ? {} : { scale: 1.02, boxShadow: "0 0 28px rgba(232, 40, 75, 0.45)" }}
                      whileTap={placing || isClosed ? {} : { scale: 0.97 }}
                      className="flex-1 flex items-center justify-center gap-2.5
                                 bg-mm-red hover:bg-red-600 text-white
                                 py-4 rounded-xl font-body font-800 text-sm tracking-wide
                                 transition-all duration-200 disabled:opacity-60"
                    >
                      {placing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                          />
                          Placing Order…
                        </>
                      ) : (
                        <>Place Order · ₹{total} <span className="text-base">🚀</span></>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: order summary (sticky) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:sticky lg:top-28 order-first lg:order-last"
          >
            <div className="bg-white border border-mm-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-card">
              <h3 className="font-display text-xl text-mm-cream mb-5 flex items-center gap-2">
                <ShoppingBag size={16} className="text-mm-red" />
                Order Summary
              </h3>

              <div className="space-y-3 mb-5 max-h-[280px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-mm-red/10 flex items-center justify-center text-[10px] text-mm-red font-bold shrink-0">
                        {item.name ? item.name.substring(0, 2).toUpperCase() : "MM"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-mm-cream font-600 truncate">{item.name}</p>
                      <p className="font-body text-xs text-mm-muted">Qty {item.qty}</p>
                    </div>
                    <p className="font-display text-sm text-mm-cream shrink-0">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm font-body pt-4 border-t border-mm-border">
                <div className="flex justify-between">
                  <span className="text-mm-muted">Subtotal</span>
                  <span className="text-mm-cream font-700">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1 font-600">
                      <Tag size={11} /> {coupon?.code}
                    </span>
                    <span className="font-700">− ₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-mm-muted">Delivery</span>
                  {deliveryFee === 0
                    ? <span className="text-green-600 font-700">FREE</span>
                    : <span className="text-mm-cream font-700">₹{deliveryFee}</span>}
                </div>
                <div className="flex justify-between pt-2 border-t border-mm-border">
                  <span className="font-800 text-mm-cream text-base">Total</span>
                  <span className="font-display text-xl text-mm-red">₹{total}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5 bg-mm-card2 rounded-xl px-3.5 py-2.5">
                <span className="text-base">🛵</span>
                <p className="font-body text-xs text-mm-muted">
                  Estimated delivery: <span className="text-mm-cream font-700">20–30 mins</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}