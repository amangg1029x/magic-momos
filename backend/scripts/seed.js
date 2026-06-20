/**
 * Seed script
 * Run once: npm run seed
 * Idempotent — safe to re-run (uses upsert for menu items)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Admin    = require("../models/Admin");
const MenuItem = require("../models/MenuItem");
const Setting  = require("../models/Setting");

const seed = async () => {
  try {
    console.log("🌱  Connecting to MongoDB…");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  Connected.\n");

    // ── 4. Seed default store settings ────────────────────────────────────────
    console.log("⚙️  Seeding default store configurations…");
    const existingSettings = await Setting.findOne();
    if (existingSettings) {
      console.log("   ℹ  Store settings already exist.\n");
    } else {
      await Setting.create({});
      console.log("   ✔ Default store settings initialized!\n");
    }

    console.log("🎉  Seed complete!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌  Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
