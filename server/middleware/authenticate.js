const admin = require("../firebaseAdmin");

module.exports = async function authenticate(req, res, next) {
  try {
    // 🔐 Get token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];

    // 🔥 Verify token
    const decoded = await admin.auth().verifyIdToken(token);

    // ✅ Attach user info
    req.uid = decoded.uid;
    req.firebaseUser = decoded;

    next();

  } catch (err) {
    console.error("🔥 Token verification failed:", err.message);

    return res.status(401).json({ error: "Invalid or expired token" });
  }
};