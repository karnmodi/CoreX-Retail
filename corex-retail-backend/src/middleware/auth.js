const jwt = require("jsonwebtoken");
const admin = require('firebase-admin');
const db = admin.firestore();
const logger = require("../../functions/logger"); 

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      logger.warn("Unauthorized - Token Missing");
      return res.status(401).json({ message: "Unauthorized - Token Missing" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;

    try {
      const userDoc = await db.collection('employees').doc(req.user.uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        req.user = {
          ...req.user,
          role: userData.role || 'staff',
          storeId: userData.storeId || null,
          departmentType: userData.departmentType || null,
        };

      } else {
        logger.warn(`User ${req.user.uid} not found in Firestore`);
      }
    } catch (firestoreError) {
      logger.error(`❌ Firestore fetch error for user ${req.user.uid}: ${firestoreError.message}`);
    }

    next();
  } catch (error) {
    logger.error(`❌ Authentication Error: ${error.name} - ${error.message}`);

    if (process.env.NODE_ENV === "development") {
      console.error("Detailed Auth Error:", error);
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Authentication Failed - Token Expired" });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Authentication Failed - Invalid Token" });
    }

    return res.status(403).json({ message: "Authentication Failed" });
  }
};

module.exports = verifyToken;
