require("dotenv").config();
const geocodeRouter = require("./routes/geocode.js");

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const rateLimit  = require("express-rate-limit");

const connectDB                   = require("./config/db");
const { errorHandler, notFound }  = require("./middleware/errorHandler");

// ── Route modules ─────────────────────────────────────────────────────────────
const authRoutes     = require("./routes/auth");
const adminRoutes    = require("./routes/admin");
const menuRoutes     = require("./routes/menu");
const orderRoutes    = require("./routes/orders");
const contactRoutes  = require("./routes/contact");
const deliveryRoutes = require("./routes/delivery");
const settingsRoutes = require("./routes/settings");
const couponRoutes   = require("./routes/coupons");

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
// IMPORTANT: the Razorpay webhook route needs the raw, unparsed request body
// to verify its signature (re-serializing parsed JSON can change the byte
// string and break verification). We skip the global JSON parser for that
// one path and let routes/orders.js apply express.raw() there instead.
app.use((req, res, next) => {
  if (req.originalUrl === "/api/orders/razorpay-webhook") return next();
  express.json({ limit: "10kb" })(req, res, next);
});
app.use((req, res, next) => {
  if (req.originalUrl === "/api/orders/razorpay-webhook") return next();
  express.urlencoded({ extended: true })(req, res, next);
});

// ── HTTP request logger (dev only) ───────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Global rate limiter (API-wide) ────────────────────────────────────────────
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max:      process.env.NODE_ENV === "production" ? 200 : 10000,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, message: "Too many requests. Please slow down." },
  })
);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Magic Momos API is running 🥟",
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ── Route mounts ──────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/menu",     menuRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/contact",  contactRoutes);
app.use("/api/geocode",  geocodeRouter);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/coupons",  couponRoutes);

// ── 404 + global error handler ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

app.set("io", io);

const jwt = require("jsonwebtoken");
const DeliveryCredential = require("./models/DeliveryCredential");

io.on("connection", async (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token) {
    try {
      const decodedAdmin = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
      if (decodedAdmin) {
        socket.role = "admin";
        socket.join("admin");
        console.log(`[Socket] Socket ${socket.id} connected as Admin`);
      }
    } catch (e) {
      try {
        const decodedDelivery = jwt.verify(token, process.env.JWT_DELIVERY_SECRET);
        if (decodedDelivery && decodedDelivery.role === "delivery") {
          socket.role = "delivery";
          socket.deliveryBoyId = decodedDelivery.id;
          socket.join(`delivery-boy-${decodedDelivery.id}`);

          const rider = await DeliveryCredential.findById(decodedDelivery.id);
          if (rider && rider.isActive && !rider.isSleeping) {
            socket.join("delivery-active");
            console.log(`[Socket] Rider ${rider.name} joined delivery-active`);
          }
        }
      } catch (e) {
        try {
          const decodedCustomer = jwt.verify(token, process.env.JWT_SECRET);
          if (decodedCustomer) {
            socket.role = "customer";
            socket.customerId = decodedCustomer.id;
            socket.join(`customer-${decodedCustomer.id}`);
            console.log(`[Socket] Customer ${decodedCustomer.id} joined customer room`);
          }
        } catch (e) {
          // invalid token
        }
      }
    }
  }

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`[Socket] Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("join-delivery", async () => {
    if (socket.role === "delivery" && socket.deliveryBoyId) {
      const rider = await DeliveryCredential.findById(socket.deliveryBoyId);
      if (rider && rider.isActive && !rider.isSleeping) {
        socket.join("delivery-active");
        console.log(`[Socket] Dynamic join: Rider ${rider.name} joined delivery-active`);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀  Magic Momos API running on port ${PORT}`);
  console.log(`    ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`    Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = server; // exported for testing
