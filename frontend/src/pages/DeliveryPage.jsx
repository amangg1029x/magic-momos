import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import api, { getDeliveryToken, clearDeliveryToken } from "../services/api";
import DeliveryLogin     from "../delivery/DeliveryLogin";
import DeliveryDashboard from "../delivery/DeliveryDashboard";

export default function DeliveryPage() {
  const [checking, setChecking] = useState(true);
  const [authed,   setAuthed]   = useState(false);

  useEffect(() => {
    // Verify existing token is still valid by hitting a protected endpoint
    (async () => {
      if (!getDeliveryToken()) {
        setChecking(false);
        return;
      }
      try {
        await api.delivery.getOrders();
        setAuthed(true);
      } catch {
        clearDeliveryToken();
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    api.delivery.logout();
    setAuthed(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: "linear-gradient(135deg,#0f1923 0%,#0d1f13 100%)" }}>
        <Loader2 size={30} className="animate-spin" style={{ color: "#22c55e" }} />
      </div>
    );
  }

  if (!authed) {
    return <DeliveryLogin onSuccess={() => setAuthed(true)} />;
  }

  return <DeliveryDashboard onLogout={handleLogout} />;
}
