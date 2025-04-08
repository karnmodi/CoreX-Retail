// controllers/authController.js (Backend)
const { auth } = require("../config/firebase");
const jwt = require("jsonwebtoken");
const { recordLoginActivity } = require('../controllers/profile/ActivityController');

const loginUser_BE = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    // Verify Firebase ID Token (short-lived token from frontend)
    const decodedFirebaseToken = await auth.verifyIdToken(firebaseToken);
    const userId = decodedFirebaseToken.uid;
    const userEmail = decodedFirebaseToken.email;
    const userRole = decodedFirebaseToken.userRole;

    const token = jwt.sign(
      { uid: userId, email: userEmail },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      userRole,
      userId
    });

    await recordLoginActivity(userId, {
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

  } catch (error) {
    console.error("Login error (Backend):", error.message);
    res.status(400).json({ error: "Invalid Firebase token" });
  }
};

module.exports = { loginUser_BE };
