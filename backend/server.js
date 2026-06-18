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
    max:      200,
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

// ── 404 + global error handler ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  Magic Momos API running on port ${PORT}`);
  console.log(`    ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`    Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app; // exported for testing
