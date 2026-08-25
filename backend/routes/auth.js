const router  = require("express").Router();
const { register, login, getMe, updateMe, changePassword, forgotPassword, resetPassword, deleteMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { registerRules, loginRules, validate } = require("../middleware/validators");
const rateLimit = require("express-rate-limit");
const {
  getCustomerNotifications,
  markCustomerRead,
  markAllCustomerRead,
} = require("../controllers/notificationController");

// Stricter rate limit on auth endpoints to slow brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      20,
  message:  { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
});

router.post("/register",        authLimiter, registerRules, validate, register);
router.post("/login",           authLimiter, loginRules,    validate, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password",  authLimiter, resetPassword);

// Protected routes — require valid customer JWT
router.get(    "/me",              protect, getMe);
router.put(    "/me",              protect, updateMe);
router.delete( "/me",              protect, deleteMe);
router.put(    "/change-password", protect, changePassword);

// Customer notifications
router.get(   "/notifications",             protect, getCustomerNotifications);
router.patch( "/notifications/read-all",    protect, markAllCustomerRead);
router.patch( "/notifications/:id/read",    protect, markCustomerRead);

// Device Token for Push Notifications
const { registerCustomerToken } = require("../controllers/pushController");
router.post("/device-token", protect, registerCustomerToken);

module.exports = router;
