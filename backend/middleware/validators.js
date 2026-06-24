const { body, param, validationResult } = require("express-validator");

// ── Collect validation errors and respond if any ─────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth validators ──────────────────────────────────────────────────────────
const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phone")
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit Indian mobile number"),
];

const loginRules = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ── Menu validators ───────────────────────────────────────────────────────────
const menuItemRules = [
  body("category")
    .isIn(["momos", "rolls", "snacks", "sides", "drinks"])
    .withMessage("Invalid category"),
  body("name").trim().notEmpty().withMessage("Item name is required"),
  body("desc").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 1 }).withMessage("Price must be a positive number"),
  body("veg").optional().isBoolean(),
  body("spicy").optional().isBoolean(),
  body("popular").optional().isBoolean(),
  body("available").optional().isBoolean(),
  body("halfPrice").optional().isFloat({ min: 1 }).withMessage("Half price must be a positive number"),
  body("pieces").optional().isInt({ min: 1 }).withMessage("Pieces must be a positive integer"),
  body("halfPieces").optional().isInt({ min: 1 }).withMessage("Half pieces must be a positive integer"),
];

// ── Order validators ──────────────────────────────────────────────────────────
const placeOrderRules = [
  body("customer.name").trim().notEmpty().withMessage("Customer name is required"),
  body("customer.phone")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Valid 10-digit phone number required"),
  body("customer.email").optional().isEmail().withMessage("Invalid email"),
  body("items").isArray({ min: 1 }).withMessage("Order must contain at least one item"),
  body("items.*.itemId").isNumeric().withMessage("Each item must have a valid itemId"),
  body("items.*.qty").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("items.*.size").optional().isIn(["half", "full"]).withMessage("Invalid item size"),
  body("address.street").trim().notEmpty().withMessage("Delivery address is required"),
  body("address.pincode")
    .matches(/^\d{6}$/)
    .withMessage("Valid 6-digit pincode required"),
  body("paymentMethod").isIn(["cod", "online"]).withMessage("Invalid payment method"),
];

// ── Contact form validators ───────────────────────────────────────────────────
const contactRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters"),
  body("phone").optional().matches(/^[6-9]\d{9}$/).withMessage("Invalid phone number"),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  menuItemRules,
  placeOrderRules,
  contactRules,
};
