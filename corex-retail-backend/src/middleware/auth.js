// middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const admin = require('firebase-admin');
const db = admin.firestore();


const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
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
          role: userData.role || 'staff', // Default to staff if role is missing
          storeId: userData.storeId || null,
          departmentType: userData.departmentType || null,
        };
      } else {
        console.warn(`User ${req.user.uid} not found in Firestore`);
      }
    } catch (firestoreError) {
      console.error('Error fetching user data from Firestore:', firestoreError);
    }
    
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Authentication Failed - Token Expired" });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Authentication Failed - Invalid Token" });
    }
    
    res.status(403).json({ message: "Authentication Failed" });
  }
};

module.exports = verifyToken;