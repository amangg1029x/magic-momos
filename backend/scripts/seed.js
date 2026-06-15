/**
 * Seed script
 * Run once: npm run seed
 * Idempotent — safe to re-run (uses upsert for menu items)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Admin    = require("../models/Admin");
const MenuItem = require("../models/MenuItem");

// ── Full menu from your frontend menuData.js ──────────────────────────────────
const MENU_ITEMS = [
  // Momos
  { itemId:1,  category:"momos",  emoji:"🥟", name:"Steam Veg Momos",    desc:"Soft, pillowy dumplings stuffed with spiced mixed vegetables. Served with signature red chutney.", price:60,  rating:4.9, reviews:312, veg:true,  spicy:false, popular:true  },
  { itemId:2,  category:"momos",  emoji:"🥟", name:"Steam Chicken Momos",desc:"Tender chicken keema dumplings, steamed to juicy perfection with garlic & ginger.",              price:80,  rating:4.8, reviews:265, veg:false, spicy:false, popular:true  },
  { itemId:3,  category:"momos",  emoji:"🥟", name:"Fried Veg Momos",    desc:"Golden crispy pan-fried dumplings — that crunch before the juicy filling is pure bliss.",        price:70,  rating:4.7, reviews:198, veg:true,  spicy:false, popular:false },
  { itemId:4,  category:"momos",  emoji:"🥟", name:"Fried Chicken Momos",desc:"Crispy deep-fried chicken dumplings richly spiced with our secret masala blend.",               price:90,  rating:4.8, reviews:176, veg:false, spicy:true,  popular:false },
  { itemId:5,  category:"momos",  emoji:"🥟", name:"Tandoori Momos",     desc:"Marinated in yoghurt & spices then charred in the tandoor. Smoky, bold, unforgettable.",        price:90,  rating:4.9, reviews:221, veg:true,  spicy:true,  popular:true  },
  { itemId:6,  category:"momos",  emoji:"🥟", name:"Kurkure Momos",      desc:"Coated in a crunchy batter and deep-fried to extra crispiness. The crowd-pleaser.",              price:80,  rating:4.6, reviews:143, veg:true,  spicy:false, popular:false },
  // Rolls
  { itemId:7,  category:"rolls",  emoji:"🌯", name:"Paneer Roll",        desc:"Smoky spiced paneer in a flaky paratha wrap with onion, mint chutney and love.",                 price:80,  rating:4.8, reviews:144, veg:true,  spicy:false, popular:true  },
  { itemId:8,  category:"rolls",  emoji:"🌯", name:"Chicken Roll",       desc:"Juicy grilled chicken strips with caramelised onion and our house schezwan sauce.",              price:100, rating:4.7, reviews:132, veg:false, spicy:true,  popular:false },
  { itemId:9,  category:"rolls",  emoji:"🌯", name:"Veg Masala Roll",    desc:"Mixed seasonal vegetables tossed in masala, wrapped in a golden whole-wheat paratha.",           price:70,  rating:4.5, reviews:89,  veg:true,  spicy:false, popular:false },
  { itemId:10, category:"rolls",  emoji:"🌯", name:"Egg Roll",           desc:"Classic Kolkata-style egg roll — a thin omelette wrapped in paratha with green chutney.",        price:80,  rating:4.6, reviews:108, veg:false, spicy:false, popular:false },
  // Snacks
  { itemId:11, category:"snacks", emoji:"🫕", name:"Aloo Samosa",        desc:"The timeless Delhi street hero — crispy golden pastry stuffed with spiced potato & peas.",       price:30,  rating:4.8, reviews:402, veg:true,  spicy:false, popular:true  },
  { itemId:12, category:"snacks", emoji:"🫕", name:"Chicken Samosa",     desc:"Minced chicken keema with aromatic spices, encased in shatteringly crispy pastry.",              price:40,  rating:4.6, reviews:187, veg:false, spicy:true,  popular:false },
  { itemId:13, category:"snacks", emoji:"🧆", name:"Veg Cutlet",         desc:"Spiced mashed potato & vegetable patties, pan-fried to a perfect golden crust.",                 price:50,  rating:4.4, reviews:76,  veg:true,  spicy:false, popular:false },
  { itemId:14, category:"snacks", emoji:"🍘", name:"Bread Pakora",       desc:"Thick bread slices dipped in spiced chickpea batter and deep-fried until crispy.",               price:40,  rating:4.5, reviews:94,  veg:true,  spicy:false, popular:false },
  // Sides
  { itemId:15, category:"sides",  emoji:"🍟", name:"French Fries",       desc:"Twice-fried golden strips dusted with our secret house seasoning. Simply irresistible.",         price:70,  rating:4.7, reviews:289, veg:true,  spicy:false, popular:true  },
  { itemId:16, category:"sides",  emoji:"🌶️", name:"Chilli Potato",      desc:"Wok-tossed Indo-Chinese potatoes with bell peppers, soy sauce and a punchy chilli kick.",        price:80,  rating:4.8, reviews:198, veg:true,  spicy:true,  popular:true  },
  { itemId:17, category:"sides",  emoji:"🌽", name:"Masala Corn",        desc:"Sweet corn kernels tossed with lemon butter, chilli and chaat masala.",                          price:50,  rating:4.5, reviews:112, veg:true,  spicy:false, popular:false },
  { itemId:18, category:"sides",  emoji:"🧄", name:"Garlic Bread",       desc:"Toasted baguette slices slathered with herb garlic butter, golden and fragrant.",                price:60,  rating:4.4, reviews:67,  veg:true,  spicy:false, popular:false },
  // Drinks
  { itemId:19, category:"drinks", emoji:"☕", name:"Cutting Chai",       desc:"Strong, spiced Indian tea brewed the old-school way. The perfect companion for momos.",          price:20,  rating:4.9, reviews:534, veg:true,  spicy:false, popular:true  },
  { itemId:20, category:"drinks", emoji:"🥛", name:"Sweet Lassi",        desc:"Chilled, thick yoghurt blended with sugar and a hint of cardamom. Cooling perfection.",          price:40,  rating:4.7, reviews:167, veg:true,  spicy:false, popular:false },
  { itemId:21, category:"drinks", emoji:"🍋", name:"Nimbu Paani",        desc:"Fresh squeezed lemon water with black salt, cumin and a touch of mint.",                         price:30,  rating:4.6, reviews:143, veg:true,  spicy:false, popular:false },
  { itemId:22, category:"drinks", emoji:"🧃", name:"Cold Drink (Can)",   desc:"Your choice of chilled aerated beverage — Coke, Sprite, Fanta or Limca.",                       price:30,  rating:4.3, reviews:89,  veg:true,  spicy:false, popular:false },
];

const seed = async () => {
  try {
    console.log("🌱  Connecting to MongoDB…");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  Connected.\n");

    // ── 1. Seed menu items (upsert by itemId) ────────────────────────────────
    console.log("📋  Seeding menu items…");
    let created = 0, updated = 0;
    for (const item of MENU_ITEMS) {
      const result = await MenuItem.findOneAndUpdate(
        { itemId: item.itemId },
        { $set: item },
        { upsert: true, new: true }
      );
      if (result.createdAt === result.updatedAt) created++; else updated++;
    }
    console.log(`   ✔ ${created} created, ${updated} updated (${MENU_ITEMS.length} total)\n`);

    // ── 2. Seed admin account ─────────────────────────────────────────────────
    console.log("👤  Seeding admin account…");
    const adminEmail    = process.env.ADMIN_EMAIL    || "admin@magicmomos.in";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";
    const adminName     = process.env.ADMIN_NAME     || "Admin";

    const existing = await Admin.findOne({ email: adminEmail });
    if (existing) {
      console.log(`   ℹ  Admin already exists: ${adminEmail}`);
    } else {
      await Admin.create({
        name:     adminName,
        email:    adminEmail,
        password: adminPassword,
        role:     "superadmin",
      });
      console.log(`   ✔ Admin created: ${adminEmail}`);
      console.log(`   🔑 Password: ${adminPassword}  ← change this after first login!\n`);
    }

    console.log("🎉  Seed complete!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌  Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
