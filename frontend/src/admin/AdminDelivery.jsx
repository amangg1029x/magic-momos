import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, RefreshCw, X,
  Truck, Moon, Sun, Phone, Mail, User,
  AlertTriangle, Wifi, WifiOff, Search,
} from "lucide-react";
import api from "../services/api";
import { getSocket } from "../services/socket";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const initialForm = { name: "", email: "", phone: "", password: "" };

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display text-sm font-700 text-white shrink-0"
         style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
      {initials}
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ isSleeping, isActive }) {
  if (isSleeping)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-body font-600 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
        <Moon size={9} /> Sleeping
      </span>
    );
  if (isActive)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-body font-600 px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
        <Wifi size={9} /> Active
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-body font-600 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
      <WifiOff size={9} /> Offline
    </span>
  );
}

// ─── Form Modal ────────────────────────────────────────────────────────────────
function DeliveryBoyModal({ mode, initial, onClose, onSave }) {
  const [form, setForm]     = useState(initial || initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const isEdit = mode === "edit";

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: "name",     label: "Full Name",    icon: User,  type: "text",     required: true  },
    { name: "email",    label: "Email Address",icon: Mail,  type: "email",    required: true  },
    { name: "phone",    label: "Phone Number", icon: Phone, type: "tel",      required: false },
    {
      name: "password",
      label: isEdit ? "New Password (leave blank to keep)" : "Password",
      icon: null,
      type: "password",
      required: !isEdit,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 16 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* coloured top bar */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#22c55e,#16a34a)" }} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-display text-xl text-gray-900">
                {isEdit ? "Edit Rider" : "Add New Rider"}
              </h2>
              <p className="font-body text-xs text-gray-400 mt-0.5">
                {isEdit ? "Update rider details below" : "Create a new delivery partner account"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {fields.map((field) => (
              <label key={field.name} className="block">
                <span className="font-body text-xs text-gray-500 font-600 block mb-1.5">
                  {field.label}
                </span>
                <div className="relative">
                  {field.icon && (
                    <field.icon
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  )}
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                    placeholder={field.label}
                    className="w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    style={{ paddingLeft: field.icon ? "2.25rem" : "0.875rem" }}
                  />
                </div>
              </label>
            ))}

            {error && (
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-red-50 border border-red-100">
                <AlertTriangle size={13} className="text-red-500 shrink-0" />
                <p className="font-body text-xs text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-body text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-body text-sm font-700 text-white transition-all cursor-pointer disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
              >
                {saving ? (
                  <RefreshCw size={14} className="animate-spin inline" />
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Add Rider"
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ name, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const doDelete = async () => {
    setDeleting(true);
    try { await onConfirm(); onClose(); }
    catch { setDeleting(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[950] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.92 }}
        className="w-full max-w-xs bg-white rounded-2xl p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl bg-red-50 border border-red-100">
          ⚠️
        </div>
        <h3 className="font-display text-lg text-gray-900 mb-1">Remove Rider?</h3>
        <p className="font-body text-sm text-gray-500 mb-5">
          Remove <span className="font-700 text-gray-800">{name}</span> from the delivery team? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 font-body text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={doDelete}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl font-body text-sm font-700 text-white cursor-pointer disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
          >
            {deleting ? "Removing…" : "Remove"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Rider Row ────────────────────────────────────────────────────────────────
function RiderRow({ boy, onEdit, onDelete }) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/70 transition-colors"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={boy.name} />
          <div>
            <p className="font-body text-sm font-600 text-gray-800 leading-none">{boy.name}</p>
            {boy.email && (
              <p className="font-body text-xs text-gray-400 mt-0.5">{boy.email}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        {boy.phone ? (
          <a href={`tel:${boy.phone}`}
             className="font-body text-sm text-gray-600 flex items-center gap-1.5 hover:text-green-600 transition-colors w-fit">
            <Phone size={12} className="text-gray-400" /> {boy.phone}
          </a>
        ) : (
          <span className="font-body text-xs text-gray-300">—</span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <StatusBadge isSleeping={boy.isSleeping} isActive={boy.isActive} />
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(boy)}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-blue-50 border border-transparent hover:border-blue-200 text-gray-400 hover:text-blue-600"
            title="Edit rider"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(boy)}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-red-50 border border-transparent hover:border-red-200 text-gray-400 hover:text-red-500"
            title="Remove rider"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// Mobile card
function RiderCard({ boy, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <Avatar name={boy.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-body text-sm font-700 text-gray-800">{boy.name}</p>
            <StatusBadge isSleeping={boy.isSleeping} isActive={boy.isActive} />
          </div>
          {boy.email && (
            <p className="font-body text-xs text-gray-400 truncate">{boy.email}</p>
          )}
          {boy.phone && (
            <a href={`tel:${boy.phone}`} className="font-body text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Phone size={10} /> {boy.phone}
            </a>
          )}
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(boy)}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border border-blue-100 bg-blue-50 text-blue-500"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(boy)}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border border-red-100 bg-red-50 text-red-500"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminDelivery() {
  const [riders,   setRiders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");

  const fetchRiders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.admin.deliveryBoys.getAll();
      setRiders(res.deliveryBoys || []);
    } catch {
      // keep stale
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiders();
    const socket = getSocket();
    if (socket) {
      const refresh = () => fetchRiders(true);
      socket.on("rider_status_update", refresh);
      socket.on("delivery_boy_status_update", refresh);
      return () => {
        socket.off("rider_status_update", refresh);
        socket.off("delivery_boy_status_update", refresh);
      };
    }
  }, [fetchRiders]);

  const handleAdd  = async (form) => { await api.admin.deliveryBoys.create(form); await fetchRiders(true); };
  const handleEdit = async (form) => { await api.admin.deliveryBoys.update(modal.data._id, form); await fetchRiders(true); };
  const handleDel  = async ()     => { await api.admin.deliveryBoys.delete(toDelete._id); await fetchRiders(true); };

  const activeCount   = riders.filter((r) => !r.isSleeping && r.isActive).length;
  const sleepingCount = riders.filter((r) => r.isSleeping).length;
  const offlineCount  = riders.filter((r) => !r.isActive && !r.isSleeping).length;

  const filtered = riders
    .filter((r) => {
      if (filter === "active")   return !r.isSleeping && r.isActive;
      if (filter === "sleeping") return r.isSleeping;
      if (filter === "offline")  return !r.isActive && !r.isSleeping;
      return true;
    })
    .filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.phone?.includes(q)
      );
    });

  const FILTER_TABS = [
    { key: "all",      label: "All",      count: riders.length   },
    { key: "active",   label: "Active",   count: activeCount     },
    { key: "sleeping", label: "Sleeping", count: sleepingCount   },
    { key: "offline",  label: "Offline",  count: offlineCount    },
  ];

  return (
    <div>
      <AnimatePresence>
        {modal && (
          <DeliveryBoyModal
            mode={modal.mode}
            initial={modal.data || initialForm}
            onClose={() => setModal(null)}
            onSave={modal.mode === "edit" ? handleEdit : handleAdd}
          />
        )}
        {toDelete && (
          <DeleteConfirm
            name={toDelete.name}
            onClose={() => setToDelete(null)}
            onConfirm={handleDel}
          />
        )}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl text-gray-900 flex items-center gap-2">
            <Truck size={22} className="text-green-500" />
            Delivery Boys
          </h1>
          <p className="font-body text-sm text-gray-400 mt-0.5">
            Manage your delivery team · updates in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchRiders(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-green-500" : ""} />
          </button>
          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-body text-sm font-700 text-white cursor-pointer transition-all shadow-sm hover:shadow-md"
            style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
          >
            <Plus size={15} /> Add Rider
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { key: "active",   label: "Active",   count: activeCount,   color: "text-green-600",  bg: "bg-green-50",  border: "border-green-100" },
          { key: "sleeping", label: "Sleeping", count: sleepingCount, color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100"  },
          { key: "offline",  label: "Offline",  count: offlineCount,  color: "text-gray-500",   bg: "bg-gray-50",   border: "border-gray-100"   },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter((f) => (f === s.key ? "all" : s.key))}
            className={`rounded-xl p-4 text-center border transition-all cursor-pointer ${
              filter === s.key ? `${s.bg} ${s.border}` : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            <p className={`font-display text-3xl ${s.color}`}>{s.count}</p>
            <p className="font-body text-xs text-gray-400 mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {/* ── Search + filter tabs ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 font-body text-sm text-gray-700 placeholder:text-gray-300 outline-none focus:border-green-400 transition-all"
            />
          </div>
          {/* Filter tabs */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {FILTER_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-3 py-1.5 font-body text-xs transition-all cursor-pointer ${
                  filter === t.key
                    ? "bg-green-500 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
        </div>

        {/* ── Table (desktop) ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-green-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <div className="text-5xl">🛵</div>
            <p className="font-display text-lg text-gray-700">
              {riders.length === 0 ? "No riders yet" : "No riders match"}
            </p>
            {riders.length === 0 && (
              <p className="font-body text-sm text-gray-400">
                Click "Add Rider" to onboard your first delivery partner.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left font-body text-xs text-gray-400 bg-gray-50/80 border-b border-gray-100">
                    <th className="px-5 py-3 font-500">Rider</th>
                    <th className="px-5 py-3 font-500">Phone</th>
                    <th className="px-5 py-3 font-500">Status</th>
                    <th className="px-5 py-3 font-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((boy) => (
                      <RiderRow
                        key={boy._id}
                        boy={boy}
                        onEdit={(b) => setModal({ mode: "edit", data: b })}
                        onDelete={(b) => setToDelete(b)}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden p-4 space-y-3">
              <AnimatePresence>
                {filtered.map((boy) => (
                  <RiderCard
                    key={boy._id}
                    boy={boy}
                    onEdit={(b) => setModal({ mode: "edit", data: b })}
                    onDelete={(b) => setToDelete(b)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Footer count */}
        {!loading && riders.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50">
            <p className="font-body text-xs text-gray-400">
              {filtered.length} of {riders.length} rider{riders.length !== 1 ? "s" : ""}
              {filter !== "all" && ` · filtered by "${filter}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
