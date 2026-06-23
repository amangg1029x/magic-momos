const User = require("../models/User");
const AdminToken = require("../models/AdminToken");
const DeliveryToken = require("../models/DeliveryToken");

// Register device token for Customers
exports.registerCustomerToken = async (req, res, next) => {
  try {
    const { token, platform } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required." });
    }

    const userId = req.user._id;

    // Pull this token from any user's FCM tokens list to prevent duplicate delivery
    await User.updateMany(
      { "fcmTokens.token": token },
      { $pull: { fcmTokens: { token } } }
    );

    // Fetch user and add token (keep max 5 tokens)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Add new token
    user.fcmTokens.push({ token, platform: platform || "unknown", updatedAt: new Date() });

    // Slice to keep only the 5 most recent tokens
    if (user.fcmTokens.length > 5) {
      user.fcmTokens = user.fcmTokens.slice(-5);
    }

    await user.save();
    res.json({ success: true, message: "Device token registered successfully." });
  } catch (err) {
    next(err);
  }
};

// Register device token for Admins
exports.registerAdminToken = async (req, res, next) => {
  try {
    const { token, platform } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required." });
    }

    const adminId = req.admin._id;

    // Remove token from other admins/entries to prevent duplicates
    await AdminToken.deleteMany({ token });

    // Create or update the token entry
    await AdminToken.findOneAndUpdate(
      { adminId, token },
      { platform: platform || "unknown" },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Admin device token registered." });
  } catch (err) {
    next(err);
  }
};

// Register device token for Delivery partners
exports.registerDeliveryToken = async (req, res, next) => {
  try {
    const { token, platform } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required." });
    }

    // Since delivery auth doesn't populate a full delivery partner model object onto req (it just signs a generic role check JWT),
    // let's grab a default delivery credential or lookup if we store credentials.
    // If deliveryProtect just validates the token, we can link tokens to the first/default DeliveryCredential ID.
    const DeliveryCredential = require("../models/DeliveryCredential");
    const cred = await DeliveryCredential.findOne();
    if (!cred) {
      return res.status(404).json({ success: false, message: "Delivery user credentials not initialized." });
    }

    // Remove token from other entries
    await DeliveryToken.deleteMany({ token });

    // Create or update token
    await DeliveryToken.findOneAndUpdate(
      { deliveryUserId: cred._id, token },
      { platform: platform || "unknown" },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Delivery device token registered." });
  } catch (err) {
    next(err);
  }
};
