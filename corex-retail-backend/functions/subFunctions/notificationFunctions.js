// notificationFunctions.js
const admin = require('firebase-admin');
const { db } = require("../../src/config/firebase");

/**
 * Create a low stock notification for admins
 */
async function createLowStockNotification(lowStockItems) {
  try {
    const notification = {
      title: 'Low Stock Alert',
      message: `${lowStockItems.length} inventory items are below the reorder point and need immediate attention.`,
      type: 'system',
      priority: 'high',
      targetRole: 'admin',
      read: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      action: {
        type: 'link',
        destination: '../../inventory/stockUpdates',
        label: 'View Low Stock Items'
      },
      details: lowStockItems.map(item => ({
        productName: item.name,
        currentStock: item.currentStock,
        reorderPoint: item.reorderPoint
      }))
    };

    await db.collection('notifications').add(notification);
    return true;
  } catch (error) {
    console.error('Error creating low stock notification for admin:', error);
    return false;
  }
}

/**
 * Create a low stock notification for store managers
 */
async function createLowStockNotificationForManager(lowStockItems) {
  try {
    const notification = {
      title: 'Low Stock Alert',
      message: `${lowStockItems.length} inventory items are below the reorder point and need immediate restocking.`,
      type: 'system',
      priority: 'high',
      targetRole: 'manager',
      read: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      action: {
        type: 'link',
        destination: '../../inventory/stockUpdates',
        label: 'View Low Stock Items'
      },
      details: lowStockItems.map(item => ({
        productName: item.name,
        currentStock: item.currentStock,
        reorderPoint: item.reorderPoint
      }))
    };

    await db.collection('notifications').add(notification);
    return true;
  } catch (error) {
    console.error('Error creating low stock notification for manager:', error);
    return false;
  }
}

/**
 * Create a missing roster notification for admin
 */
async function createMissingRosterNotificationForAdmin() {
  try {
    const notification = {
      title: 'Missing Shifts Alert',
      message: 'No shifts have been scheduled. Please create shifts immediately.',
      type: 'system',
      priority: 'high',
      targetRole: 'admin',
      read: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      action: {
        type: 'link',
        destination: '../../rosters/manageRosters',
        label: 'Create Shifts'
      }
    };

    await db.collection('notifications').add(notification);
    return true;
  } catch (error) {
    console.error('Error creating missing roster notification for admin:', error);
    return false;
  }
}

/**
 * Create a missing roster notification for managers
 */
async function createMissingRosterNotificationForManager() {
  try {
    const notification = {
      title: 'Missing Shifts Alert',
      message: 'No shifts have been scheduled for tomorrow. Create shifts immediately.',
      type: 'system',
      priority: 'high',
      targetRole: 'manager',
      read: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      action: {
        type: 'link',
        destination: '../../rosters/manageRosters',
        label: 'Create Shifts'
      }
    };

    await db.collection('notifications').add(notification);
    return true;
  } catch (error) {
    console.error('Error creating missing roster notification for manager:', error);
    return false;
  }
}

/**
 * Create a daily target notification for staff
 */
// async function createDailyTargetNotification(staffId, targetId, description, currentValue, targetValue) {
//   try {
//     const notification = {
//       title: 'Daily Target Reminder',
//       message: `Reminder: Your target for today is ${description}. Current progress: ${currentValue || 0} / ${targetValue}.`,
//       type: 'system',
//       priority: 'medium',
//       targetRole: 'specific',
//       targetUsers: [staffId],
//       read: {},
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       createdBy: 'system',
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//       action: {
//         type: 'link',
//         destination: `../../targets/view/${targetId}`,
//         label: 'View Target'
//       }
//     };

//     await db.collection('notifications').add(notification);
//     return true;
//   } catch (error) {
//     console.error('Error creating daily target notification:', error);
//     return false;
//   }
// }

module.exports = {
  createLowStockNotification,
  createLowStockNotificationForManager,
  createMissingRosterNotificationForAdmin,
  createMissingRosterNotificationForManager,
  // createDailyTargetNotification
};