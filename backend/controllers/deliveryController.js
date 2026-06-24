const jwt   = require("jsonwebtoken");
const Order = require("../models/Order");
const DeliveryCredential = require("../models/DeliveryCredential");

const ACTIVE_STATUSES = ["Preparing", "Out for Delivery"];

const signDeliveryToken = () =>
  jwt.sign({ role: "delivery" }, process.env.JWT_DELIVERY_SECRET, {
    expiresIn: process.env.JWT_DELIVERY_EXPIRES_IN || "12h",
  });

// Helper to ensure at least one delivery credential document exists
const ensureDefaultCredentials = async () => {
  const count = await DeliveryCredential.countDocuments();
  if (count === 0) {
    await DeliveryCredential.create({
      email: "delivery@magicmomos.in",
      password: "Delivery@1234",
    });
  }
};

// ── POST /api/delivery/login ──────────────────────────────────────────────────
const deliveryLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    await ensureDefaultCredentials();

    const cred = await DeliveryCredential.findOne({ email }).select("+password");
    if (!cred || !(await cred.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials. Please try again." });
    }

    const token = signDeliveryToken();
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/delivery-credentials (admin only) ──────────────────────────
const getDeliveryCredentials = async (req, res, next) => {
  try {
    await ensureDefaultCredentials();
    const cred = await DeliveryCredential.findOne();
    res.json({ success: true, email: cred ? cred.email : "delivery@magicmomos.in" });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/admin/delivery-credentials (admin only) ──────────────────────────
const updateDeliveryCredentials = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    await ensureDefaultCredentials();

    let cred = await DeliveryCredential.findOne();
    if (!cred) {
      cred = new DeliveryCredential({ email, password: password || "Delivery@1234" });
    } else {
      cred.email = email;
      if (password) {
        cred.password = password;
      }
    }
    await cred.save();

    res.json({ success: true, message: "Delivery credentials updated successfully." });
  } catch (err) {
    next(err);
  }
};


// ── GET /api/delivery/orders ──────────────────────────────────────────────────
// Returns all active orders (Preparing / Out for Delivery) for the delivery partner.
// Only exposes fields needed by the delivery partner — no payment secrets.
const getDeliveryOrders = async (req, res, next) => {
  try {
    const orders = await Order.find(
      { status: { $in: ACTIVE_STATUSES } },
      {
        orderNumber:   1,
        status:        1,
        createdAt:     1,
        "customer.name":  1,
        "customer.phone": 1,
        address:       1,
        items:         1,
        total:         1,
        paymentMethod: 1,
        paymentStatus: 1,
        specialInstructions: 1,
        estimatedDeliveryMins: 1,
      }
    ).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/delivery/orders/:id/status ─────────────────────────────────────
// Delivery partner can mark an order "Out for Delivery" or "Delivered".
const deliveryUpdateStatus = async (req, res, next) => {
  try {
    const ALLOWED = ["Out for Delivery", "Delivered"];
    const { status } = req.body;

    if (!ALLOWED.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Delivery partner can only set status to: ${ALLOWED.join(", ")}.`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (!ACTIVE_STATUSES.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update order — it is already ${order.status}.`,
      });
    }

    order.status = status;
    if (status === "Delivered") {
      order.deliveredAt   = new Date();
      order.paymentStatus = "Paid";
    }
    await order.save();

    res.json({ success: true, message: `Order marked as ${status}.`, order });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/delivery/history ──────────────────────────────────────────────────
const getDeliveryHistory = async (req, res, next) => {
  try {
    const orders = await Order.find(
      { status: "Delivered" },
      {
        orderNumber:   1,
        status:        1,
        createdAt:     1,
        deliveredAt:   1,
        "customer.name":  1,
        "customer.phone": 1,
        address:       1,
        items:         1,
        total:         1,
        paymentMethod: 1,
        paymentStatus: 1,
        specialInstructions: 1,
      }
    ).sort({ deliveredAt: -1 }).limit(50);

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/delivery/orders/:id/location ───────────────────────────────────
// Delivery partner pings their GPS coordinates every ~10 s while "Out for Delivery".
const updateDeliveryLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({ success: false, message: "lat and lng are required." });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "deliveryLocation.lat":       lat,
          "deliveryLocation.lng":       lng,
          "deliveryLocation.updatedAt": new Date(),
        },
      },
      { new: true, select: "orderNumber status deliveryLocation" }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.json({ success: true, deliveryLocation: order.deliveryLocation });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  deliveryLogin,
  getDeliveryOrders,
  deliveryUpdateStatus,
  getDeliveryCredentials,
  updateDeliveryCredentials,
  getDeliveryHistory,
  updateDeliveryLocation,
};
