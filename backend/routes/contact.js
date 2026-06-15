const router = require("express").Router();
const { submitContact } = require("../controllers/contactController");
const { contactRules, validate } = require("../middleware/validators");
const rateLimit = require("express-rate-limit");

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:      5,
  message:  { success: false, message: "Too many messages sent. Please try again later." },
});

router.post("/", contactLimiter, contactRules, validate, submitContact);

module.exports = router;
