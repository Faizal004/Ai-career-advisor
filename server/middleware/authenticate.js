const admin = require("../firebaseAdmin");

module.exports = async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer (.*)$/);

  if (!match) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.uid = decoded.uid;
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};