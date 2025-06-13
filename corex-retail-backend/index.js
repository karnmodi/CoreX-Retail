const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const admin = require("firebase-admin");
const { db, auth, storage } = require("./src/config/firebase");
const routes = require("./src/routes/mainRoute");
const {
  createFirestoreIndexes,
  cleanupSampleNotification
} = require("./src/models/notificationSchema");

const logger = require("./functions/logger"); 

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// Middleware to inject Firebase services
app.use((req, res, next) => {
  req.db = db;
  req.auth = auth;
  req.storage = storage;
  next();
});

// Main API routes
app.use("/api", routes);

// Central error handler
app.use((err, req, res, next) => {
  logger.error(`Server Error: ${err.stack}`);
  res.status(500).json({
    status: "error",
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

async function initializeApp() {
  try {
    // Optional: initialize automated functions
    if (process.env.ENABLE_AUTOMATED_NOTIFICATIONS === 'true') {
      const { initializeScheduledFunctions } = require("./functions/scheduledNotifications");
      initializeScheduledFunctions();
      logger.info("✅ Automated notifications initialized");
    }

    // Start the server
    app.listen(PORT, () => {
      logger.info(`✅ Server is running on http://localhost:${PORT}`);
      logger.info("✅ Firebase services are connected");
    });

  } catch (error) {
    logger.error("❌ Application initialization failed");
    logger.error(`Detailed error: ${error.stack}`);
    process.exit(1);
  }
}

// Global error listeners
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.stack}`);
  process.exit(1);
});

initializeApp();
