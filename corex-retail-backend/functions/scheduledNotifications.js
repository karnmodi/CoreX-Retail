// src/functions/scheduledJobs.js
const cron = require('node-cron');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

// Import required function modules
const inventoryFunctions = require('./subFunctions/inventoryFunctions');
const rosterFunctions = require('./subFunctions/rosterFunctions');

/**
 * Log execution details to a file
 * @param {string} jobName - Name of the scheduled job
 * @param {string} message - Detailed message to log
 */
function logJobExecution(jobName, message) {
  const logDir = path.join(__dirname, '..', 'logs');

  // Ensure logs directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logFile = path.join(logDir, 'scheduled-jobs.log');
  const timestamp = moment().tz(process.env.SCHEDULED_TIMEZONE).format('YYYY-MM-DD HH:mm:ss z');

  const logMessage = `[${timestamp}] ${jobName}: ${message}\n`;

  // Append to log file
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

}

/**
 * Initialize and schedule all automated functions
 */
function initializeScheduledFunctions() {
  // Get timezone from environment or default to London
  const timezone = process.env.SCHEDULED_TIMEZONE;

  // Log initialization
  logJobExecution('SYSTEM', 'Scheduled functions initialization started');

  // Inventory Check Job
  if (process.env.ENABLE_INVENTORY_CHECK === 'true') {
    const inventoryCheckSchedule = process.env.INVENTORY_CHECK_SCHEDULE || '10 14 * * *';

    cron.schedule(inventoryCheckSchedule, async () => {
      try {
        logJobExecution('INVENTORY_CHECK', 'Started low inventory check');

        await inventoryFunctions.checkLowInventory();

        logJobExecution('INVENTORY_CHECK', 'Low inventory check completed successfully');
      } catch (error) {
        logJobExecution('INVENTORY_CHECK', `Failed: ${error.message}`);
        console.error('Scheduled inventory check failed:', error);
      }
    }, {
      scheduled: true,
      timezone: timezone
    });

    logJobExecution('SYSTEM', `Inventory Check Job Scheduled: ${inventoryCheckSchedule}`);
  }

  // Roster Check Job
  if (process.env.ENABLE_ROSTER_CHECK === 'true') {
    const rosterCheckSchedule = process.env.ROSTER_CHECK_SCHEDULE;

    cron.schedule(rosterCheckSchedule, async () => {
      try {
        logJobExecution('ROSTER_CHECK', 'Started missing rosters check');

        await rosterFunctions.checkMissingRosters();

        logJobExecution('ROSTER_CHECK', 'Missing rosters check completed successfully');
      } catch (error) {
        logJobExecution('ROSTER_CHECK', `Failed: ${error.message}`);
        console.error('Scheduled roster check failed:', error);
      }
    }, {
      scheduled: true,
      timezone: timezone
    });

    logJobExecution('SYSTEM', `Roster Check Job Scheduled: ${rosterCheckSchedule}`);
  }

  // Daily Targets Notification Job
  // if (process.env.ENABLE_DAILY_TARGETS === 'true') {
  //   const dailyTargetsSchedule = process.env.DAILY_TARGETS_SCHEDULE;

  //   cron.schedule(dailyTargetsSchedule, async () => {
  //     try {
  //       logJobExecution('DAILY_TARGETS', 'Started daily target notifications');

  //       await rosterFunctions.notifyDailyTargets();

  //       logJobExecution('DAILY_TARGETS', 'Daily target notifications completed successfully');
  //     } catch (error) {
  //       logJobExecution('DAILY_TARGETS', `Failed: ${error.message}`);
  //       console.error('Daily target notifications failed:', error);
  //     }
  //   }, {
  //     scheduled: true,
  //     timezone: timezone
  //   });

  //   logJobExecution('SYSTEM', `Daily Targets Job Scheduled: ${dailyTargetsSchedule}`);
  // }

  // // Notification Cleanup Job
  // if (process.env.ENABLE_NOTIFICATION_CLEANUP === 'true') {
  //   const notificationCleanupSchedule = process.env.NOTIFICATION_CLEANUP_SCHEDULE;

  //   cron.schedule(notificationCleanupSchedule, async () => {
  //     try {
  //       logJobExecution('NOTIFICATION_CLEANUP', 'Started expired notifications cleanup');

  //       await inventoryFunctions.cleanupExpiredNotifications();

  //       logJobExecution('NOTIFICATION_CLEANUP', 'Expired notifications cleanup completed successfully');
  //     } catch (error) {
  //       logJobExecution('NOTIFICATION_CLEANUP', `Failed: ${error.message}`);
  //       console.error('Notification cleanup failed:', error);
  //     }
  //   }, {
  //     scheduled: true,
  //     timezone: timezone
  //   });

  //   logJobExecution('SYSTEM', `Notification Cleanup Job Scheduled: ${notificationCleanupSchedule}`);
  // }

  // Manual trigger functions for each job
  global.manualJobs = {
    inventoryCheck: async () => {
      try {
        logJobExecution('MANUAL_INVENTORY_CHECK', 'Manual trigger started');

        await inventoryFunctions.checkLowInventory();

        logJobExecution('MANUAL_INVENTORY_CHECK', 'Manual check completed successfully');
        return { success: true, message: 'Manual inventory check completed' };
      } catch (error) {
        logJobExecution('MANUAL_INVENTORY_CHECK', `Failed: ${error.message}`);
        console.error('Manual inventory check failed:', error);
        return { success: false, error: error.message };
      }
    },
    rosterCheck: async () => {
      try {
        logJobExecution('MANUAL_ROSTER_CHECK', 'Manual trigger started');

        await rosterFunctions.checkMissingRosters();

        logJobExecution('MANUAL_ROSTER_CHECK', 'Manual check completed successfully');
        return { success: true, message: 'Manual roster check completed' };
      } catch (error) {
        logJobExecution('MANUAL_ROSTER_CHECK', `Failed: ${error.message}`);
        console.error('Manual roster check failed:', error);
        return { success: false, error: error.message };
      }
    },
    // dailyTargets: async () => {
    //   try {
    //     logJobExecution('MANUAL_DAILY_TARGETS', 'Manual trigger started');

    //     await rosterFunctions.notifyDailyTargets();

    //     logJobExecution('MANUAL_DAILY_TARGETS', 'Manual check completed successfully');
    //     return { success: true, message: 'Manual daily targets completed' };
    //   } catch (error) {
    //     logJobExecution('MANUAL_DAILY_TARGETS', `Failed: ${error.message}`);
    //     console.error('Manual daily targets failed:', error);
    //     return { success: false, error: error.message };
    //   }
    // },

  };

  // Log initialization completion
  logJobExecution('SYSTEM', 'Scheduled functions initialized successfully');
}

module.exports = {
  initializeScheduledFunctions
};