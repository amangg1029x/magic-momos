const mongoose = require("mongoose");

const adminTokenSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
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
adminTokenSchema.index({ adminId: 1, token: 1 }, { unique: true });

module.exports = mongoose.model("AdminToken", adminTokenSchema);
