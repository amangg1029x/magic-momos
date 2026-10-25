const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    // Keep a stable numeric ID so the frontend references still work
    itemId: {
      type:   Number,
      unique: true,
    },
    category: {
      type:     String,
      required: [true, "Category is required"],
      enum:     ["momos", "rolls", "snacks", "sides", "drinks", "pizza"],
    },
    emoji: {
      type:    String,
      default: "🍽️",
    },
    // Sizing system: e.g. "half_full", "s_m_l", or "standard"
    sizeType: {
      type:    String,
      enum:    ["standard", "half_full", "s_m_l"],
      default: "standard",
    },
    // Array of sizes for flexible pricing: e.g. [{ key: "s", label: "Small", price: 149 }, ...]
    sizes: [
      {
        key:      { type: String, required: true },
        label:    { type: String, required: true },
        sublabel: { type: String },
        price:    { type: Number, required: true, min: 1 },
      },
    ],
    name: {
      type:      String,
      required:  [true, "Item name is required"],
      trim:      true,
      maxlength: [100, "Name too long"],
    },
    desc: {
      type:      String,
      required:  [true, "Description is required"],
      trim:      true,
      maxlength: [500, "Description too long"],
    },
    price: {
      type:    Number,
      required:[true, "Price is required"],
      min:     [1, "Price must be positive"],
    },
    halfPrice: {
      type:    Number,
      min:     [1, "Half price must be positive"],
    },
    // Optional piece counts — leave blank to hide on menu
    pieces: {
      type:    Number,
      min:     [1, "Pieces must be at least 1"],
    },
    halfPieces: {
      type:    Number,
      min:     [1, "Half pieces must be at least 1"],
    },
    rating: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5,
    },
    reviews: {
      type:    Number,
      default: 0,
    },
    veg: {
      type:    Boolean,
      default: true,
    },
    spicy: {
      type:    Boolean,
      default: false,
    },
    popular: {
      type:    Boolean,
      default: false,
    },
    available: {
      type:    Boolean,
      default: true,  // admin can toggle without deleting
    },
    imageUrl: {
      type: String,   // optional — for future photo uploads
    },
  },
  {
    timestamps: true,
    // Virtual field: formatted price string used by frontend cards
    toJSON: { virtuals: true },
  }
);

// Auto-assign itemId if not provided (increments from max existing)
menuItemSchema.pre("save", async function (next) {
  if (this.itemId) return next();
  const last = await this.constructor.findOne().sort({ itemId: -1 }).select("itemId");
  this.itemId = last ? last.itemId + 1 : 1;
  next();
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
