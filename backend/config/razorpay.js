const Razorpay = require("razorpay");
const crypto   = require("crypto");

// ── Lazy singleton — avoids crashing the app if keys aren't set yet ──────────
let instance = null;

const getInstance = () => {
  if (instance) return instance;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are not configured on the server.");
  }

  instance = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return instance;
};

/**
 * createRazorpayOrder
 * Creates an order on Razorpay's side. This MUST happen before the
 * Checkout modal opens — Razorpay ties the payment to this order_id
 * so the amount can't be tampered with on the client.
 *
 * @param {number} amountInRupees - e.g. 250 for ₹250
 * @param {string} receipt        - our own orderNumber, e.g. "MM-8821"
 * @param {object} notes          - optional metadata (customer name, etc.)
 */
const createRazorpayOrder = async (amountInRupees, receipt, notes = {}) => {
  const razorpay = getInstance();

  return razorpay.orders.create({
    amount:   Math.round(amountInRupees * 100), // Razorpay works in paise
    currency: "INR",
    receipt,
    notes,
    payment_capture: 1, // auto-capture on successful authorization
  });
};

/**
 * verifyPaymentSignature
 * Confirms a Checkout success callback is genuinely from Razorpay and
 * not forged by a malicious client. This is the single most important
 * security check in the whole payment flow — never skip it.
 *
 * Formula (per Razorpay docs): HMAC-SHA256(order_id + "|" + payment_id, key_secret)
 */
const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay key secret is not configured on the server.");
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return expected === razorpaySignature;
};

/**
 * verifyWebhookSignature
 * Webhooks use a SEPARATE secret (set in the Razorpay dashboard, not the
 * API key secret) and sign the raw request body, not order|payment ids.
 */
const verifyWebhookSignature = (rawBody, signatureHeader) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    throw new Error("Razorpay webhook secret is not configured on the server.");
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return expected === signatureHeader;
};

/**
 * fetchPayment — used to double check a payment's actual status with
 * Razorpay directly (defence in depth, e.g. if we want to reconcile).
 */
const fetchPayment = async (paymentId) => {
  const razorpay = getInstance();
  return razorpay.payments.fetch(paymentId);
};

module.exports = {
  getInstance,
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPayment,
};
