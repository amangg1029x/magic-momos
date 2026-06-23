import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import api from "./api";

let listenersAdded = false;

// Initialize Push Notifications
export const initPushNotifications = async (role = "customer") => {
  if (!Capacitor.isNativePlatform()) {
    return; // silently skip on web
  }

  try {
    // 1. Request Permission from OS
    let permStatus = await PushNotifications.checkPermissions();
    console.log("[Push] Permission status:", permStatus.receive);

    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
      console.log("[Push] After request, status:", permStatus.receive);
    }

    if (permStatus.receive !== "granted") {
      console.warn("[Push] Permission not granted:", permStatus.receive);
      alert("[Push] Notification permission was NOT granted. Status: " + permStatus.receive);
      return;
    }

    // 2. Add Listeners once — guard against duplicates
    if (!listenersAdded) {
      listenersAdded = true;
      await addPushListeners(role);
      console.log("[Push] Listeners attached.");
    } else {
      console.log("[Push] Listeners already attached, skipping.");
    }

    // 3. Register for FCM service
    console.log("[Push] Calling PushNotifications.register() for role:", role);
    await PushNotifications.register();

  } catch (err) {
    console.error("[Push] Error in initPushNotifications:", err);
    alert("[Push] Init error: " + (err.message || String(err)));
  }
};

const addPushListeners = async (role) => {
  // FCM registration success → send token to backend
  await PushNotifications.addListener("registration", async (token) => {
    console.log("[Push] ✅ Got FCM token:", token.value);

    const platform = Capacitor.getPlatform();
    console.log("[Push] Platform:", platform, "Role:", role);

    try {
      let result;
      if (role === "admin") {
        result = await api.admin.registerDeviceToken(token.value, platform);
      } else if (role === "delivery") {
        result = await api.delivery.registerDeviceToken(token.value, platform);
      } else {
        result = await api.auth.registerDeviceToken(token.value, platform);
      }
      console.log("[Push] ✅ Token saved to server:", result);
    } catch (err) {
      console.error("[Push] ❌ Failed to save token to server:", err.message, err.status, err.data);
      alert("[Push] Token save failed: " + err.message + " (status " + err.status + ")");
    }
  });

  // FCM registration failure
  await PushNotifications.addListener("registrationError", (error) => {
    console.error("[Push] ❌ FCM registration error:", JSON.stringify(error));
    alert("[Push] FCM registration failed: " + JSON.stringify(error));
  });

  // Foreground notification received
  await PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("[Push] Foreground notification:", JSON.stringify(notification));
  });

  // User tapped a notification
  await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    console.log("[Push] Notification tapped:", JSON.stringify(action));
    const data = action.notification.data;
    if (data && data.orderId) {
      if (role === "customer") {
        window.location.href = `/profile?order=${data.orderId}`;
      } else if (role === "admin") {
        window.location.href = `/admin/orders/${data.orderId}`;
      } else if (role === "delivery") {
        window.location.href = `/delivery`;
      }
    }
  });
};
