const admin = require("firebase-admin");

/**
 * Verify Firebase ID token from request
 * @param {Object} req - Express request object
 * @return {Promise<Object>} Decoded token
 */
async function verifyAuth(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: No token provided");
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error("Unauthorized: Invalid token");
  }
}

module.exports = {verifyAuth};