import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Info, AlertCircle, Loader2 } from "lucide-react";
import api from "../services/api";

const DEFAULTS = {
  businessName: "Magic Momos",
  phone: "+91 70422 89004",
  email: "hello@magicmomos.in",
  address: "Lajpat Nagar, New Delhi",
  deliveryFee: 30,
  freeDeliveryThreshold: 199,
  openTime: "11:00",
  closeTime: "23:00",
  codEnabled: true,
  onlinePaymentEnabled: false,
};

export default function AdminSettings() {
  // --- General settings ---
  const [form, setForm] = useState(DEFAULTS);
  const [generalLoading, setGeneralLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [saved, setSaved] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Load general settings on mount
  useEffect(() => {
    let active = true;
    (async () => {
      setGeneralLoading(true);
      setGeneralError("");
      try {
        const res = await api.admin.getSettings();
        if (res.success && res.settings && active) {
          // Merge with defaults to ensure all expected properties are present
          setForm({
            ...DEFAULTS,
            ...res.settings,
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        if (active) setGeneralError(err.message || "Failed to load store configurations");
      } finally {
        if (active) setGeneralLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSaved(false);
    setGeneralLoading(true);

    try {
      const res = await api.admin.updateSettings(form);
      if (res.success && res.settings) {
        setForm({
          ...DEFAULTS,
          ...res.settings,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      setGeneralError(err.message || "Failed to save settings");
    } finally {
      setGeneralLoading(false);
    }
  };

  // --- Delivery Partner credentials ---
  const [delEmail, setDelEmail] = useState("");
  const [delPassword, setDelPassword] = useState("");
  const [delConfirmPw, setDelConfirmPw] = useState("");
  const [delLoading, setDelLoading] = useState(false);
  const [delError, setDelError] = useState("");
  const [delSaved, setDelSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.admin.getDeliveryCredentials();
        if (res.success && res.email && active) {
          setDelEmail(res.email);
        }
      } catch (err) {
        console.error("Failed to load delivery credentials:", err);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSaveDeliveryCredentials = async (e) => {
    e.preventDefault();
    setDelError("");
    setDelSaved(false);

    if (delPassword && delPassword !== delConfirmPw) {
      setDelError("Passwords do not match");
      return;
    }

    setDelLoading(true);
    try {
      const payload = { email: delEmail };
      if (delPassword) payload.password = delPassword;

      await api.admin.updateDeliveryCredentials(payload);
      setDelSaved(true);
      setDelPassword("");
      setDelConfirmPw("");
      setTimeout(() => setDelSaved(false), 2500);
    } catch (err) {
      setDelError(err.message || "Failed to update credentials");
    } finally {
      setDelLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* General Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {generalError && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-body px-4 py-3 rounded-xl">
            <AlertCircle size={15} className="shrink-0" />
            {generalError}
          </div>
        )}

        <Section title="Business Info">
          <Row label="Business Name">
            <Input value={form.businessName} onChange={(v) => update("businessName", v)} />
          </Row>
          <Row label="Phone">
            <Input value={form.phone} onChange={(v) => update("phone", v)} />
          </Row>
          <Row label="Email">
            <Input value={form.email} onChange={(v) => update("email", v)} type="email" />
          </Row>
          <Row label="Address">
            <Input value={form.address} onChange={(v) => update("address", v)} />
          </Row>
        </Section>

        <Section title="Delivery">
          <Row label="Delivery Fee (₹)">
            <Input value={form.deliveryFee} onChange={(v) => update("deliveryFee", v)} type="number" />
          </Row>
          <Row label="Free Delivery Above (₹)">
            <Input value={form.freeDeliveryThreshold} onChange={(v) => update("freeDeliveryThreshold", v)} type="number" />
          </Row>
        </Section>

        <Section title="Hours">
          <Row label="Opens At">
            <Input value={form.openTime} onChange={(v) => update("openTime", v)} type="time" />
          </Row>
          <Row label="Closes At">
            <Input value={form.closeTime} onChange={(v) => update("closeTime", v)} type="time" />
          </Row>
        </Section>

        <Section title="Payment Methods">
          <Toggle label="Cash on Delivery" checked={form.codEnabled} onChange={(v) => update("codEnabled", v)} />
          <Toggle label="Online Payment" checked={form.onlinePaymentEnabled} onChange={(v) => update("onlinePaymentEnabled", v)} />
        </Section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={generalLoading}
            className="flex items-center gap-2 bg-[#E8284B] hover:bg-[#d11f40] text-white
                       font-body font-700 text-sm px-5 py-3 rounded-xl transition-colors cursor-pointer
                       w-full sm:w-auto justify-center disabled:opacity-60"
          >
            {generalLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
          </button>
          {saved && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-body text-sm text-green-600"
            >
              Settings saved successfully! ✓
            </motion.span>
          )}
        </div>
      </form>

      {/* Delivery Partner Credentials Form */}
      <form onSubmit={handleSaveDeliveryCredentials} className="space-y-6 max-w-2xl bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
        <div>
          <h3 className="font-display text-base text-gray-900 mb-2 tracking-wide">DELIVERY PARTNER CREDENTIALS</h3>
          <p className="font-body text-xs text-gray-400">Configure credentials for the delivery partner login portal.</p>
        </div>

        {delError && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-body px-4 py-3 rounded-xl">
            <AlertCircle size={15} className="shrink-0" />
            {delError}
          </div>
        )}

        <div className="space-y-4">
          <Row label="Login Email">
            <Input value={delEmail} onChange={setDelEmail} type="email" />
          </Row>
          <Row label="New Password">
            <Input value={delPassword} onChange={setDelPassword} type="password" placeholder="•••••••• (leave blank to keep current)" />
          </Row>
          {delPassword && (
            <Row label="Confirm Password">
              <Input value={delConfirmPw} onChange={setDelConfirmPw} type="password" placeholder="Confirm new password" />
            </Row>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={delLoading || !delEmail}
            className="flex items-center gap-2 bg-[#E8284B] hover:bg-[#d11f40] text-white
                       font-body font-700 text-sm px-5 py-3 rounded-xl transition-colors disabled:opacity-60 cursor-pointer
                       w-full sm:w-auto justify-center"
          >
            {delLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Update Credentials
          </button>
          {delSaved && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-body text-sm text-green-600"
            >
              Credentials updated successfully! ✓
            </motion.span>
          )}
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
      <h3 className="font-display text-base text-gray-900 mb-4 tracking-wide">{title.toUpperCase()}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────
// Was a fixed-width (w-56) flex row that overflowed on narrow phones —
// label + 224px input + gap couldn't fit under ~360px. Now stacks label
// above the field on mobile (flex-col) and returns to a side-by-side row
// from the sm breakpoint up, where there's room for it.
function Row({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
      <label className="font-body text-sm text-gray-600 shrink-0">{label}</label>
      <div className="w-full sm:w-56">{children}</div>
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder = "" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-body text-sm
                 focus:outline-none focus:ring-2 focus:ring-[#E8284B]/30 focus:border-[#E8284B]"
    />
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-body text-sm text-gray-600">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${checked ? "bg-[#E8284B]" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                      ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}