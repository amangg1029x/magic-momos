const router = require("express").Router();
const { getSettings } = require("../controllers/settingController");

// Public GET settings
router.get("/", getSettings);

module.exports = router;
