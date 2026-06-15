const router = require("express").Router();
const { getMenu, getMenuItem } = require("../controllers/menuController");

// Public — no auth required
router.get("/",    getMenu);
router.get("/:id", getMenuItem);

module.exports = router;
