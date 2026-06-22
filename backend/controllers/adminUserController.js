const User = require("../models/User");
const Order = require("../models/Order");

// ── GET /api/admin/users ─────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    // Enhance users with order statistics
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        const stats = await Order.aggregate([
          { $match: { "customer.userId": user._id, status: { $ne: "Cancelled" } } },
          { $group: { _id: null, totalSpent: { $sum: "$total" }, orderCount: { $sum: 1 } } }
        ]);
        return {
          ...user.toObject(),
          orderCount: stats[0]?.orderCount || 0,
          totalSpent: stats[0]?.totalSpent || 0,
        };
      })
    );

    res.json({
      success: true,
      users: enhancedUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/admin/users/:id/toggle-status ──────────────────────────────────
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User status updated to ${user.isActive ? "active" : "blocked"}`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  toggleUserStatus,
};
