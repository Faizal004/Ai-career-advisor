const admin = require("firebase-admin");

let app;

try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("🔥 Firebase Admin Initialized");
  } else {
    app = admin.app();
  }
} catch (error) {
  console.error("❌ Firebase Admin Init Error:", error);
}

module.exports = admin;