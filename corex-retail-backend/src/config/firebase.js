const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const serviceAccount = require(path.resolve(__dirname, process.env.FIREBASE_KEY_PATH));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  
  
});

const db = admin.firestore(); 
const auth = admin.auth(); 
const storage = admin.storage().bucket();

console.log("✅ Firebase initialized with bucket:", process.env.FIREBASE_STORAGE_BUCKET);

module.exports = { db, auth, storage };



