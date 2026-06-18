const router = require("express").Router();

const { adminLogin, getAdminMe }    = require("../controllers/adminAuthController");
const { getDeliveryCredentials, updateDeliveryCredentials } = require("../controllers/deliveryController");
const {
  adminGetOrders,
  adminGetOrder,
  updateOrderStatus,
  getDashboard,
}                                    = require("../controllers/orderController");
const {
  adminGetContacts,
  adminUpdateContact,
}                                    = require("../controllers/contactController");
const {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
}                                    = require("../controllers/menuController");
const { adminProtect }               = require("../middleware/auth");
const { loginRules, menuItemRules, validate } = require("../middleware/validators");
const rateLimit                      = require("express-rate-limit");

const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: "Too many login attempts. Try again in 15 minutes." },
});

// ── Public admin auth ─────────────────────────────────────────────────────────
router.post("/login", adminAuthLimiter, loginRules, validate, adminLogin);

// ── Everything below requires a valid admin JWT ───────────────────────────────
router.use(adminProtect);

router.get("/me", getAdminMe);

// Dashboard
router.get("/dashboard", getDashboard);

// Orders
router.get("/orders",               adminGetOrders);
router.get("/orders/:id",           adminGetOrder);
router.patch("/orders/:id/status",  updateOrderStatus);

// Menu management
router.post("/menu",                   menuItemRules, validate, createMenuItem);
router.put("/menu/:id",                menuItemRules, validate, updateMenuItem);
router.delete("/menu/:id",             deleteMenuItem);
router.patch("/menu/:id/toggle",       toggleAvailability);

// Contact messages
router.get("/contacts",         adminGetContacts);
router.patch("/contacts/:id",   adminUpdateContact);

// Delivery credentials management
router.get("/delivery-credentials", getDeliveryCredentials);
router.put("/delivery-credentials", updateDeliveryCredentials);

module.exports = router;
