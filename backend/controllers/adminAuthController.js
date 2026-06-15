const jwt   = require("jsonwebtoken");
const Admin = require("../models/Admin");

const signAdminToken = (id) =>
  jwt.sign({ id }, process.env.JWT_ADMIN_SECRET, {
    expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || "1d",
  });

// ── POST /api/admin/login ─────────────────────────────────────────────────────
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials." });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: "Admin account is deactivated." });
    }

    // Update last login timestamp
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = signAdminToken(admin._id);
    admin.password = undefined;

    res.json({ success: true, token, admin });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/me ─────────────────────────────────────────────────────────
const getAdminMe = (req, res) => {
  res.json({ success: true, admin: req.admin });
};

module.exports = { adminLogin, getAdminMe };
