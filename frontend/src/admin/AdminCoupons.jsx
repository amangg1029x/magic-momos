import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Loader2, Tag, Calendar, DollarSign, Power } from "lucide-react";
import api from "../services/api";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    expiryDate: "",
    active: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.admin.coupons.getAll();
      setCoupons(res.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : 0,
      };
      await api.admin.coupons.create(payload);
      setSuccess("Coupon created successfully!");
      setForm({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minOrderValue: "",
        maxDiscount: "",
        expiryDate: "",
        active: true,
      });
      setTimeout(() => {
        setModalOpen(false);
        setSuccess("");
      }, 1500);
      fetchCoupons();
    } catch (err) {
      setError(err.message || "Failed to create coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.admin.coupons.delete(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <h2 className="font-body text-sm font-600 text-gray-500">Manage promotional offers & coupon codes.</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#E8284B] hover:bg-[#d11f40] text-white
                     font-body font-600 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={26} className="animate-spin text-[#E8284B]" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Tag className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="font-body text-sm text-gray-400">No coupons active. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const hasExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
            return (
              <motion.div
                key={coupon._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border rounded-2xl p-5 shadow-sm relative flex flex-col justify-between
                            ${!coupon.active || hasExpired ? "border-red-100 opacity-60 bg-gray-50/50" : "border-gray-100"}`}
              >
                {/* Coupon Header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display tracking-wider text-lg text-mm-cream bg-[#FFF5DB] border border-[#F5A623]/30 px-3 py-1 rounded-xl">
                      🎟️ {coupon.code}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(coupon._id, coupon.code)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Coupon Details */}
                  <div className="space-y-1.5 font-body text-xs text-gray-500 mb-4">
                    <p className="flex items-center gap-2">
                      <span className="font-700 text-gray-700">Discount:</span>
                      <span className="text-mm-red font-700 text-sm">
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      </span>
                    </p>
                    {coupon.minOrderValue > 0 && (
                      <p>Min Order Value: <span className="font-600 text-gray-700">₹{coupon.minOrderValue}</span></p>
                    )}
                    {coupon.discountType === "percentage" && coupon.maxDiscount > 0 && (
                      <p>Max Cap: <span className="font-600 text-gray-700">₹{coupon.maxDiscount}</span></p>
                    )}
                    {coupon.expiryDate ? (
                      <p className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                        <Calendar size={11} /> Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-400 mt-1">No Expiry Date</p>
                    )}
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                  <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full uppercase
                                  ${hasExpired ? "bg-red-50 text-red-600" : coupon.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {hasExpired ? "Expired" : coupon.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.form
              onSubmit={handleCreate}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-display text-lg text-gray-900 tracking-wide">CREATE PROMO CODE</h3>
                <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl">{error}</div>}
              {success && <div className="bg-green-50 text-green-700 text-xs p-3 rounded-xl">{success}</div>}

              <div className="space-y-3">
                <div>
                  <label className="font-body text-xs font-600 text-gray-500 mb-1 block">Coupon Code *</label>
                  <input
                    type="text" required value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="E.g., MAGIC50"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-body text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#E8284B]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-body text-xs font-600 text-gray-500 mb-1 block">Discount Type</label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#E8284B]/20"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Cash (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-xs font-600 text-gray-500 mb-1 block">Value *</label>
                    <input
                      type="number" required min="1" value={form.discountValue}
                      onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                      placeholder="E.g., 10 or 50"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#E8284B]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-body text-xs font-600 text-gray-500 mb-1 block">Min Order Value (₹)</label>
                    <input
                      type="number" min="0" value={form.minOrderValue}
                      onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                      placeholder="E.g., 199"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#E8284B]/20"
                    />
                  </div>
                  <div>
                    <label className="font-body text-xs font-600 text-gray-500 mb-1 block">Max Discount Cap (₹)</label>
                    <input
                      type="number" min="0" value={form.maxDiscount}
                      disabled={form.discountType === "flat"}
                      onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                      placeholder={form.discountType === "flat" ? "N/A" : "E.g., 100"}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#E8284B]/20 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-body text-xs font-600 text-gray-500 mb-1 block">Expiry Date</label>
                  <input
                    type="date" value={form.expiryDate}
                    onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#E8284B]/20"
                  />
                </div>

                <label className="flex items-center gap-2 font-body text-sm text-gray-600 pt-2">
                  <input
                    type="checkbox" checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#E8284B]"
                  />
                  Active & eligible immediately
                </label>
              </div>

              <button
                type="submit" disabled={saving}
                className="w-full bg-[#E8284B] hover:bg-[#d11f40] text-white font-body font-700 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-4 cursor-pointer"
              >
                {saving ? <Loader2 size={17} className="animate-spin" /> : "Create Coupon"}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
