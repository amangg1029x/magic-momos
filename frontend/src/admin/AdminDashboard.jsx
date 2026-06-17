import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee, ShoppingBag, TrendingUp, Clock,
  Package, AlertTriangle, Loader2,
} from "lucide-react";
import api from "../services/api";
import { STATUS_CONFIG } from "../data/adminData";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0 },
};

function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={19} className="text-white" />
        </div>
        {sub && (
          <span className="font-body text-xs font-600 text-green-600 flex items-center gap-0.5">
            <TrendingUp size={12} /> {sub}
          </span>
        )}
      </div>
      <p className="font-display text-2xl text-gray-900 tracking-wide">{value}</p>
      <p className="font-body text-xs text-gray-400 mt-0.5">{label}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.admin.dashboard();
        setData(res.dashboard);
      } catch (err) {
        setError(err.message || "Couldn't load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#E8284B]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-600 font-body text-sm px-5 py-4 rounded-xl flex items-center gap-2">
        <AlertTriangle size={16} /> {error || "No data available"}
      </div>
    );
  }

  const { today, week, month, total, pendingOrders = [], topItems = [], weeklyRevenue = [] } = data;
  const maxRev = Math.max(...weeklyRevenue.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee}  label="Revenue Today"   value={`₹${today?.revenue ?? 0}`}  color="bg-[#E8284B]" delay={0}    />
        <StatCard icon={ShoppingBag}  label="Orders Today"    value={today?.orders ?? 0}          color="bg-[#F5A623]" delay={0.05} />
        <StatCard icon={TrendingUp}   label="Revenue This Week" value={`₹${week?.revenue ?? 0}`}  color="bg-emerald-500" delay={0.1} />
        <StatCard icon={Package}      label="Revenue This Month" value={`₹${month?.revenue ?? 0}`} color="bg-indigo-500" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* weekly revenue chart */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-display text-base text-gray-900 mb-5 tracking-wide">WEEKLY REVENUE</h3>
          {weeklyRevenue.length === 0 ? (
            <p className="font-body text-sm text-gray-400">No revenue data yet.</p>
          ) : (
            <div className="flex items-end justify-between gap-2 h-44">
              {weeklyRevenue.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((d.revenue / maxRev) * 100, 4)}%` }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
                    className="w-full bg-gradient-to-t from-[#E8284B] to-[#F5A623] rounded-t-lg min-h-[4px]"
                  />
                  <span className="font-body text-[10px] text-gray-400">{d.day || d.label}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* top items */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-display text-base text-gray-900 mb-4 tracking-wide">TOP ITEMS</h3>
          {topItems.length === 0 ? (
            <p className="font-body text-sm text-gray-400">Not enough order data yet.</p>
          ) : (
            <div className="space-y-3">
              {topItems.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FFF5DB] text-[#E8284B] font-body
                                   font-700 text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-gray-800 truncate">{item.name}</p>
                  </div>
                  <span className="font-body text-xs text-gray-400 shrink-0">{item.count} sold</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* pending orders */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base text-gray-900 tracking-wide">PENDING ORDERS</h3>
          <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 font-body
                           text-xs font-600 px-3 py-1 rounded-full">
            <Clock size={12} /> {pendingOrders.length} waiting
          </span>
        </div>

        {pendingOrders.length === 0 ? (
          <p className="font-body text-sm text-gray-400 py-6 text-center">
            No pending orders right now 🎉
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-body text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2.5 font-500">Order ID</th>
                  <th className="pb-2.5 font-500">Customer</th>
                  <th className="pb-2.5 font-500">Items</th>
                  <th className="pb-2.5 font-500">Amount</th>
                  <th className="pb-2.5 font-500">Status</th>
                </tr>
              </thead>
              <tbody>
                
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}