const router = require("express").Router();
const {
  placeOrder,
  getOrder,
  getMyOrders,
  cancelOrder,
} = require("../controllers/orderController");
const { protect, optionalAuth } = require("../middleware/auth");
const { placeOrderRules, validate } = require("../middleware/validators");
const rateLimit = require("express-rate-limit");

// Prevent order spamming
const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max:      15,
  message:  { success: false, message: "Too many orders placed. Please wait a moment." },
});

// Place order — works for guests (optionalAuth attaches user if logged in)
router.post("/",       orderLimiter, optionalAuth, placeOrderRules, validate, placeOrder);

// Track a single order by _id or order number — optionalAuth so guests can track too
router.get("/my",      protect,       getMyOrders);
router.get("/:id",     optionalAuth,  getOrder);

// Cancel — works for guests (order ownership verified inside controller)
router.post("/:id/cancel", optionalAuth, cancelOrder);

module.exports = router;
