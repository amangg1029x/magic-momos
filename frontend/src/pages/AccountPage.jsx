import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut, ShoppingBag, Phone, Eye, EyeOff, Lock, Mail, Edit3, Check, X, Home, CheckCircle, AlertCircle, MapPin, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNav } from "../context/NavigationContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../services/api";
import OrdersTab from "../components/orders/OrdersTab";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "addresses", label: "Addresses", icon: Home },
  { id: "settings", label: "Settings", icon: Settings }
];


// ── Profile tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user, updateUser }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, phone: user.phone || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const res = await api.auth.update(form);
      updateUser(res.user);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* avatar card */}
      <div className="bg-white border border-mm-border rounded-2xl p-6
                      flex items-center gap-5 shadow-card">
        <div className="w-16 h-16 rounded-2xl bg-mm-red/10 border border-mm-red/20
                        flex items-center justify-center text-3xl shrink-0 select-none">
          {user.name?.[0]?.toUpperCase() ?? "👤"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-2xl text-mm-cream truncate">{user.name}</p>
          <p className="font-body text-sm text-mm-muted">{user.email}</p>
          <p className="font-body text-xs text-mm-muted mt-0.5">
            Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* editable info */}
      <div className="bg-white border border-mm-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-mm-cream">Personal Info</h3>
          {!editing ? (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-mm-red font-body text-xs font-700
                         hover:underline"
            >
              <Edit3 size={13} /> Edit
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => { setEditing(false); setForm({ name: user.name, phone: user.phone || "" }); }}
                className="w-7 h-7 rounded-lg bg-mm-card2 border border-mm-border
                           flex items-center justify-center text-mm-muted hover:text-mm-red"
              >
                <X size={13} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleSave}
                disabled={saving}
                className="w-7 h-7 rounded-lg bg-mm-red text-white
                           flex items-center justify-center hover:bg-red-600 disabled:opacity-60"
              >
                {saving
                  ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3 rounded-full border-2 border-white border-t-transparent" />
                  : <Check size={13} />
                }
              </motion.button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-4">
              <CheckCircle size={13} className="text-green-600" />
              <p className="font-body text-xs text-green-700 font-700">Profile updated!</p>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
              <AlertCircle size={13} className="text-red-500" />
              <p className="font-body text-xs text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {[
            { icon: User, label: "Full Name", field: "name", type: "text", placeholder: "Your name" },
            { icon: Phone, label: "Phone", field: "phone", type: "tel", placeholder: "+91 98765 43210" },
          ].map(({ icon: Icon, label, field, type, placeholder }) => (
            <div key={field}>
              <label className="block font-body text-xs font-700 text-mm-muted
                                uppercase tracking-wider mb-1.5">{label}</label>
              <div className="relative">
                <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mm-muted pointer-events-none" />
                <input
                  type={type}
                  value={form[field]}
                  disabled={!editing}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className={`w-full pl-9 pr-4 py-3 rounded-xl border font-body text-sm
                    text-mm-cream placeholder:text-mm-muted transition-all duration-200
                    focus:outline-none
                    ${editing
                      ? "bg-white border-mm-border hover:border-mm-red/30 focus:border-mm-red/60 focus:shadow-[0_0_0_3px_rgba(232,40,75,0.08)]"
                      : "bg-mm-card2 border-transparent text-mm-cream/80 cursor-default"
                    }`}
                />
              </div>
            </div>
          ))}

          {/* email (non-editable) */}
          <div>
            <label className="block font-body text-xs font-700 text-mm-muted
                              uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mm-muted pointer-events-none" />
              <input
                type="email" value={user.email} disabled
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-transparent
                           bg-mm-card2 font-body text-sm text-mm-cream/60 cursor-default"
              />
            </div>
            <p className="font-body text-[11px] text-mm-muted mt-1">Email cannot be changed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Addresses tab ─────────────────────────────────────────────────────────────
function AddressesTab({ user, updateUser }) {
  const [addresses, setAddresses] = useState(user.addresses || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ street: "", city: "", pincode: "", label: "", lat: undefined, lng: undefined });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const startEdit = (idx) => {
    setEditingIndex(idx);
    setForm(addresses[idx]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setAdding(false);
    setForm({ street: "", city: "", pincode: "", label: "", lat: undefined, lng: undefined });
    setError("");
  };


  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const newAddresses = editingIndex !== null
        ? addresses.map((a, i) => i === editingIndex ? form : a)
        : [...addresses, form];
      const res = await api.auth.update({ addresses: newAddresses });
      updateUser(res.user);
      setAddresses(res.user.addresses || []);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      cancelEdit();
    } catch (err) {
      setError(err.message || "Failed to save addresses");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (idx) => {
    setSaving(true);
    setError("");
    try {
      const newAddresses = addresses.filter((_, i) => i !== idx);
      const res = await api.auth.update({ addresses: newAddresses });
      updateUser(res.user);
      setAddresses(res.user.addresses || []);
    } catch (err) {
      setError(err.message || "Failed to delete address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* List existing addresses */}
      {addresses.length === 0 && <p className="text-mm-muted">No saved addresses.</p>}
      {addresses.map((addr, idx) => (
        <div key={idx} className="bg-white border border-mm-border rounded-2xl p-6 shadow-card flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="font-body font-700 text-mm-cream"><MapPin size={14} className="mr-2 text-mm-muted"/>{addr.label || `Address ${idx + 1}`}</p>
            <p className="text-sm text-mm-muted">{addr.street}, {addr.city} - {addr.pincode}</p>
          </div>
          <div className="flex gap-2 items-center">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => startEdit(idx)} className="p-2 text-mm-cream hover:text-mm-red">
              <Edit3 size={16} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(idx)} className="p-2 text-mm-cream hover:text-red-600" disabled={saving}>
              <Trash2 size={16} />
            </motion.button>
          </div>
        </div>
      ))}
      {/* Add new address button */}
      {!adding && editingIndex === null && (
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-mm-red text-white rounded-xl">
          <Plus size={16} /> Add New Address
        </motion.button>
      )}
      {/* Edit / Add form */}
      {(editingIndex !== null || adding) && (
        <div className="bg-white border border-mm-border rounded-2xl p-6 shadow-card">
          <h3 className="font-display text-xl text-mm-cream mb-4">{editingIndex !== null ? "Edit Address" : "Add New Address"}</h3>
          <div className="space-y-4">
            <input name="label" placeholder="Label (e.g., Home, Office)" value={form.label} onChange={handleChange} className={`w-full p-2 rounded border font-body text-sm
                    text-mm-cream placeholder:text-mm-muted transition-all duration-200
                    focus:outline-none focus:border-mm-red/60 focus:shadow-[0_0_0_3px_rgba(232,40,75,0.08)]
                    ${saving ? "bg-mm-card2 border-transparent" : "bg-white border-mm-border hover:border-mm-red/30"}`}
              />
            <input name="street" placeholder="Street" value={form.street} onChange={handleChange} className={`w-full p-2 rounded border font-body text-sm
                    text-mm-cream placeholder:text-mm-muted transition-all duration-200
                    focus:outline-none focus:border-mm-red/60 focus:shadow-[0_0_0_3px_rgba(232,40,75,0.08)]
                    ${saving ? "bg-mm-card2 border-transparent" : "bg-white border-mm-border hover:border-mm-red/30"}`}
              />
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} className={`w-full p-2 rounded border font-body text-sm
                    text-mm-cream placeholder:text-mm-muted transition-all duration-200
                    focus:outline-none focus:border-mm-red/60 focus:shadow-[0_0_0_3px_rgba(232,40,75,0.08)]
                    ${saving ? "bg-mm-card2 border-transparent" : "bg-white border-mm-border hover:border-mm-red/30"}`}
              />
            <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} className={`w-full p-2 rounded border font-body text-sm
                    text-mm-cream placeholder:text-mm-muted transition-all duration-200
                    focus:outline-none focus:border-mm-red/60 focus:shadow-[0_0_0_3px_rgba(232,40,75,0.08)]
                    ${saving ? "bg-mm-card2 border-transparent" : "bg-white border-mm-border hover:border-mm-red/30"}`}
              />
          </div>
          <div className="flex gap-4 mt-4">
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving} className="px-4 py-2 bg-mm-red text-white rounded">
              {saving ? "Saving..." : "Save"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={cancelEdit} className="px-4 py-2 bg-mm-card2 text-mm-cream rounded border">
              Cancel
            </motion.button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-4">
            <CheckCircle size={13} className="text-green-600" />
            <p className="font-body text-xs text-green-700 font-700">Address saved!</p>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
            <AlertCircle size={13} className="text-red-500" />
            <p className="font-body text-xs text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
}

// ── Settings tab ─────────────────────────────────────────────────────────────
function SettingsTab({ user }) {
  const { logout } = useAuth();
  const { navigate } = useNav();

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError("New passwords don't match."); return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("Password must be at least 6 characters."); return;
    }
    setPwLoading(true); setPwError("");
    try {
      await api.auth.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess(true);
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.message || "Password change failed.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("home"); };

  return (
    <div className="space-y-5">
      {/* change password */}
      <div className="bg-white border border-mm-border rounded-2xl p-6 shadow-card">
        <h3 className="font-display text-xl text-mm-cream mb-5">Change Password</h3>

        <AnimatePresence>
          {pwSuccess && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-4">
              <CheckCircle size={14} className="text-green-600" />
              <p className="font-body text-sm text-green-700 font-700">Password changed successfully!</p>
            </motion.div>
          )}
          {pwError && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
              <AlertCircle size={14} className="text-red-500" />
              <p className="font-body text-sm text-red-700">{pwError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { key: "current", label: "Current Password", field: "currentPassword" },
            { key: "new", label: "New Password", field: "newPassword" },
            { key: "confirm", label: "Confirm New Password", field: "confirm" },
          ].map(({ key, label, field }) => (
            <div key={field}>
              <label className="block font-body text-xs font-700 text-mm-muted
                                uppercase tracking-wider mb-1.5">{label}</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mm-muted pointer-events-none" />
                <input
                  type={showPw[key] ? "text" : "password"}
                  value={pwForm[field]}
                  onChange={(e) => { setPwForm((f) => ({ ...f, [field]: e.target.value })); setPwError(""); }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 rounded-xl border border-mm-border bg-white
                             font-body text-sm text-mm-cream placeholder:text-mm-muted
                             focus:outline-none focus:border-mm-red/60
                             focus:shadow-[0_0_0_3px_rgba(232,40,75,0.08)]
                             hover:border-mm-red/30 transition-all duration-200"
                />
                <button type="button"
                  onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mm-muted hover:text-mm-cream">
                  {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}

          <motion.button
            type="submit"
            disabled={pwLoading}
            whileHover={{ scale: pwLoading ? 1 : 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 bg-mm-red hover:bg-red-600
                       text-white py-3.5 rounded-xl font-body font-700 text-sm
                       transition-colors disabled:opacity-60"
          >
            {pwLoading ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" />Saving…</>
            ) : "Update Password"}
          </motion.button>
        </form>
      </div>

      {/* danger zone */}
      <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-card">
        <h3 className="font-display text-xl text-mm-cream mb-2">Account Actions</h3>
        <p className="font-body text-sm text-mm-muted mb-5">
          Signed in as <span className="text-mm-cream font-700">{user.email}</span>
        </p>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(232,40,75,0.15)" }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="flex items-center gap-2.5 border border-red-200 text-red-600
                     hover:bg-red-50 px-5 py-3 rounded-xl font-body font-700 text-sm
                     transition-all duration-200"
        >
          <LogOut size={15} /> Sign Out
        </motion.button>
      </div>
    </div>
  );
}

// ── Main AccountPage ─────────────────────────────────────────────────────────
export default function AccountPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const { isNative } = useNav();

  return (
    <div className="min-h-screen bg-mm-black">
      <Header />

      {/* page hero */}
      <section className="relative bg-mm-card2 border-b border-mm-border overflow-hidden pt-24 sm:pt-32 pb-6 sm:pb-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-[380px] h-[380px] rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, rgba(232,40,75,0.08) 0%, transparent 65%)" }} />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8">
          <p className="font-body text-mm-red text-xs tracking-[0.3em] uppercase font-600 mb-3">
            — My Account —
          </p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-mm-red/10 border border-mm-red/20
                            flex items-center justify-center text-2xl select-none shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "👤"}
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-4xl text-mm-cream leading-none tracking-tight">
                {user?.name}
              </h1>
              <p className="font-body text-sm text-mm-muted mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
          <div className="grid lg:grid-cols-[220px_1fr] gap-6 sm:gap-8">

          {/* sidebar tabs — horizontal scroll on mobile, vertical column on desktop */}
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                onClick={() => setActiveTab(id)}
                whileHover={{ x: activeTab === id ? 0 : 3 }}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-body font-700 text-sm
                            text-left transition-all duration-200 shrink-0 lg:w-full
                            ${activeTab === id
                  ? "bg-mm-red text-white shadow-[0_4px_14px_rgba(232,40,75,0.30)]"
                  : "text-mm-muted hover:text-mm-cream hover:bg-mm-card bg-mm-card2 border border-mm-border lg:bg-transparent lg:border-0"
                }`}
              >
                <Icon size={15} />
                {label}
              </motion.button>
            ))}
          </nav>

          {/* tab content */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === "profile" && <ProfileTab user={user} updateUser={updateUser} />}
                {activeTab === "orders" && <OrdersTab />}
                {activeTab === "settings" && <SettingsTab user={user} />}
                {activeTab === "addresses" && <AddressesTab user={user} updateUser={updateUser} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {!isNative && <Footer />}
    </div>
  );
}