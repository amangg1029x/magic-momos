import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Info } from "lucide-react";

const DEFAULTS = {
  businessName: "Magic Momos",
  phone: "+91 98765 43210",
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
  const [form, setForm] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    // NOTE: no backend settings endpoint exists yet — this persists to
    // local state only for now. Wire this up once a settings model/route
    // is added on the backend.
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">

      <div className="flex items-start gap-2.5 bg-amber-50 text-amber-700 font-body text-xs
                      px-4 py-3 rounded-xl">
        <Info size={15} className="shrink-0 mt-0.5" />
        These settings aren't connected to the backend yet — changes apply
        only to this session. Ask your developer to add a settings endpoint
        to persist them.
      </div>

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

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="flex items-center gap-2 bg-[#E8284B] hover:bg-[#d11f40] text-white
                     font-body font-700 text-sm px-5 py-3 rounded-xl transition-colors"
        >
          <Save size={16} /> Save Changes
        </button>
        {saved && (
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="font-body text-sm text-green-600"
          >
            Saved for this session ✓
          </motion.span>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-display text-base text-gray-900 mb-4 tracking-wide">{title.toUpperCase()}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="font-body text-sm text-gray-600 shrink-0">{label}</label>
      <div className="w-56">{children}</div>
    </div>
  );
}

function Input({ value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-body text-sm
                 focus:outline-none focus:ring-2 focus:ring-[#E8284B]/30 focus:border-[#E8284B]"
    />
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body text-sm text-gray-600">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition-colors ${checked ? "bg-[#E8284B]" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                      ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}