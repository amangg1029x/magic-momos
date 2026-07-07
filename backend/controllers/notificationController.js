const Notification = require("../models/Notification");
const Setting = require("../models/Setting");
const User = require("../models/User");
const AdminToken = require("../models/AdminToken");
const DeliveryToken = require("../models/DeliveryToken");
const messaging = require("../config/firebase");

// Helper to push messages to list of device tokens
// If alarmMode=true, sends a data-only message (no 'notification' field) so
// the app's FirebaseMessagingService can intercept it and start the alarm service.
const sendPushNotification = async (tokens, title, body, data = {}, channelId = null, alarmMode = false) => {
  if (!messaging || !tokens || tokens.length === 0) return;

  try {
    const messages = tokens.map(token => {
      if (alarmMode) {
        // DATA-ONLY message — no 'notification' field.
        // FCM delivers this to onMessageReceived() even when the app is killed.
        return {
          token,
          data: {
            ...data,
            alarm: "true",
            title,
            body,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
          },
          android: { priority: "high" },
          apns: { headers: { "apns-priority": "10", "apns-push-type": "background" },
                  payload: { aps: { "content-available": 1 } } },
        };
      }

      // NORMAL notification message
      return {
        token,
        notification: { title, body },
        data: {
          ...data,
          alarm: "false",
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        android: {
          priority: "high",
          notification: {
            channelId: channelId || "default",
            sound: channelId === "new_order_v2" ? "order_ringtone" : "default",
            notificationPriority: "PRIORITY_MAX",
            visibility: "PUBLIC",
          },
        },
        apns: {
          headers: { "apns-priority": "10" },
          payload: { aps: { sound: "default", badge: 1 } },
        },
      };
    });

    const response = await messaging.sendEach(messages);
    console.log(`[Push] Sent ${response.successCount} ok, ${response.failureCount} failed (alarmMode=${alarmMode})`);
  } catch (err) {
    console.error("[Push] Error sending push notification:", err.message);
  }
};


// ── Shared helper used by other controllers to fire-and-forget notifications ──
// Usage: createNotification({ recipientId, recipientRole, type, title, body, orderId })
const createNotification = async (data) => {
  try {
    const notification = await Notification.create({
      recipientId:   data.recipientId   || null,
      recipientRole: data.recipientRole,
      type:          data.type,
      title:         data.title,
      body:          data.body,
      orderId:       data.orderId        || null,
    });

    // Resolve push tokens for target recipient(s)
    let tokens = [];
    const orderIdStr = data.orderId ? data.orderId.toString() : "";
    const pushData = {
      type: data.type || "system",
      orderId: orderIdStr,
      notificationId: notification._id.toString(),
    };

    if (data.recipientRole === "customer") {
      if (data.recipientId) {
        const user = await User.findById(data.recipientId).select("fcmTokens");
        if (user && user.fcmTokens) {
          tokens = user.fcmTokens.map(t => t.token);
        }
      } else {
        // Broadcast to all customers who have registered tokens?
        // In large apps, use topics. For simple apps, send to all (or skip to avoid rate-limits)
        // Let's do a bulk read of all active customers' tokens up to 100 for safety.
        const users = await User.find({ isActive: true, "fcmTokens.0": { $exists: true } }).limit(50).select("fcmTokens");
        users.forEach(u => {
          if (u.fcmTokens) {
            u.fcmTokens.forEach(t => tokens.push(t.token));
          }
        });
      }
    } else if (data.recipientRole === "admin") {
      // Find all registered admin tokens
      const adminTokens = await AdminToken.find().select("token");
      tokens = adminTokens.map(t => t.token);
    } else if (data.recipientRole === "delivery") {
      // Find all delivery partner tokens
      const deliveryTokens = await DeliveryToken.find().select("token");
      tokens = deliveryTokens.map(t => t.token);
    }

    if (tokens.length > 0) {
      // For admin and delivery order notifications, check if alarm ring is enabled.
      // If yes: send a data-only FCM so our AlarmService intercepts and loops audio.
      // If no: send a normal notification with the default channel sound.
      let alarmMode = false;
      let channelId = null;
      if (
        (data.recipientRole === "admin" && data.type === "order_placed") ||
        (data.recipientRole === "delivery" && data.type === "order_status")
      ) {
        const settings = await Setting.findOne().select("alarmRingEnabled").lean();
        alarmMode = settings?.alarmRingEnabled !== false; // default true if no doc yet
        channelId = "new_order_v2";
      }
      sendPushNotification(tokens, data.title, data.body, pushData, channelId, alarmMode);
    }
  } catch (err) {
    // Never throw — notifications are best-effort, must not break the main flow
    console.error("[Notifications] Failed to create notification:", err.message);
  }
};

// ── Build the query to fetch notifications for the caller ─────────────────────

function buildCustomerQuery(userId) {
  // Fetch: (a) direct notifications OR (b) broadcast coupon/system for all customers
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return {
    recipientRole: "customer",
    $or: [
      { recipientId: userId },
      { recipientId: null, createdAt: { $gte: sevenDaysAgo } },
    ],
  };
}

function buildAdminQuery() {
  return { recipientRole: "admin" };
}

function buildDeliveryQuery() {
  // Deliveries are not user-specific — all partners see the same feed
  return { recipientRole: "delivery" };
}

// ── GET /api/notifications (customer) ─────────────────────────────────────────
const getCustomerNotifications = async (req, res, next) => {
  try {
    const query = buildCustomerQuery(req.user._id);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ ...query, read: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/notifications/:id/read (customer) ──────────────────────────────
const markCustomerRead = async (req, res, next) => {
  try {
    const query = buildCustomerQuery(req.user._id);
    await Notification.findOneAndUpdate(
      { _id: req.params.id, ...query },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/notifications/read-all (customer) ─────────────────────────────
const markAllCustomerRead = async (req, res, next) => {
  try {
    const query = buildCustomerQuery(req.user._id);
    await Notification.updateMany({ ...query, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/notifications ──────────────────────────────────────────────
const getAdminNotifications = async (req, res, next) => {
  try {
    const query = buildAdminQuery();
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ ...query, read: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

const markAdminRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientRole: "admin" },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const markAllAdminRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipientRole: "admin", read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/delivery/notifications ───────────────────────────────────────────
const getDeliveryNotifications = async (req, res, next) => {
  try {
    const query = buildDeliveryQuery();
    // Only show delivery notifications from the last 24h to keep feed relevant
    query.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);
    const unreadCount = await Notification.countDocuments({ ...buildDeliveryQuery(), read: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

const markDeliveryRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientRole: "delivery" },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const markAllDeliveryRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipientRole: "delivery", read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createNotification,
  getCustomerNotifications,
  markCustomerRead,
  markAllCustomerRead,
  getAdminNotifications,
  markAdminRead,
  markAllAdminRead,
  getDeliveryNotifications,
  markDeliveryRead,
  markAllDeliveryRead,
};
