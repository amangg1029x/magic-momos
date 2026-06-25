const Setting = require("../models/Setting");
const { createNotification } = require("./notificationController");

// ── GET /api/settings or GET /api/admin/settings ─────────────────────────────
// Returns store settings, creating them if they don't exist yet
const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // Create settings with defaults defined in schema
      settings = await Setting.create({});
    }
    res.json({
      success: true,
      settings,
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/admin/settings ──────────────────────────────────────────────────
// Updates store settings, secured by adminProtect middleware
const updateSettings = async (req, res, next) => {
  try {
    const {
      businessName,
      phone,
      email,
      address,
      deliveryFee,
      freeDeliveryThreshold,
      openTime,
      closeTime,
      codEnabled,
      onlinePaymentEnabled,
      storeStatusOverride,
      announcementText,
    } = req.body;

    const updateData = {
      businessName,
      phone,
      email,
      address,
      deliveryFee: Number(deliveryFee),
      freeDeliveryThreshold: Number(freeDeliveryThreshold),
      openTime,
      closeTime,
      codEnabled: Boolean(codEnabled),
      onlinePaymentEnabled: Boolean(onlinePaymentEnabled),
      storeStatusOverride,
      announcementText,
    };

    // Filter out undefined values to only update what was provided
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const oldSettings = await Setting.findOne();

    const settings = await Setting.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    // Broadcast announcement as a customer notification when it changes
    if (
      announcementText &&
      announcementText.trim() &&
      announcementText.trim() !== (oldSettings?.announcementText || "").trim()
    ) {
      createNotification({
        recipientId:   null,           // null = broadcast to all customers
        recipientRole: "customer",
        type:          "announcement",
        title:         "📢 Announcement",
        body:          announcementText.trim(),
      });
    }

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
