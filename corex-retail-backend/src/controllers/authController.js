// controllers/authController.js (Backend)
const { auth } = require("../config/firebase");
const jwt = require("jsonwebtoken");
const { recordLoginActivity } = require('../controllers/profile/ActivityController');
const admin = require("firebase-admin");

const loginUser_BE = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    // Verify the Firebase token
    const decodedFirebaseToken = await auth.verifyIdToken(firebaseToken);
    const userId = decodedFirebaseToken.uid;
    const userEmail = decodedFirebaseToken.email;

    const userDoc = await admin.firestore().collection('employees').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const userData = userDoc.data();
    const userRole = userData.role || "staff"; 
    const userDetails = {
      uid: userId,
      email: userEmail,
      role: userRole,
      name: userData.name || "",
      profileImage: userData.profileImage || "",
      department: userData.department || "",
      position: userData.position || "",
      hireDate: userData.hireDate || "",
      lastLogin: userData.lastLogin || null,
    };

    const token = jwt.sign(
      { uid: userId, email: userEmail, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    await admin.firestore()
      .collection('employees')
      .doc(userId)
      .update({
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      });

    await recordLoginActivity(userId, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      ...userDetails
    });

  } catch (error) {
    console.error("Login error (Backend):", error.message);
    res.status(400).json({ error: error.message || "Invalid Firebase token" });
  }
};

module.exports = { loginUser_BE };