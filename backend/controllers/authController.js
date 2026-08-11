const jwt              = require("jsonwebtoken");
const crypto           = require("crypto");
const User             = require("../models/User");
const { getTransporter } = require("../utils/mailer");


// ── Helper: sign a customer JWT ───────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    const user = await User.create({ name, email, password, phone });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated." });
    }

    const token = signToken(user._id);
    // Remove password from the response object
    user.password = undefined;

    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── PUT /api/auth/me ──────────────────────────────────────────────────────────
const updateMe = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "addresses"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/auth/change-password ─────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both passwords are required." });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always respond success to prevent user enumeration
    if (!user) {
      return res.json({ success: true, message: "If that email is registered, you'll receive a reset link shortly." });
    }

    // Generate a raw token and store hashed version
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.passwordResetToken = hashed;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.CLIENT_URL || "https://magicmomos.app"}/#reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    const mailer = getTransporter();
    if (mailer) {
      try {
        await mailer.sendMail({
          from:    `"Magic Momos" <${process.env.SMTP_USER || "magicmomos12@gmail.com"}>`,
          to:      user.email,
          subject: "Reset your Magic Momos password 🔑",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
              <h2 style="color:#E8284B">Password Reset Request</h2>
              <p>Hi ${user.name},</p>
              <p>We received a request to reset your password. Click the button below to choose a new one.</p>
              <p style="text-align:center;margin:32px 0">
                <a href="${resetLink}"
                   style="background:#E8284B;color:#fff;padding:14px 32px;border-radius:50px;
                          text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
                  Reset Password
                </a>
              </p>
              <p style="color:#888;font-size:13px">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
              <p style="color:#aaa;font-size:12px">Magic Momos · Badarpur, New Delhi</p>
            </div>
          `,
        });
        console.log(`[Auth] Reset email sent to ${user.email}`);
      } catch (err) {
        console.error("[Auth] Reset email error:", err.message);
      }
    }

    res.json({ success: true, message: "If that email is registered, you'll receive a reset link shortly." });

  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/reset-password ────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) {
      return res.status(400).json({ success: false, message: "Token, email, and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ success: false, message: "Reset link is invalid or has expired." });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully! You can now sign in." });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe, changePassword, forgotPassword, resetPassword };
