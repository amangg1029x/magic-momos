const router = require("express").Router();
const { validateCoupon, getActiveCoupons } = require("../controllers/couponController");
const { optionalAuth } = require("../middleware/auth");

// Public list active coupons
router.get("/", getActiveCoupons);

// Public validate route (optional auth to identify logged-in users)
router.post("/validate", optionalAuth, validateCoupon);

module.exports = router;
