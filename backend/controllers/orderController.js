const Order    = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require("../config/razorpay");

const FREE_DELIVERY_THRESHOLD = 199;
const DELIVERY_FEE            = 30;

// ── POST /api/orders ──────────────────────────────────────────────────────────
// Guests & logged-in customers can place orders
const placeOrder = async (req, res, next) => {
  try {
    const { customer, items: reqItems, address, paymentMethod, specialInstructions } = req.body;

    // ── 1. Validate all menu items exist and are available ───────────────────
    const itemIds = reqItems.map((i) => Number(i.itemId));
    const menuItems = await MenuItem.find({ itemId: { $in: itemIds }, available: true });

    if (menuItems.length !== itemIds.length) {
      const foundIds  = menuItems.map((m) => m.itemId);
      const missing   = itemIds.filter((id) => !foundIds.includes(id));
      return res.status(400).json({
        success: false,
        message: `Some items are unavailable or not found: ${missing.join(", ")}`,
      });
    }

    // ── 2. Build order line items with snapshotted prices ────────────────────
    const orderItems = reqItems.map((reqItem) => {
      const menuItem = menuItems.find((m) => m.itemId === Number(reqItem.itemId));
      return {
        menuItem: menuItem._id,
        itemId:   menuItem.itemId,
        emoji:    menuItem.emoji,
        name:     menuItem.name,
        price:    menuItem.price,   // snapshot — won't change if price updates later
        qty:      reqItem.qty,
      };
    });

    // ── 3. Calculate totals ───────────────────────────────────────────────────
    const subtotal       = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total          = subtotal + deliveryCharge;

    // ── 4. Build and save the order ───────────────────────────────────────────
    const orderData = {
      customer: {
        ...customer,
        userId: req.user?._id ?? null,
      },
      items:       orderItems,
      subtotal,
      deliveryCharge,
      total,
      address,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: "Pending",
      specialInstructions,
    };

    const order = await Order.create(orderData);

    // ── 5. For online payments, create a matching Razorpay order now ─────────
    //     so the frontend can open Checkout immediately. The order already
    //     exists in our DB as "Pending" — if the user abandons payment, the
    //     order simply stays Pending and they can retry from the order page.
    let razorpay = null;
    if (order.paymentMethod === "online") {
      try {
        const rpOrder = await createRazorpayOrder(order.total, order.orderNumber, {
          orderId:     order._id.toString(),
          orderNumber: order.orderNumber,
          customer:    order.customer.name,
        });

        order.razorpayOrderId = rpOrder.id;
        await order.save();

        razorpay = {
          keyId:   process.env.RAZORPAY_KEY_ID,
          orderId: rpOrder.id,
          amount:  rpOrder.amount,   // in paise — Razorpay Checkout expects this
          currency:rpOrder.currency,
        };
      } catch (rpErr) {
        // Don't fail the whole order — it still exists as Pending/cod-fallback-able.
        // Surface the issue so the frontend can show "try again" rather than a
        // silent COD order the customer didn't choose.
        console.error("Razorpay order creation failed:", rpErr.message);
        return res.status(502).json({
          success: false,
          message: "Could not initiate online payment right now. Please try Cash on Delivery or try again.",
          orderId: order._id, // so the frontend could offer "switch to COD" later if desired
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: {
        _id:           order._id,
        orderNumber:   order.orderNumber,
        status:        order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal:      order.subtotal,
        deliveryCharge:order.deliveryCharge,
        total:         order.total,
        items:         order.items,
        estimatedTime: "20–30 mins",
        createdAt:     order.createdAt,
      },
      // Present only when paymentMethod === "online" — frontend uses this
      // to open the Razorpay Checkout modal.
      razorpay,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/orders/:id/verify-payment ───────────────────────────────────────
// Called by the frontend immediately after Razorpay Checkout's success handler
// fires. This is the step that actually confirms the payment is genuine —
// never trust the success callback alone.
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields.",
      });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found for this payment." });
    }

    // Ownership check — same rule as getOrder/cancelOrder
    if (req.user && order.customer.userId && !order.customer.userId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorised." });
    }

    const isValid = verifyPaymentSignature({
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValid) {
      order.paymentStatus       = "Failed";
      order.paymentFailedReason = "Signature verification failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed. If money was deducted, it will be auto-refunded within 5-7 business days.",
      });
    }

    // ── Signature is genuine — mark the order paid and move it forward ───────
    order.paymentStatus       = "Paid";
    order.razorpayPaymentId   = razorpay_payment_id;
    order.razorpaySignature   = razorpay_signature;
    if (order.status === "Pending") order.status = "Confirmed";
    await order.save();

    res.json({
      success: true,
      message: "Payment verified successfully!",
      order: {
        _id:            order._id,
        orderNumber:    order.orderNumber,
        status:         order.status,
        paymentStatus:  order.paymentStatus,
        subtotal:       order.subtotal,
        deliveryCharge: order.deliveryCharge,
        total:          order.total,
        items:          order.items,
        estimatedTime:  "20–30 mins",
        createdAt:      order.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/orders/razorpay-webhook ─────────────────────────────────────────
// Safety net: Razorpay calls this server-to-server regardless of whether the
// customer's browser stayed open. Configure this URL + a webhook secret in
// the Razorpay Dashboard → Settings → Webhooks. Catches cases where the
// signature-verify call above never reaches us (closed tab, network drop).
const paymentWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    // req.rawBody is attached by the raw-body middleware mounted on this
    // route only (see routes/orders.js) — required because webhook
    // signature verification needs the exact raw bytes, not the parsed JSON.
    const isValid = verifyWebhookSignature(req.rawBody, signature);

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature." });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured") {
      const rpOrderId = payload.payment.entity.order_id;
      const order = await Order.findOne({ razorpayOrderId: rpOrderId });

      if (order && order.paymentStatus !== "Paid") {
        order.paymentStatus     = "Paid";
        order.razorpayPaymentId = payload.payment.entity.id;
        if (order.status === "Pending") order.status = "Confirmed";
        await order.save();
      }
    }

      if (event === "payment.failed") {
        const rpOrderId = payload.payment.entity.order_id;
        const order = await Order.findOne({ razorpayOrderId: rpOrderId });

        if (order && order.paymentStatus === "Pending") {
          order.paymentStatus = "Failed";
          order.paymentFailedReason = payload.payment.entity.error_description || "Payment failed";
          // Mark order as cancelled to prevent it from appearing in listings
          order.status = "Cancelled";
          await order.save();
        }
      }

    // Always 200 — Razorpay retries on non-2xx, which we don't want for
    // events we've already processed or intentionally ignore.
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/orders/:id/retry-payment ────────────────────────────────────────
// For orders where paymentMethod === "online" but paymentStatus is still
// Pending/Failed (browser closed, network drop, card declined, etc.).
// Creates a FRESH Razorpay order — Razorpay order_ids can't be reused once
// abandoned — and returns new Checkout params.
const retryPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    if (req.user && order.customer.userId && !order.customer.userId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorised." });
    }

    if (order.paymentMethod !== "online") {
      return res.status(400).json({ success: false, message: "This order is not an online payment order." });
    }
    if (order.paymentStatus === "Paid") {
      return res.status(400).json({ success: false, message: "This order has already been paid for." });
    }
    if (["Cancelled", "Delivered"].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot retry payment — order is already ${order.status}.` });
    }

    const rpOrder = await createRazorpayOrder(order.total, `${order.orderNumber}-retry-${Date.now()}`, {
      orderId:     order._id.toString(),
      orderNumber: order.orderNumber,
      customer:    order.customer.name,
    });

    order.razorpayOrderId     = rpOrder.id;
    order.paymentStatus       = "Pending";
    order.paymentFailedReason = undefined;
    await order.save();

    res.json({
      success: true,
      razorpay: {
        keyId:    process.env.RAZORPAY_KEY_ID,
        orderId:  rpOrder.id,
        amount:   rpOrder.amount,
        currency: rpOrder.currency,
      },
      order: {
        _id:         order._id,
        orderNumber: order.orderNumber,
        total:       order.total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
// Public order tracking by order number (e.g. MM-8821) or MongoDB _id
const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = id.startsWith("MM-")
      ? { orderNumber: id }
      : { _id: id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // If there's an authenticated user, only allow them to see their own orders
    if (req.user && order.customer.userId && !order.customer.userId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorised to view this order." });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/orders/my ────────────────────────────────────────────────────────
// Logged-in customer's order history
const getMyOrders = async (req, res, next) => {
  try {
    const page  = Math.max(Number(req.query.page)  || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip  = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ "customer.userId": req.user._id, $or: [{ paymentMethod: "cod" }, { paymentStatus: "Paid" }] })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ "customer.userId": req.user._id }),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/orders/:id/cancel ───────────────────────────────────────────────
// Customer can cancel their own order if still Pending / Confirmed
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    // Authorisation check
    if (req.user && order.customer.userId && !order.customer.userId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorised." });
    }

    if (!["Pending", "Confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is already ${order.status}.`,
      });
    }

    order.status       = "Cancelled";
    order.cancelReason = req.body.reason || "Cancelled by customer";
    await order.save();

    res.json({ success: true, message: "Order cancelled.", order });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Admin controllers
// ═══════════════════════════════════════════════════════════════════════════════

// ── GET /api/admin/orders ─────────────────────────────────────────────────────
// Admin can retrieve a paginated list of all orders (excluding Cancelled).
// Supports optional query parameters: page, limit, status filter.
const adminGetOrders = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Build query: exclude Cancelled orders by default
    const query = { status: { $ne: "Cancelled" } };
    // Optional status filter (e.g., pending, confirmed)
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/orders/:id ─────────────────────────────────────────────────
const adminGetOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query  = id.startsWith("MM-") ? { orderNumber: id } : { _id: id };
    const order  = await Order.findOne(query);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/admin/orders/:id/status ───────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const VALID_STATUSES = [
      "Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled",
    ];
    const { status, note } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    order.status = status;
    if (note) order.statusHistory[order.statusHistory.length - 1].note = note;
    if (status === "Delivered") {
      order.deliveredAt     = new Date();
      order.paymentStatus   = "Paid";
    }
    if (status === "Cancelled") {
      order.cancelReason  = note || "Cancelled by admin";
    }

    await order.save();
    res.json({ success: true, message: `Order status updated to ${status}.`, order });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/dashboard ──────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setDate(today.getDate() - 30);

    const [
      todayOrders,
      weekOrders,
      monthOrders,
      totalOrders,
      pendingCount,
      topItems,
      weeklyRevenue,
    ] = await Promise.all([
      // Today stats
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      // Week stats
      Order.aggregate([
        { $match: { createdAt: { $gte: weekAgo }, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      // Month stats
      Order.aggregate([
        { $match: { createdAt: { $gte: monthAgo }, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      // All time
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      // Pending orders count
      Order.countDocuments({ status: { $in: ["Pending", "Confirmed", "Preparing", "Out for Delivery"] } }),
      // Top 5 items by qty sold
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id:     "$items.itemId",
            name:    { $first: "$items.name" },
            emoji:   { $first: "$items.emoji" },
            sold:    { $sum: "$items.qty" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 5 },
      ]),
      // Revenue by day for the past 7 days
      Order.aggregate([
        { $match: { createdAt: { $gte: weekAgo }, status: { $ne: "Cancelled" } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$total" },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      dashboard: {
        today:   { revenue: todayOrders[0]?.revenue  || 0, orders: todayOrders[0]?.count  || 0 },
        week:    { revenue: weekOrders[0]?.revenue   || 0, orders: weekOrders[0]?.count   || 0 },
        month:   { revenue: monthOrders[0]?.revenue  || 0, orders: monthOrders[0]?.count  || 0 },
        total:   { revenue: totalOrders[0]?.revenue  || 0, orders: totalOrders[0]?.count  || 0 },
        pendingOrders: pendingCount,
        topItems,
        weeklyRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  placeOrder,
  verifyPayment,
  retryPayment,
  paymentWebhook,
  getOrder,
  getMyOrders,
  cancelOrder,
  adminGetOrders,
  adminGetOrder,
  updateOrderStatus,
  getDashboard,
};
