const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

const LOG_DIR = path.join(__dirname, '../logs');
const BACKEND_LOG_FILE = path.join(LOG_DIR, 'backend.log');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

// Main log writing function
function writeLog(filePath, level, message) {
  const timestamp = moment()
    .tz(process.env.LOG_TIMEZONE || 'UTC')
    .format('YYYY-MM-DD HH:mm:ss z');

  const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

  fs.appendFile(filePath, logLine, (err) => {
    if (err) {
      console.error('❌ Error writing log:', err);
    }
  });
}

// Logger object with level-specific functions
const logger = {
  info: (message) => writeLog(BACKEND_LOG_FILE, 'info', message),
  warn: (message) => writeLog(BACKEND_LOG_FILE, 'warn', message),
  error: (message) => writeLog(BACKEND_LOG_FILE, 'error', message),
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      writeLog(BACKEND_LOG_FILE, 'debug', message);
    }
  },

  // Reusable for scheduled jobs or other modules
  logToFile: (fileName, jobName, message) => {
    const logFile = path.join(LOG_DIR, fileName);
    const timestamp = moment()
      .tz(process.env.LOG_TIMEZONE || 'UTC')
      .format('YYYY-MM-DD HH:mm:ss z');

    const logMessage = `[${timestamp}] ${jobName}: ${message}\n`;
    fs.appendFile(logFile, logMessage, (err) => {
      if (err) {
        console.error(`❌ Failed to write to ${fileName}:`, err);
      }
    });
  }
};

module.exports = logger;
