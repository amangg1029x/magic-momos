const jwt   = require("jsonwebtoken");
const User  = require("../models/User");
const Admin = require("../models/Admin");

// ── Helper: extract and verify a JWT ─────────────────────────────────────────
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};

// ── Extract Bearer token from the Authorization header ────────────────────────
const extractToken = (req) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.split(" ")[1];
  return null;
};

// ── Customer middleware ───────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated. Please log in." });
  }

  const decoded = verifyToken(token, process.env.JWT_SECRET);
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Token is invalid or expired." });
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: "User account not found or deactivated." });
  }

  req.user = user;
  next();
};

// ── Admin middleware ──────────────────────────────────────────────────────────
const adminProtect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: "Admin access required." });
  }

  const decoded = verifyToken(token, process.env.JWT_ADMIN_SECRET);
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Admin token is invalid or expired." });
  }

  const admin = await Admin.findById(decoded.id).select("-password");
  if (!admin || !admin.isActive) {
    return res.status(401).json({ success: false, message: "Admin account not found or deactivated." });
  }

  req.admin = admin;
  next();
};

// ── Optional auth: attaches user if token present, doesn't block guests ───────
const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  const decoded = verifyToken(token, process.env.JWT_SECRET);
  if (!decoded) return next();

  const user = await User.findById(decoded.id).select("-password");
  if (user && user.isActive) req.user = user;
  next();
};

module.exports = { protect, adminProtect, optionalAuth };
