const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const {
  deliveryLogin,
  getDeliveryOrders,
  deliveryUpdateStatus,
  getDeliveryHistory,
  updateDeliveryLocation,
} = require("../controllers/deliveryController");
const { deliveryProtect } = require("../middleware/auth");
const { loginRules, validate } = require("../middleware/validators");
const {
  getDeliveryNotifications,
  markDeliveryRead,
  markAllDeliveryRead,
} = require("../controllers/notificationController");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      10,
  message:  { success: false, message: "Too many login attempts. Try again in 15 minutes." },
});

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/login", loginLimiter, loginRules, validate, deliveryLogin);

// ── Protected (requires delivery JWT) ────────────────────────────────────────
router.get("/orders",               deliveryProtect, getDeliveryOrders);
router.patch("/orders/:id/status",  deliveryProtect, deliveryUpdateStatus);
router.patch("/orders/:id/location",deliveryProtect, updateDeliveryLocation);
router.get("/history",              deliveryProtect, getDeliveryHistory);

// Notifications
router.get("/notifications",                deliveryProtect, getDeliveryNotifications);
router.patch("/notifications/read-all",     deliveryProtect, markAllDeliveryRead);
router.patch("/notifications/:id/read",     deliveryProtect, markDeliveryRead);

// Device Token for Push Notifications
const { registerDeliveryToken } = require("../controllers/pushController");
router.post("/device-token",                deliveryProtect, registerDeliveryToken);

module.exports = router;
