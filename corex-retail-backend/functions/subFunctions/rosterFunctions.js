// src/functions/rosterFunctions.js
const admin = require('firebase-admin');
const notificationFunctions = require('./notificationFunctions');
const { db, storage } = require("../../src/config/firebase");

// rosterFunctions.js
async function checkMissingRosters() {
  try {
    console.log('Checking for missing shifts tomorrow...');

    const today = new Date();
    today.setDate(today.getDate() + 1);
    const tomorrowFormatted = today.toISOString().split('T')[0];

    // Query for shifts with tomorrow's date
    const shiftsQuery = await db.collection('shifts')
      .where('date', '==', tomorrowFormatted)
      .get();

    if (shiftsQuery.empty) {
      // No shifts found for tomorrow — send notifications
      await notificationFunctions.createMissingRosterNotificationForAdmin();
      await notificationFunctions.createMissingRosterNotificationForManager();

      console.log('No shifts found — created missing roster notifications');
      return {
        success: true,
        message: 'Missing shift notifications created for tomorrow'
      };
    }

    console.log('Shifts exist for tomorrow');
    return {
      success: true,
      message: 'Shifts exist for tomorrow'
    };
  } catch (error) {
    console.error('Error checking tomorrow\'s shifts:', error);
    return { success: false, error: 'Failed to check shifts' };
  }
}

module.exports = {
  checkMissingRosters,
};
