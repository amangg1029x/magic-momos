import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import api, { getDeliveryToken, clearDeliveryToken } from "../services/api";
import { initSocket, disconnectSocket } from "../services/socket";
import DeliveryLogin     from "../delivery/DeliveryLogin";
import DeliveryDashboard from "../delivery/DeliveryDashboard";

import { initPushNotifications } from "../services/pushNotifications";

export default function DeliveryPage() {
  const [checking, setChecking]       = useState(true);
  const [authed,   setAuthed]         = useState(false);
  const [deliveryBoy, setDeliveryBoy] = useState(null);

  useEffect(() => {
    // Verify existing token is still valid by hitting a protected endpoint
    (async () => {
      if (!getDeliveryToken()) {
        setChecking(false);
        return;
      }
      try {
        const res = await api.delivery.getProfile();
        setAuthed(true);
        if (res.deliveryBoy) setDeliveryBoy(res.deliveryBoy);
        initPushNotifications("delivery");
        initSocket();
      } catch {
        clearDeliveryToken();
        disconnectSocket();
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const handleLoginSuccess = (boy) => {
    setDeliveryBoy(boy);
    setAuthed(true);
    initSocket();
  };

  const handleLogout = () => {
    api.delivery.logout();
    disconnectSocket();
    setAuthed(false);
    setDeliveryBoy(null);
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
    return <DeliveryLogin onSuccess={handleLoginSuccess} />;
  }

  return <DeliveryDashboard onLogout={handleLogout} deliveryBoy={deliveryBoy} />;
}

