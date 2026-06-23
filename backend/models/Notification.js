const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // null recipientId means it's a broadcast for all users of recipientRole
    recipientId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    recipientRole: { type: String, enum: ["customer", "admin", "delivery"], required: true },

    type: {
      type: String,
      enum: ["order_placed", "order_status", "payment", "coupon", "system"],
      required: true,
    },

    title:   { type: String, required: true, maxlength: 100 },
    body:    { type: String, required: true, maxlength: 500 },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fast polling queries
notificationSchema.index({ recipientRole: 1, recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
