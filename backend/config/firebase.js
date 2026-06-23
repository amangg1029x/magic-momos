const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const path = require("path");
const fs = require("fs");

let messaging = null;

try {
  let serviceAccount = null;

  // 1. Try environment variable (JSON string or Base64 encoded JSON string)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
      if (rawEnv.startsWith("{")) {
        serviceAccount = JSON.parse(rawEnv);
      } else {
        // Assume Base64 encoded
        const decoded = Buffer.from(rawEnv, "base64").toString("utf8");
        serviceAccount = JSON.parse(decoded);
      }
      console.log("[Firebase] Loaded service account from environment variable.");
    } catch (e) {
      console.error("[Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON env var:", e.message);
    }
  }

  // 2. Fall back to local file if env var was not loaded
  if (!serviceAccount) {
    // Check multiple potential file names in the backend root directory
    const potentialFiles = [
      "magic-momos-firebase-adminsdk-fbsvc-cbb4c4c543.json",
      "firebase-service-account.json"
    ];

    for (const fileName of potentialFiles) {
      const filePath = path.join(__dirname, "..", fileName);
      if (fs.existsSync(filePath)) {
        try {
          serviceAccount = require(filePath);
          console.log(`[Firebase] Loaded service account from file: ${fileName}`);
          break;
        } catch (e) {
          console.error(`[Firebase] Failed to read ${fileName}:`, e.message);
        }
      }
    }
  }

  if (serviceAccount) {
    try {
      // In firebase-admin v10+, and specifically v14, top level exports 'cert' directly
      const credential = typeof admin.cert === 'function' 
        ? admin.cert(serviceAccount)
        : (admin.credential && typeof admin.credential.cert === 'function' 
            ? admin.credential.cert(serviceAccount) 
            : null);

      if (credential) {
        const app = admin.initializeApp({
          credential,
        });
        messaging = getMessaging(app);
        console.log("[Firebase] Admin SDK initialized successfully.");
      } else {
        console.error("[Firebase] Neither admin.cert nor admin.credential.cert is available.");
      }
    } catch (e) {
      console.error("[Firebase] Error during initializeApp:", e.message);
    }
  } else {
    console.warn("[Firebase] No service account key found. Push notifications will be disabled.");
  }
} catch (err) {
  console.error("[Firebase] Error during Admin SDK initialization:", err.message);
}

module.exports = messaging;
