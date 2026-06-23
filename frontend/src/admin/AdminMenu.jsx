import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Loader2, Search, Power } from "lucide-react";
import api from "../services/api";

const CATEGORIES = ["momos", "rolls", "snacks", "sides", "drinks"];

const emptyForm = {
  itemId: "", name: "", category: "momos", price: "",
  halfPrice: "", desc: "", imageUrl: "", available: true, tag: "",
};

export default function AdminMenu() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(emptyForm);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.menu.getAll();
      setItems(res.items || res.menuItems || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      itemId: item.itemId ?? "",
      name: item.name ?? "",
      category: item.category ?? "momos",
      price: item.price ?? "",
      halfPrice: item.halfPrice ?? "",
      desc: item.desc ?? item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      available: item.available ?? item.isAvailable ?? true,
      tag: item.tag ?? "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { 
        ...form, 
        price: Number(form.price), 
        halfPrice: form.halfPrice ? Number(form.halfPrice) : undefined 
      };
      if (editing) {
        await api.admin.menu.update(editing._id || editing.id, payload);
      } else {
        await api.admin.menu.create(payload);
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      setError(err.message || "Couldn't save item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    try {
      await api.admin.menu.delete(item._id || item.id);
      setItems((prev) => prev.filter((i) => (i._id || i.id) !== (item._id || item.id)));
    } catch {
      // ignore
    }
  };

  const handleToggle = async (item) => {
    try {
      await api.admin.menu.toggleAvailable(item._id || item.id);
      setItems((prev) =>
        prev.map((i) =>
          (i._id || i.id) === (item._id || item.id)
            ? { ...i, available: !i.available }
            : i
        )
      );
    } catch {
      // ignore
    }
  };

  const filtered = items.filter((i) =>
    i.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#E8284B]/30 focus:border-[#E8284B]"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-[#E8284B] hover:bg-[#d11f40] text-white
                     font-body font-600 text-sm px-4 py-2.5 rounded-xl transition-colors shrink-0
                     w-full sm:w-auto"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={26} className="animate-spin text-[#E8284B]" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="font-body text-sm text-gray-400 text-center py-16 bg-white rounded-2xl border border-gray-100">
          No menu items found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <motion.div
              key={item._id || item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative
                          ${!item.available ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between mb-2">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#E8284B]/10 flex items-center justify-center font-bold text-[#E8284B] text-lg shrink-0">
                    {item.name ? item.name.substring(0, 2).toUpperCase() : "MM"}
                  </div>
                )}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggle(item)}
                    title={item.available ? "Mark unavailable" : "Mark available"}
                    className={`p-1.5 rounded-lg ${item.available ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}
                  >
                    <Power size={14} />
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="font-display text-base text-gray-900 tracking-wide mt-1">{item.name}</p>
              <p className="font-body text-xs text-gray-400 capitalize mb-2">{item.category}</p>
              <div className="flex items-center justify-between">
                <span className="font-body font-700 text-[#E8284B]">
                  ₹{item.price} {item.halfPrice ? `(Half: ₹${item.halfPrice})` : ""}
                </span>
                {!item.available && (
                  <span className="font-body text-[10px] font-600 text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    UNAVAILABLE
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* create / edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.form
              onSubmit={handleSave}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] sm:max-h-[85vh]
                         overflow-y-auto p-5 sm:p-6 md:p-7"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg text-gray-900 tracking-wide">
                  {editing ? "EDIT ITEM" : "NEW ITEM"}
                </h3>
                <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700 shrink-0">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 font-body text-xs px-3 py-2.5 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Item ID" value={form.itemId} onChange={(v) => setForm((f) => ({ ...f, itemId: v }))} type="number" required />
                  <Field label="Image URL" value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} placeholder="e.g. /images/momo.jpg" />
                </div>
                <Field label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-body text-xs font-600 text-gray-500 mb-1.5 block">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-body text-sm capitalize
                                 focus:outline-none focus:ring-2 focus:ring-[#E8284B]/30"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <Field label="Full Price (₹)" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} type="number" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Half Price (₹) (optional)" value={form.halfPrice} onChange={(v) => setForm((f) => ({ ...f, halfPrice: v }))} type="number" />
                  <Field label="Tag (optional)" value={form.tag} onChange={(v) => setForm((f) => ({ ...f, tag: v }))} placeholder="Bestseller, New, Spicy…" />
                </div>
                <div>
                  <label className="font-body text-xs font-600 text-gray-500 mb-1.5 block">Description</label>
                  <textarea
                    value={form.desc}
                    onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-body text-sm resize-none
                               focus:outline-none focus:ring-2 focus:ring-[#E8284B]/30"
                  />
                </div>
                <label className="flex items-center gap-2 font-body text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#E8284B] shrink-0"
                  />
                  Available on menu
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#E8284B] hover:bg-[#d11f40] text-white font-body font-700
                           py-3 rounded-xl transition-colors flex items-center justify-center gap-2
                           disabled:opacity-60 mt-6"
              >
                {saving ? <Loader2 size={17} className="animate-spin" /> : (editing ? "Save Changes" : "Create Item")}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }) {
  return (
    <div>
      <label className="font-body text-xs font-600 text-gray-500 mb-1.5 block">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-body text-sm
                   focus:outline-none focus:ring-2 focus:ring-[#E8284B]/30 focus:border-[#E8284B]"
      />
    </div>
  );
}