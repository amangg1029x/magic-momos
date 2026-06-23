const mongoose = require("mongoose");

const deliveryTokenSchema = new mongoose.Schema(
  {
    deliveryUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryCredential",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      default: "unknown",
    },
  },
  { timestamps: true }
);

// Compound index to quickly find and prevent duplicate tokens
deliveryTokenSchema.index({ deliveryUserId: 1, token: 1 }, { unique: true });

module.exports = mongoose.model("DeliveryToken", deliveryTokenSchema);
