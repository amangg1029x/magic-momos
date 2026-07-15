import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import api, { getAdminToken } from "../services/api";
import { initSocket } from "../services/socket";
import { useNav } from "../context/NavigationContext";
import AdminLogin from "../admin/AdminLogin";
import AdminLayout from "../admin/AdminLayout";
import AdminDashboard from "../admin/AdminDashboard";
import AdminOrders from "../admin/AdminOrders";
import AdminMenu from "../admin/AdminMenu";
import AdminCoupons from "../admin/AdminCoupons";
import AdminUsers from "../admin/AdminUsers";
import AdminSettings from "../admin/AdminSettings";
import AdminDelivery from "../admin/AdminDelivery";

import { initPushNotifications } from "../services/pushNotifications";

export default function AdminPage() {
  const { registerBackHandler } = useNav();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed]     = useState(false);
  const [subPage, setSubPage]   = useState("dashboard");

  useEffect(() => {
    if (!authed || subPage === "dashboard") return;

    const unregister = registerBackHandler(() => {
      setSubPage("dashboard");
      return true;
    });

    return unregister;
  }, [authed, subPage, registerBackHandler]);

  useEffect(() => {
    (async () => {
      if (!getAdminToken()) {
        setChecking(false);
        return;
      }
      try {
        await api.admin.me();
        setAuthed(true);
        initPushNotifications("admin");
        initSocket();
      } catch {
        api.admin.logout();
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#1a0d00] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#E8284B]" />
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  const SUB_VIEWS = {
    dashboard: AdminDashboard,
    orders:    AdminOrders,
    menu:      AdminMenu,
    coupons:   AdminCoupons,
    users:     AdminUsers,
    delivery:  AdminDelivery,
    settings:  AdminSettings,
  };
  const ActiveView = SUB_VIEWS[subPage] || AdminDashboard;

  return (
    <AdminLayout subPage={subPage} onNavigate={setSubPage}>
      <ActiveView />
    </AdminLayout>
  );
}