const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      default: "Magic Momos",
      trim: true,
    },
    phone: {
      type: String,
      default: "+91 70422 89004",
      trim: true,
    },
    email: {
      type: String,
      default: "hello@magicmomos.in",
      trim: true,
    },
    address: {
      type: String,
      default: "Lajpat Nagar, New Delhi",
      trim: true,
    },
    deliveryFee: {
      type: Number,
      default: 30,
      min: [0, "Delivery fee cannot be negative"],
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 199,
      min: [0, "Free delivery threshold cannot be negative"],
    },
    openTime: {
      type: String,
      default: "11:00",
    },
    closeTime: {
      type: String,
      default: "23:00",
    },
    codEnabled: {
      type: Boolean,
      default: true,
    },
    onlinePaymentEnabled: {
      type: Boolean,
      default: false,
    },
    storeStatusOverride: {
      type: String,
      enum: ["auto", "open", "busy", "closed"],
      default: "auto",
    },
    announcementText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
