const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("ℹ️  MongoDB is already connected or connecting.");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options prevent deprecation warnings and ensure stable connections
      serverSelectionTimeoutMS: 10000, // 10s timeout for Atlas cold starts
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Limit maximum connections per instance to avoid exhausting the Atlas M0 limit (500 connections)
      minPoolSize: 1,  // Keep at least 1 connection warm
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const closeConnection = async (reason, exitCodeOrSignal) => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
      console.log(`MongoDB connection closed (${reason}).`);
    } catch (err) {
      console.error(`Error closing MongoDB connection: ${err.message}`);
    }
  }
  
  if (typeof exitCodeOrSignal === "string") {
    process.kill(process.pid, exitCodeOrSignal);
  } else {
    process.exit(exitCodeOrSignal);
  }
};

// Graceful disconnect on app termination
process.on("SIGINT", () => closeConnection("app termination (SIGINT)", 0));
process.on("SIGTERM", () => closeConnection("app termination (SIGTERM)", 0));

// Graceful disconnect on nodemon restart
process.once("SIGUSR2", () => closeConnection("nodemon restart (SIGUSR2)", "SIGUSR2"));

module.exports = connectDB;
