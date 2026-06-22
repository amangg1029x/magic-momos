const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

// Helper to calculate coupon discount
const calculateCouponDiscount = (coupon, subtotal) => {
  if (!coupon.active) {
    throw new Error("Coupon is inactive");
  }
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    throw new Error("Coupon has expired");
  }
  if (subtotal < coupon.minOrderValue) {
    throw new Error(`Minimum order value of ₹${coupon.minOrderValue} required for this coupon`);
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === "flat") {
    discount = coupon.discountValue;
  }

  return Math.min(discount, subtotal);
};

// ── POST /api/coupons/validate ───────────────────────────────────────────────
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || subtotal === undefined) {
      return res.status(400).json({ success: false, message: "Code and subtotal are required." });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code." });
    }

    if (req.user) {
      const alreadyUsed = await Order.findOne({
        "customer.userId": req.user._id,
        couponCode: coupon.code,
        status: { $ne: "Cancelled" },
      });
      if (alreadyUsed) {
        return res.status(400).json({ success: false, message: "You have already used this coupon code." });
      }
    }

    try {
      const discount = calculateCouponDiscount(coupon, Number(subtotal));
      res.json({
        success: true,
        discount,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderValue: coupon.minOrderValue,
          maxDiscount: coupon.maxDiscount,
        },
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/coupons ───────────────────────────────────────────────────
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/admin/coupons ──────────────────────────────────────────────────
const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, active } = req.body;

    if (!code || discountValue === undefined) {
      return res.status(400).json({ success: false, message: "Code and discount value are required." });
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Coupon code already exists." });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : 0,
      expiryDate: expiryDate || undefined,
      active: active !== undefined ? Boolean(active) : true,
    });

    res.status(201).json({ success: true, message: "Coupon created successfully", coupon });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/admin/coupons/:id ────────────────────────────────────────────
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/coupons ─────────────────────────────────────────────────────────
const getActiveCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({
      active: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } },
      ],
    }).select("code discountType discountValue minOrderValue maxDiscount expiryDate");
    res.json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  validateCoupon,
  calculateCouponDiscount,
  getCoupons,
  createCoupon,
  deleteCoupon,
  getActiveCoupons,
};
