const MenuItem = require("../models/MenuItem");

// ── GET /api/menu ─────────────────────────────────────────────────────────────
// Public. Supports ?category=momos&veg=true&search=chicken
const getMenu = async (req, res, next) => {
  try {
    const { category, veg, spicy, popular, search, includeUnavailable } = req.query;
    const filter = {};

    // Only admins (who pass includeUnavailable=true) see unavailable items
    if (includeUnavailable !== "true") filter.available = true;

    if (category && category !== "all") filter.category = category;
    if (veg    !== undefined) filter.veg    = veg    === "true";
    if (spicy  !== undefined) filter.spicy  = spicy  === "true";
    if (popular!== undefined) filter.popular= popular=== "true";

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } },
      ];
    }

    const items = await MenuItem.find(filter).sort({ category: 1, itemId: 1 });

    res.json({ success: true, count: items.length, items });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/menu/:id ─────────────────────────────────────────────────────────
const getMenuItem = async (req, res, next) => {
  try {
    // Support both MongoDB _id and numeric itemId
    const query = isNaN(req.params.id)
      ? { _id: req.params.id }
      : { itemId: Number(req.params.id) };

    const item = await MenuItem.findOne(query);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found." });
    }
    res.json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/menu ────────────────────────────────────────────────────────────
// Admin only
const createMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, message: "Menu item created.", item });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/menu/:id ─────────────────────────────────────────────────────────
// Admin only
const updateMenuItem = async (req, res, next) => {
  try {
    const query = isNaN(req.params.id)
      ? { _id: req.params.id }
      : { itemId: Number(req.params.id) };

    const item = await MenuItem.findOneAndUpdate(query, req.body, {
      new:           true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found." });
    }
    res.json({ success: true, message: "Menu item updated.", item });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/menu/:id ──────────────────────────────────────────────────────
// Admin only — soft delete by toggling available=false, or hard delete
const deleteMenuItem = async (req, res, next) => {
  try {
    const { hard } = req.query; // ?hard=true for permanent deletion
    const query = isNaN(req.params.id)
      ? { _id: req.params.id }
      : { itemId: Number(req.params.id) };

    if (hard === "true") {
      const item = await MenuItem.findOneAndDelete(query);
      if (!item) return res.status(404).json({ success: false, message: "Item not found." });
      return res.json({ success: true, message: "Menu item permanently deleted." });
    }

    // Soft delete: just mark unavailable
    const item = await MenuItem.findOneAndUpdate(
      query,
      { available: false },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: "Item not found." });

    res.json({ success: true, message: "Menu item hidden from menu.", item });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/menu/:id/toggle ────────────────────────────────────────────────
// Admin only: quickly toggle available status
const toggleAvailability = async (req, res, next) => {
  try {
    const query = isNaN(req.params.id)
      ? { _id: req.params.id }
      : { itemId: Number(req.params.id) };

    const item = await MenuItem.findOne(query);
    if (!item) return res.status(404).json({ success: false, message: "Item not found." });

    item.available = !item.available;
    await item.save();

    res.json({
      success: true,
      message: `Item ${item.available ? "shown on" : "hidden from"} menu.`,
      item,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
