// controllers/notificationController.js
const admin = require('firebase-admin');
const db = admin.firestore();
const {
  validateNotification,
} = require('../../models/notificationSchema');



/**
 * Get notifications for the current user
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Fetch user document from the correct collection
    const userRef = db.collection('employees').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const userRole = userData.role || 'staff';
    const storeId = userData.storeId || null;

    // We'll need to perform multiple queries and merge results
    const notifications = [];

    // Query 1: Get notifications by role
    let roleQuery = db.collection('notifications')
      .where('targetRole', 'in', [userRole, 'all'])
      .orderBy('createdAt', 'desc')
      .limit(50);

    const roleSnapshot = await roleQuery.get();
    roleSnapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        isRead: doc.data().read && doc.data().read[userId] === true
      });
    });

    // Query 2: Get notifications targeted specifically to this user
    // We need a separate query as Firestore doesn't support OR conditions
    let userQuery = db.collection('notifications')
      .where('targetRole', '==', 'specific')
      .where('targetUsers', 'array-contains', userId)
      .orderBy('createdAt', 'desc')
      .limit(50);

    const userSnapshot = await userQuery.get();
    userSnapshot.forEach(doc => {
      // Check if we already have this notification from the previous query
      const existingIndex = notifications.findIndex(n => n.id === doc.id);
      if (existingIndex === -1) {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          isRead: doc.data().read && doc.data().read[userId] === true
        });
      }
    });

    // Sort combined results by creation date
    notifications.sort((a, b) => {
      // Handle different timestamp formats
      const getTimestamp = (item) => {
        if (item.createdAt && item.createdAt._seconds) {
          return item.createdAt._seconds * 1000;
        } else if (item.createdAt && typeof item.createdAt.toDate === 'function') {
          return item.createdAt.toDate().getTime();
        } else if (item.createdAt) {
          return new Date(item.createdAt).getTime();
        }
        return 0;
      };

      return getTimestamp(b) - getTimestamp(a); // Descending order
    });

    // Limit to most recent 50
    const limitedNotifications = notifications.slice(0, 50);

    return res.status(200).json({ notifications: limitedNotifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({
      error: 'Failed to retrieve notifications',
      details: error.message
    });
  }
};
/**
 * Create a new notification
 */
exports.createNotification = async (req, res) => {
  try {
    // Get user from request
    const userId = req.user.uid;
    const userRef = db.collection('employees').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const userRole = userData.role;
    const userName = userData.firstName + " " + userData.lastName || 'Unknown User';

    // Check permission to create notifications
    if (userRole !== 'admin' && userRole !== 'store manager') {
      return res.status(403).json({ error: 'Only administrators and managers can create notifications' });
    }

    // Prepare notification data
    const notificationData = {
      title: req.body.title,
      message: req.body.message,
      type: userRole === 'admin' ? 'admin' : 'store manager',
      priority: req.body.priority || 'medium',
      targetRole: req.body.targetRole || 'all',
      createdBy: { userId, userName, userRole },
      read: {},
      // Use Firestore server timestamps
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Optional fields
      expiresAt: req.body.expiresAt
        ? admin.firestore.Timestamp.fromDate(new Date(req.body.expiresAt))
        : null
    };

    // Add action if provided
    if (req.body.action) {
      notificationData.action = {
        type: req.body.action.type || 'link',
        destination: req.body.action.destination || '',
        label: req.body.action.label || 'View'
      };
    }

    // Add specific targets if provided
    if (req.body.targetUsers && Array.isArray(req.body.targetUsers)) {
      notificationData.targetUsers = req.body.targetUsers;
    }

    if (req.body.targetStores && Array.isArray(req.body.targetStores)) {
      notificationData.targetStores = req.body.targetStores;
    }

    // Validate notification
    const validation = validateNotification(notificationData);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid notification data',
        details: validation.errors
      });
    }

    // Add to Firestore
    const notificationRef = await db.collection('notifications').add(notificationData);

    // If FCM is set up, send push notifications
    if (req.body.sendPush) {
      await sendPushNotification(notificationData, notificationRef.id);
    }

    return res.status(201).json({
      id: notificationRef.id,
      ...notificationData
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: 'Failed to create notification' });
  }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;
    const notificationId = req.params.id;

    const notificationRef = db.collection('notifications').doc(notificationId);
    const doc = await notificationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Update the read status for this user
    await notificationRef.update({
      [`read.${userId}`]: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
};

/**
 * Get unread notifications for the current user
 */
exports.getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Fetch user document from the correct collection
    const userRef = db.collection('employees').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const userRole = userData.role;
    const storeId = userData.storeId;

    // Build base query for unread notifications
    let baseQuery = db.collection('notifications')
      .where('read.' + userId, '!=', true);

    // Filter by user role and target
    if (userRole === 'admin') {
      baseQuery = baseQuery.where('targetRole', 'in', ['admin', 'all']);
    } else {
      baseQuery = baseQuery.where('targetRole', 'in', [userRole, 'all', 'specific']);
    }

    if (userRole !== 'admin') {
      baseQuery = baseQuery.where('targetUsers', 'array-contains', userId);
    }

    baseQuery = baseQuery.orderBy('createdAt', 'desc').limit(50);

    // Execute query
    const snapshot = await baseQuery.get();

    // Process notifications
    const unreadNotifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({
      unreadCount: unreadNotifications.length,
      unreadNotifications
    });
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return res.status(500).json({
      error: 'Failed to retrieve unread notifications',
      details: error.message
    });
  }
};

/**
 * Get new notifications for the user
 */
exports.getNewNotifications = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Fetch user document from the correct collection
    const userRef = db.collection('employees').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const userRole = userData.role || 'staff';

    // Determine last checked timestamp
    const lastCheckedTimestamp = userData.lastNotificationCheck
      ? userData.lastNotificationCheck
      : admin.firestore.Timestamp.fromDate(new Date(0)); // Default to epoch if no previous check

    // Build base query for new notifications
    let baseQuery = db.collection('notifications')
      .where('createdAt', '>', lastCheckedTimestamp);

    // Role-based filtering
    if (userRole === 'admin') {
      baseQuery = baseQuery.where('targetRole', 'in', ['admin', 'all']);
    } else {
      baseQuery = baseQuery
        .where('targetRole', 'in', [userRole, 'all', 'specific'])
        .where('targetUsers', 'array-contains', userId);
    }

    // Order and limit results
    baseQuery = baseQuery.orderBy('createdAt', 'desc').limit(50);

    // Execute query
    const snapshot = await baseQuery.get();

    // Process notifications
    const newNotifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString()
    }));

    // Update last notification check timestamp
    await userRef.update({
      lastNotificationCheck: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({
      newCount: newNotifications.length,
      newNotifications,
      lastCheckedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting new notifications:', error);
    return res.status(500).json({
      error: 'Failed to retrieve new notifications',
      details: error.message
    });
  }
};

/**
 * Get notification summary (unread and new)
 */
exports.getNotificationSummary = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Fetch user document from the correct collection
    const userRef = db.collection('employees').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const userRole = userData.role || 'staff';

    // Determine last checked timestamp (using only server-side timestamp)
    const lastChecked = userData.lastNotificationCheck
      ? userData.lastNotificationCheck
      : admin.firestore.Timestamp.fromDate(new Date(0));

    // Base queries
    let unreadQuery = db.collection('notifications')
      .where('read.' + userId, '!=', true);

    let newQuery = db.collection('notifications')
      .where('createdAt', '>', lastChecked);

    // Role-based filtering for unread notifications
    if (userRole === 'admin') {
      unreadQuery = unreadQuery.where('targetRole', 'in', ['admin', 'all']);
    } else {
      unreadQuery = unreadQuery
        .where('targetRole', 'in', [userRole, 'all', 'specific'])
        .where('targetUsers', 'array-contains', userId);
    }

    // Role-based filtering for new notifications
    if (userRole === 'admin') {
      newQuery = newQuery.where('targetRole', 'in', ['admin', 'all']);
    } else {
      newQuery = newQuery
        .where('targetRole', 'in', [userRole, 'all', 'specific'])
        .where('targetUsers', 'array-contains', userId);
    }

    // Execute queries
    const [unreadSnapshot, newSnapshot] = await Promise.all([
      unreadQuery.orderBy('createdAt', 'desc').limit(50).get(),
      newQuery.orderBy('createdAt', 'desc').limit(50).get()
    ]);

    // Process notifications with additional details
    const processNotifications = (snapshot) =>
      snapshot.docs.map(doc => {
        const notifData = doc.data();
        return {
          id: doc.id,
          ...notifData,
          createdAt: notifData.createdAt.toDate().toISOString(),
          isRead: notifData.read && notifData.read[userId] === true
        };
      });

    const unreadNotifications = processNotifications(unreadSnapshot);
    const newNotifications = processNotifications(newSnapshot);

    // Update last notification check timestamp
    await userRef.update({
      lastNotificationCheck: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({
      unreadCount: unreadNotifications.length,
      unreadNotifications,
      newCount: newNotifications.length,
      newNotifications,
      lastCheckedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting notification summary:', error);
    return res.status(500).json({
      error: 'Failed to retrieve notification summary',
      details: error.message
    });
  }
};

/**
 * Mark all notifications as read for a user
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRef = db.collection('employees').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const userRole = userData.role;
    const storeId = userData.storeId || null;


    // 1. Get notifications for the user's role
    const roleQuery = await db.collection('notifications')
      .where('targetRole', 'in', [userRole, 'all'])
      .get();

    // 2. Get notifications specifically for this user
    const userQuery = await db.collection('notifications')
      .where('targetUsers', 'array-contains', userId)
      .get();

    // 3. Get notifications for the user's store if applicable
    let storeQuery = { docs: [] };
    if (storeId) {
      storeQuery = await db.collection('notifications')
        .where('targetStores', 'array-contains', storeId)
        .get();
    }

    // Combine all notifications and filter to unread
    const allDocs = [...roleQuery.docs, ...userQuery.docs, ...storeQuery.docs];
    const uniqueNotifIds = new Set();
    const batch = db.batch();

    allDocs.forEach(doc => {
      const notifId = doc.id;
      const notifData = doc.data();

      // Check if we've already processed this notification
      if (uniqueNotifIds.has(notifId)) {
        return;
      }

      uniqueNotifIds.add(notifId);

      // Check if already read
      if (!notifData.read || !notifData.read[userId]) {
        const notifRef = db.collection('notifications').doc(notifId);
        batch.update(notifRef, {
          [`read.${userId}`]: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });

    // Commit the batch update
    await batch.commit();

    return res.status(200).json({ success: true, count: uniqueNotifIds.size });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Failed to update notifications' });
  }
};

/**
 * Delete a notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.uid;
    const notificationId = req.params.id;

    const userRef = db.collection('employees').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const userRole = userData.role;

    const notificationRef = db.collection('notifications').doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notificationData = notificationDoc.data();

    // Check if user has permission to delete
    if (userRole !== 'admin' && notificationData.createdBy !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this notification' });
    }

    // Delete the notification
    await notificationRef.delete();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
};

/**
 * Send push notification using Firebase Cloud Messaging
 */
// async function sendPushNotification(notification, notificationId) {
//   try {
//     let targetUserIds = [];

//     if (notification.targetUsers && notification.targetUsers.length > 0) {
//       targetUserIds = notification.targetUsers;
//     } else if (notification.targetStores && notification.targetStores.length > 0) {
//       const usersQuery = await db.collection('employees')
//         .where('storeId', 'in', notification.targetStores)
//         .get();

//       usersQuery.forEach(doc => {
//         targetUserIds.push(doc.id);
//       });
//     } else if (notification.targetRole !== 'all') {
//       const usersQuery = await db.collection('employees')
//         .where('role', '==', notification.targetRole)
//         .get();

//       usersQuery.forEach(doc => {
//         targetUserIds.push(doc.id);
//       });
//     } else {
//       // If all users are targeted
//       const usersQuery = await db.collection('employees').get();
//       usersQuery.forEach(doc => {
//         targetUserIds.push(doc.id);
//       });
//     }

//     // Get FCM tokens for all target users
//     const fcmTokens = [];

//     for (const userId of targetUserIds) {
//       const userDoc = await db.collection('employees').doc(userId).get();

//       if (userDoc.exists) {
//         const userData = userDoc.data();

//         if (userData.fcmTokens && Array.isArray(userData.fcmTokens) && userData.fcmTokens.length > 0) {
//           fcmTokens.push(...userData.fcmTokens);
//         }
//       }
//     }

//     // Remove duplicate tokens
//     const uniqueTokens = [...new Set(fcmTokens)];

//     if (uniqueTokens.length === 0) {
//       console.log('No FCM tokens found for target users');
//       return;
//     }

//     // Send notifications in batches (FCM has a limit of 500 tokens per request)
//     const batchSize = 500;

//     for (let i = 0; i < uniqueTokens.length; i += batchSize) {
//       const tokenBatch = uniqueTokens.slice(i, i + batchSize);

//       const message = {
//         notification: {
//           title: notification.title,
//           body: notification.message
//         },
//         data: {
//           notificationId: notificationId,
//           type: notification.type,
//           priority: notification.priority,
//           createdAt: notification.createdAt.toDate().toISOString()
//         },
//         tokens: tokenBatch
//       };

//       // Send the notification
//       const response = await admin.messaging().sendMulticast(message);
//       console.log(`${response.successCount} messages were sent successfully`);
//     }
//   } catch (error) {
//     console.error('Error sending push notification:', error);
//   }
// }

exports.createTestNotification = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection('employees').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const userRole = userData.role || 'staff';

    // Create a test notification
    const testNotification = {
      title: 'Test Notification',
      message: 'This is a test notification to verify the system',
      type: 'system',
      priority: 'medium',
      targetRole: userRole, // Target the user's specific role
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system',
      read: {},
      action: {
        type: 'link',
        destination: '/test',
        label: 'View Test'
      }
    };

    // Add to Firestore
    const notifRef = await db.collection('notifications').add(testNotification);

    return res.status(201).json({
      message: 'Test notification created',
      notificationId: notifRef.id
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    return res.status(500).json({
      error: 'Failed to create test notification',
      details: error.message
    });
  }
};


exports.manualInventoryCheck = async (req, res) => {
  try {
    if (global.manualJobs?.inventoryCheck) {
      const result = await global.manualJobs.inventoryCheck();
      res.status(result.success ? 200 : 500).json(result);
    } else {
      res.status(500).json({ error: 'Manual check function not available' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to perform manual check',
      details: error.message
    });
  }
};


exports.manualRosterCheck = async (req, res) => {
  try {
    if (global.manualJobs?.rosterCheck) {
      const result = await global.manualJobs.rosterCheck();
      res.status(result.success ? 200 : 500).json(result);
    } else {
      res.status(500).json({ error: 'Manual check function not available' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to perform manual check',
      details: error.message
    });
  }
};

module.exports.exports;