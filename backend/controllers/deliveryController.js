const jwt   = require("jsonwebtoken");
const Order = require("../models/Order");
const DeliveryCredential = require("../models/DeliveryCredential");

const ACTIVE_STATUSES = ["Preparing", "Out for Delivery"];

const signDeliveryToken = (deliveryBoy) =>
  jwt.sign({ id: deliveryBoy._id, role: "delivery" }, process.env.JWT_DELIVERY_SECRET, {
    expiresIn: process.env.JWT_DELIVERY_EXPIRES_IN || "12h",
  });

// Helper to ensure at least one delivery credential document exists
const ensureDefaultCredentials = async () => {
  const count = await DeliveryCredential.countDocuments();
  if (count === 0) {
    await DeliveryCredential.create({
      name: "Default Rider",
      phone: "9999999999",
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

    if (!cred.isActive) {
      return res.status(401).json({ success: false, message: "This delivery account is inactive." });
    }

    const token = signDeliveryToken(cred);
    res.json({
      success: true,
      token,
      deliveryBoy: {
        _id: cred._id,
        name: cred.name,
        phone: cred.phone,
        email: cred.email,
        isSleeping: cred.isSleeping,
      }
    });
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
// Returns active orders (Preparing / Out for Delivery) that are:
// - Not assigned to any delivery boy (available to accept)
// - OR assigned to the currently logged in delivery boy
const getDeliveryOrders = async (req, res, next) => {
  try {
    const orders = await Order.find(
      {
        status: { $in: ACTIVE_STATUSES },
        $or: [
          { deliveryBoy: { $exists: false } },
          { deliveryBoy: null },
          { deliveryBoy: req.deliveryBoy._id },
        ],
      },
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
        deliveryBoy:   1,
      }
    ).populate("deliveryBoy", "name phone email").sort({ createdAt: -1 });

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

    if (!order.deliveryBoy || order.deliveryBoy.toString() !== req.deliveryBoy._id.toString()) {
      return res.status(403).json({ success: false, message: "This order is not assigned to you." });
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

    // Broadcast update to admin and customer in real-time
    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("order_status_update", {
        orderId: order._id,
        status: order.status,
      });
      if (order.customer?.userId) {
        io.to(`customer-${order.customer.userId}`).emit("order_status_update", {
          orderId: order._id,
          status: order.status,
        });
      }
    }

    res.json({ success: true, message: `Order marked as ${status}.`, order });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/delivery/history ──────────────────────────────────────────────────
const getDeliveryHistory = async (req, res, next) => {
  try {
    const orders = await Order.find(
      { status: "Delivered", deliveryBoy: req.deliveryBoy._id },
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

    // Verify order assignment
    const orderCheck = await Order.findById(req.params.id);
    if (!orderCheck) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    if (!orderCheck.deliveryBoy || orderCheck.deliveryBoy.toString() !== req.deliveryBoy._id.toString()) {
      return res.status(403).json({ success: false, message: "This order is not assigned to you." });
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
      { new: true, select: "orderNumber status deliveryLocation customer" }
    );

    // Send realtime location updates to customer and admin
    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("location_update", {
        orderId: order._id,
        deliveryLocation: order.deliveryLocation,
      });
      if (order.customer?.userId) {
        io.to(`customer-${order.customer.userId}`).emit("location_update", {
          orderId: order._id,
          deliveryLocation: order.deliveryLocation,
        });
      }
    }

    res.json({ success: true, deliveryLocation: order.deliveryLocation });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/delivery/me (delivery only) ───────────────────────────────
const getDeliveryMe = async (req, res, next) => {
  try {
    const boy = await DeliveryCredential.findById(req.deliveryBoy._id);
    if (!boy) {
      return res.status(404).json({ success: false, message: "Delivery boy not found." });
    }
    res.json({
      success: true,
      deliveryBoy: {
        _id: boy._id,
        name: boy.name,
        phone: boy.phone,
        email: boy.email,
        isSleeping: boy.isSleeping,
      }
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/delivery/sleep (delivery only) ──────────────────────────
const toggleSleepStatus = async (req, res, next) => {
  try {
    const { isSleeping } = req.body;
    if (isSleeping === undefined) {
      return res.status(400).json({ success: false, message: "isSleeping status is required." });
    }

    const boy = await DeliveryCredential.findById(req.deliveryBoy._id);
    if (!boy) {
      return res.status(404).json({ success: false, message: "Delivery boy not found." });
    }

    boy.isSleeping = isSleeping;
    await boy.save();

    // Dynamically adjust socket room based on sleep status
    const io = req.app.get("io");
    if (io) {
      const room = `delivery-boy-${boy._id}`;
      const sockets = await io.in(room).fetchSockets();
      for (const socket of sockets) {
        if (isSleeping) {
          socket.leave("delivery-active");
          console.log(`[Socket] Rider ${boy.name} socket ${socket.id} left delivery-active`);
        } else {
          socket.join("delivery-active");
          console.log(`[Socket] Rider ${boy.name} socket ${socket.id} joined delivery-active`);
        }
      }

      // Notify all admins of the sleep status change
      io.to("admin").emit("delivery_boy_status_update", {
        deliveryBoyId: boy._id,
        isSleeping: boy.isSleeping,
        isActive: boy.isActive,
      });
    }

    res.json({
      success: true,
      message: `Status updated to ${isSleeping ? "sleeping" : "active"}.`,
      deliveryBoy: {
        _id: boy._id,
        name: boy.name,
        phone: boy.phone,
        email: boy.email,
        isSleeping: boy.isSleeping,
      }
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/delivery/orders/:id/accept (delivery only) ──────────────────
const acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.status !== "Preparing") {
      return res.status(400).json({ success: false, message: `Cannot accept order in status ${order.status}.` });
    }

    if (order.deliveryBoy) {
      return res.status(400).json({ success: false, message: "This order has already been accepted by another rider." });
    }

    // Atomically assign delivery boy
    order.deliveryBoy = req.deliveryBoy._id;
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate("deliveryBoy", "name phone email");

    const io = req.app.get("io");
    if (io) {
      // Broadcast to other riders to stop ringing
      io.to("delivery-active").emit("order_accepted", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        deliveryBoy: {
          _id: req.deliveryBoy._id,
          name: req.deliveryBoy.name,
          phone: req.deliveryBoy.phone,
        }
      });

      // Broadcast to customer
      if (order.customer?.userId) {
        io.to(`customer-${order.customer.userId}`).emit("order_assigned", {
          orderId: order._id,
          deliveryBoy: {
            name: req.deliveryBoy.name,
            phone: req.deliveryBoy.phone,
          }
        });
      }

      // Broadcast to admin
      io.to("admin").emit("order_assigned", {
        orderId: order._id,
        deliveryBoy: {
          name: req.deliveryBoy.name,
          phone: req.deliveryBoy.phone,
        }
      });
    }

    res.json({
      success: true,
      message: "Order accepted successfully.",
      order: populatedOrder,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/delivery-boys (admin only) ──────────────────────────
const getDeliveryBoys = async (req, res, next) => {
  try {
    const boys = await DeliveryCredential.find({}, "-password").sort({ createdAt: -1 });
    res.json({ success: true, deliveryBoys: boys });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/admin/delivery-boys (admin only) ──────────────────────────
const addDeliveryBoy = async (req, res, next) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const exists = await DeliveryCredential.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Delivery boy email already exists." });
    }

    const boy = await DeliveryCredential.create({ name, phone, email, password });
    
    // Notify admins of new rider in real-time
    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("delivery_boys_changed");
    }

    res.status(201).json({ success: true, message: "Delivery boy added successfully.", deliveryBoy: boy });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/admin/delivery-boys/:id (admin only) ───────────────────────
const updateDeliveryBoy = async (req, res, next) => {
  try {
    const { name, phone, email, password, isActive } = req.body;
    const boy = await DeliveryCredential.findById(req.params.id);
    if (!boy) {
      return res.status(404).json({ success: false, message: "Delivery boy not found." });
    }

    if (email && email !== boy.email) {
      const exists = await DeliveryCredential.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, message: "Email already in use." });
      }
      boy.email = email;
    }

    if (name) boy.name = name;
    if (phone) boy.phone = phone;
    if (password) boy.password = password;
    if (isActive !== undefined) boy.isActive = isActive;

    await boy.save();

    // Real-time socket notification of status/profile update
    const io = req.app.get("io");
    if (io) {
      // If de-activated, force disconnect or kick out of rooms
      if (isActive === false) {
        const room = `delivery-boy-${boy._id}`;
        const sockets = await io.in(room).fetchSockets();
        for (const s of sockets) {
          s.leave("delivery-active");
          s.emit("unauthorized"); // tell client to logout
        }
      }
      io.to("admin").emit("delivery_boy_status_update", {
        deliveryBoyId: boy._id,
        isSleeping: boy.isSleeping,
        isActive: boy.isActive,
      });
      io.to("admin").emit("delivery_boys_changed");
    }

    res.json({ success: true, message: "Delivery boy updated successfully.", deliveryBoy: boy });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/admin/delivery-boys/:id (admin only) ────────────────────
const deleteDeliveryBoy = async (req, res, next) => {
  try {
    const boy = await DeliveryCredential.findByIdAndDelete(req.params.id);
    if (!boy) {
      return res.status(404).json({ success: false, message: "Delivery boy not found." });
    }

    // Real-time socket notification
    const io = req.app.get("io");
    if (io) {
      const room = `delivery-boy-${boy._id}`;
      const sockets = await io.in(room).fetchSockets();
      for (const s of sockets) {
        s.leave("delivery-active");
        s.emit("unauthorized");
      }
      io.to("admin").emit("delivery_boys_changed");
    }

    res.json({ success: true, message: "Delivery boy removed successfully." });
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
  getDeliveryMe,
  toggleSleepStatus,
  acceptOrder,
  getDeliveryBoys,
  addDeliveryBoy,
  updateDeliveryBoy,
  deleteDeliveryBoy,
};
