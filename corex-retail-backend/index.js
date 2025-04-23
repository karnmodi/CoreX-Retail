const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const admin = require("firebase-admin");

// Import Firebase configuration
const { db, auth, storage } = require("./src/config/firebase");

// Import routes and functions
const routes = require("./src/routes/mainRoute");
const {
  createFirestoreIndexes,
  cleanupSampleNotification
} = require("./src/models/notificationSchema");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to attach Firebase services to request
app.use((req, res, next) => {
  req.db = db;
  req.auth = auth;
  req.storage = storage;
  next();
});

// Mount API routes
app.use("/api", routes);

// Simple error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Main application initialization function
async function initializeApp() {
  try {
    // Create Firestore indexes
    // const indexesCreated = await createFirestoreIndexes();

    // Initialize scheduled functions if enabled
    if (process.env.ENABLE_AUTOMATED_NOTIFICATIONS === 'true') {
      const { initializeScheduledFunctions } = require("./functions/scheduledNotifications");
      initializeScheduledFunctions();
      console.log("✅ Automated notifications initialized");
    }

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
      console.log("✅ Firebase services are connected");

    });


  } catch (error) {
    console.error('Application initialization failed:', error);
    console.error('Detailed error:', error);

    // Log index creation instructions
    console.warn('Index Creation Instructions:');

    process.exit(1);
  }
}

// Handle any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Initialize the application
initializeApp();