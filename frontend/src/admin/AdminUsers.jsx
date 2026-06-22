import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, UserCheck, UserMinus, ShieldAlert } from "lucide-react";
import api from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.admin.users.getAll({ page, search });
      setUsers(res.users || []);
      setPages(res.pagination?.pages || 1);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleToggleStatus = async (id, currentStatus, name) => {
    const actionLabel = currentStatus ? "block" : "unblock";
    if (!confirm(`Are you sure you want to ${actionLabel} customer "${name}"?`)) return;

    setActionLoading(id);
    try {
      const res = await api.admin.users.toggleStatus(id);
      if (res.success) {
        setUsers((prev) =>
          prev.map((user) => (user._id === id ? { ...user, isActive: !currentStatus } : user))
        );
      }
    } catch (err) {
      alert(err.message || "Failed to update customer status");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search customers by name, email, or phone…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#E8284B]/30 focus:border-[#E8284B]"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={26} className="animate-spin text-[#E8284B]" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 font-body text-sm text-gray-400">
          No registered customers found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Mobile Cards View */}
          <div className="block sm:hidden p-4 space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className={`p-4 border border-gray-100 rounded-xl space-y-3 relative hover:bg-gray-50/40 transition-colors ${
                  !user.isActive ? "bg-red-50/10 opacity-75" : ""
                }`}
              >
                {/* Header: Avatar, Name, Email, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF5DB] border border-[#F5A623]/20 flex items-center justify-center font-bold text-mm-cream shrink-0">
                      {user.name ? user.name[0].toUpperCase() : "👤"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-body font-700 text-gray-900 leading-tight truncate">{user.name}</p>
                      <p className="font-body text-xs text-gray-400 mt-0.5 break-all">{user.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-body text-[11px] font-600 uppercase shrink-0
                                  ${user.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {user.isActive ? "Active" : "Blocked"}
                  </span>
                </div>

                {/* Info Grid: Phone, Joined, Orders, Spent */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100/60 font-body text-xs">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Phone</span>
                    <span className="text-gray-600 font-500">{user.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Joined</span>
                    <span className="text-gray-600 font-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Orders</span>
                    <span className="text-gray-700 font-600">{user.orderCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Total Spent</span>
                    <span className="text-gray-900 font-700 font-display text-sm">₹{user.totalSpent}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-3 border-t border-gray-100/60">
                  {actionLoading === user._id ? (
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive, user.name)}
                      className={`inline-flex items-center justify-center gap-1.5 font-body text-xs font-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer border w-full
                                ${user.isActive
                                  ? "text-red-500 bg-white border-red-200 hover:bg-red-50"
                                  : "text-green-600 bg-white border-green-200 hover:bg-green-50"
                                }`}
                    >
                      {user.isActive ? (
                        <>
                          <UserMinus size={13} /> Block Customer
                        </>
                      ) : (
                        <>
                          <UserCheck size={13} /> Unblock Customer
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 font-body text-xs text-gray-400 font-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4 text-right">Spent</th>
                  <th className="px-6 py-4 text-center">Joined</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user._id} className={`hover:bg-gray-50/40 transition-colors ${!user.isActive ? "bg-red-50/10 opacity-75" : ""}`}>
                    {/* User Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FFF5DB] border border-[#F5A623]/20 flex items-center justify-center font-bold text-mm-cream">
                          {user.name ? user.name[0].toUpperCase() : "👤"}
                        </div>
                        <div>
                          <p className="font-body font-700 text-gray-900 leading-tight">{user.name}</p>
                          <p className="font-body text-xs text-gray-400 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Number */}
                    <td className="px-6 py-4 font-body text-sm text-gray-600">
                      {user.phone || "—"}
                    </td>

                    {/* Orders count */}
                    <td className="px-6 py-4 text-center font-body text-sm font-600 text-gray-700">
                      {user.orderCount}
                    </td>

                    {/* Total spent */}
                    <td className="px-6 py-4 text-right font-display text-sm text-gray-900 font-700">
                      ₹{user.totalSpent}
                    </td>

                    {/* Join Date */}
                    <td className="px-6 py-4 text-center font-body text-xs text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-body text-[11px] font-600 uppercase
                                      ${user.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>

                    {/* Action Block/Unblock */}
                    <td className="px-6 py-4 text-right">
                      {actionLoading === user._id ? (
                        <Loader2 size={16} className="animate-spin text-gray-400 ml-auto" />
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive, user.name)}
                          className={`inline-flex items-center gap-1.5 font-body text-xs font-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer border
                                    ${user.isActive
                                      ? "text-red-500 bg-white border-red-200 hover:bg-red-50"
                                      : "text-green-600 bg-white border-green-200 hover:bg-green-50"
                                    }`}
                        >
                          {user.isActive ? (
                            <>
                              <UserMinus size={13} /> Block
                            </>
                          ) : (
                            <>
                              <UserCheck size={13} /> Unblock
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <span className="font-body text-xs text-gray-400">
                Page {page} of {pages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 border border-gray-200 bg-white text-xs font-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={page === pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-200 bg-white text-xs font-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
