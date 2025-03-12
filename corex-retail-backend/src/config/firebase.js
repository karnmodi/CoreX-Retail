const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const serviceAccount = require(path.resolve(__dirname, process.env.FIREBASE_KEY_PATH));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); 
const auth = admin.auth(); 

module.exports = { db, auth };
