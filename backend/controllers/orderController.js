const Order    = require("../models/Order");
const MenuItem = require("../models/MenuItem");

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
      paymentStatus: paymentMethod === "online" ? "Pending" : "Pending",
      specialInstructions,
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: {
        _id:           order._id,
        orderNumber:   order.orderNumber,
        status:        order.status,
        subtotal:      order.subtotal,
        deliveryCharge:order.deliveryCharge,
        total:         order.total,
        items:         order.items,
        estimatedTime: "20–30 mins",
        createdAt:     order.createdAt,
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
      Order.find({ "customer.userId": req.user._id })
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
const adminGetOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber:     { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone":{ $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page:  Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
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
  getOrder,
  getMyOrders,
  cancelOrder,
  adminGetOrders,
  adminGetOrder,
  updateOrderStatus,
  getDashboard,
};
