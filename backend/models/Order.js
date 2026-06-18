const mongoose = require("mongoose");

// ── Sub-schema: single line item ─────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "MenuItem",
    },
    itemId:  Number,   // snapshot of itemId for display even if item is deleted
    emoji:   String,
    imageUrl:String,
    name:    { type: String, required: true },
    price:   { type: Number, required: true }, // price at time of order (snapshot)
    qty:     { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// ── Main order schema ─────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // Human-readable order number e.g. MM-8821
    orderNumber: {
      type:   String,
      unique: true,
    },

    // Either a registered user or a guest
    customer: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null for guests
      name:   { type: String, required: [true, "Customer name required"] },
      phone:  { type: String, required: [true, "Phone number required"] },
      email:  { type: String },
    },

    items: {
      type:     [orderItemSchema],
      validate: [(arr) => arr.length > 0, "Order must have at least one item"],
    },

    // Pricing
    subtotal:       { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    discount:       { type: Number, default: 0 },
    total:          { type: Number, required: true },

    // Delivery
    address: {
      street:  { type: String, required: [true, "Delivery address required"] },
      city:    { type: String, default: "New Delhi" },
      pincode: { type: String, required: [true, "Pincode required"] },
      lat:     { type: Number },
      lng:     { type: Number },
    },

    // Payment
    paymentMethod: {
      type:    String,
      enum:    ["cod", "online"],
      default: "cod",
    },
    paymentStatus: {
      type:    String,
      enum:    ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    // ── Razorpay-specific fields (only populated when paymentMethod === "online") ──
    razorpayOrderId:   String,  // order_xxx — created before payment, ties Razorpay to this order
    razorpayPaymentId: String,  // pay_xxx   — set once payment is captured
    razorpaySignature: String,  // stored for audit trail after verification
    paymentId:         String,  // legacy/generic ref kept for COD or other gateways
    paymentFailedReason: String,

    // Lifecycle
    status: {
      type:    String,
      enum:    ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },
    statusHistory: [
      {
        status:    String,
        changedAt: { type: Date, default: Date.now },
        note:      String,
      },
    ],

    estimatedDeliveryMins: { type: Number, default: 25 },
    deliveredAt:           Date,
    cancelReason:          String,

    specialInstructions: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

// ── Auto-generate orderNumber before first save ───────────────────────────────
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const last = await this.constructor.findOne().sort({ createdAt: -1 }).select("orderNumber");
    let nextNum = 8800;
    if (last?.orderNumber) {
      const parts = last.orderNumber.split("-");
      nextNum = parseInt(parts[1] || "8800", 10) + 1;
    }
    this.orderNumber = `MM-${nextNum}`;
  }

  // Push to statusHistory whenever status changes
  if (this.isModified("status")) {
    this.statusHistory.push({ status: this.status });
  }

  next();
});

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ "customer.userId": 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ razorpayOrderId: 1 }, { sparse: true });

module.exports = mongoose.model("Order", orderSchema);
