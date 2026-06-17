const router = require("express").Router();
const express = require("express");
const {
  placeOrder,
  verifyPayment,
  retryPayment,
  paymentWebhook,
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

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max:      20,
  message:  { success: false, message: "Too many payment attempts. Please wait a moment." },
});

/**
 * ── Razorpay webhook ──────────────────────────────────────────────────────
 * MUST be registered before express.json() touches this body, because
 * webhook signature verification needs the exact raw bytes Razorpay signed —
 * re-serializing a parsed JSON object can produce a different byte string
 * and break verification. We mount a raw-body parser scoped to just this
 * one route so the rest of the app keeps using express.json() as normal.
 *
 * Configure this URL in Razorpay Dashboard → Settings → Webhooks:
 *   https://your-backend.vercel.app/api/orders/razorpay-webhook
 */
router.post(
  "/razorpay-webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    // Stash the raw buffer for signature verification, then parse it
    // ourselves so the controller can still read req.body as JSON.
    req.rawBody = req.body;
    try {
      req.body = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({ success: false, message: "Invalid webhook payload." });
    }
    next();
  },
  paymentWebhook
);

// Place order — works for guests (optionalAuth attaches user if logged in)
router.post("/",       orderLimiter, optionalAuth, placeOrderRules, validate, placeOrder);

// Payment verification — looks up the order via razorpay_order_id in the body
router.post("/verify-payment",     paymentLimiter, optionalAuth, verifyPayment);
// Retry — uses our own order _id since the customer is retrying a specific order
router.post("/:id/retry-payment",  paymentLimiter, optionalAuth, retryPayment);

// Track a single order by _id or order number — optionalAuth so guests can track too
router.get("/my",      protect,       getMyOrders);
router.get("/:id",     optionalAuth,  getOrder);

// Cancel — works for guests (order ownership verified inside controller)
router.post("/:id/cancel", optionalAuth, cancelOrder);

module.exports = router;
