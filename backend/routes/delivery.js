const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const {
  deliveryLogin,
  getDeliveryOrders,
  deliveryUpdateStatus,
  getDeliveryHistory,
} = require("../controllers/deliveryController");
const { deliveryProtect } = require("../middleware/auth");
const { loginRules, validate } = require("../middleware/validators");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      10,
  message:  { success: false, message: "Too many login attempts. Try again in 15 minutes." },
});

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/login", loginLimiter, loginRules, validate, deliveryLogin);

// ── Protected (requires delivery JWT) ────────────────────────────────────────
router.get("/orders",              deliveryProtect, getDeliveryOrders);
router.patch("/orders/:id/status", deliveryProtect, deliveryUpdateStatus);
router.get("/history",             deliveryProtect, getDeliveryHistory);

module.exports = router;
