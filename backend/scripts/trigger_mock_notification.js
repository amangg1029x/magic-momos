require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Notification = require("../models/Notification");

async function run() {
  await connectDB();
  
  const mockNotification = new Notification({
    recipientRole: "admin",
    type: "order_placed",
    title: "Test Order #MOCK77 🥟",
    body: "John Doe placed a mock order for ₹299 (COD)",
    read: false,
    createdAt: new Date()
  });

  await mockNotification.save();
  console.log("Mock notification created successfully!");
  
  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
}

run();
