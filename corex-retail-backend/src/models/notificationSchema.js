// models/notificationSchema.js
const firebase = require('firebase-admin');


async function createFirestoreIndexes() {
  try {
    const db = firebase.firestore();

    // Create a sample notification to ensure indexes are created
    await db.collection("notifications").add({
      targetRole: 'admin',
      targetUsers: ['placeholder_user'],
      targetStores: ['placeholder_store'],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      title: 'Index Creation Sample',
      message: 'This is a temporary document for index creation',
      read: {},
      type: 'system',
      priority: 'medium'
    });

    console.log('Sample notification added to trigger index creation');
    return true;
  } catch (error) {
    console.error('Error creating Firestore indexes:', error);
    return false;
  }
}


// Optional: Clean up the sample document after a short time
async function cleanupSampleNotification() {
  try {
    const db = firebase.firestore();

    // Find and delete the sample notification
    const querySnapshot = await db.collection("notifications")
      .where('title', '==', 'Index Creation Sample')
      .get();

    querySnapshot.forEach(async (doc) => {
      await doc.ref.delete();
    });

    console.log('Sample notification cleaned up');
  } catch (error) {
    console.warn('Error cleaning up sample notification:', error);
  }
}


const notificationSchema = {
  // Basic Information
  title: {
    type: 'string',
    required: true,
    default: ''
  },
  message: {
    type: 'string',
    required: true,
    default: ''
  },

  // Notification Type & Priority
  type: {
    type: 'string',
    required: true,
    enum: ['system', 'admin', 'store manager'],
    default: 'system'
  },
  priority: {
    type: 'string',
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // Target Information
  targetRole: {
    type: 'string',
    required: true,
    enum: ['admin', 'store manager', 'staff', 'all', 'specific'],
    default: 'all'
  },
  targetUsers: {
    type: 'array',
    required: false,
    default: []
  },
  targetStores: {
    type: 'array',
    required: false,
    default: []
  },

  // Read Status (Map of user IDs to boolean read status)
  read: {
    type: 'object',
    required: true,
    default: {}
  },

  // Action Information 
  action: {
    type: 'object',
    required: false,
    default: null,
    schema: {
      type: {
        type: 'string',
        required: true,
        enum: ['link', 'button', 'form'],
        default: 'link'
      },
      destination: {
        type: 'string',
        required: false,
        default: ''
      },
      label: {
        type: 'string',
        required: false,
        default: 'View'
      },
      params: {
        type: 'object',
        required: false,
        default: {}
      }
    }
  },

  // Reference Information
  createdBy: {
    type: 'object',
    required: true,
    default: 'system'
  },

  // Expiration
  expiresAt: {
    type: 'timestamp',
    required: false,
    default: null
  },

  // Timestamps
  createdAt: {
    type: 'timestamp',
    required: true,
    default: () => firebase.firestore.FieldValue.serverTimestamp()
  },
  updatedAt: {
    type: 'timestamp',
    required: true,
    default: () => firebase.firestore.FieldValue.serverTimestamp()
  }
};

function createDefaultNotification() {
  const defaultNotification = {};

  for (const [field, config] of Object.entries(notificationSchema)) {
    if (typeof config.default === 'function') {
      defaultNotification[field] = config.default();
    } else {
      defaultNotification[field] = config.default;
    }
  }

  return defaultNotification;
}

function validateNotification(notification) {
  const errors = [];

  for (const [field, config] of Object.entries(notificationSchema)) {
    if (field === 'id') continue;

    if (config.required && (notification[field] === undefined || notification[field] === null)) {
      errors.push(`${field} is required`);
      continue;
    }

    if (notification[field] === undefined || notification[field] === null) continue;

    if (config.type === 'string' && typeof notification[field] !== 'string') {
      errors.push(`${field} must be a string`);
    }

    if (config.type === 'number' && typeof notification[field] !== 'number') {
      errors.push(`${field} must be a number`);
    }

    if (config.type === 'array' && !Array.isArray(notification[field])) {
      errors.push(`${field} must be an array`);
    }

    if (config.type === 'object' && typeof notification[field] !== 'object') {
      errors.push(`${field} must be an object`);
    }

    if (config.enum && !config.enum.includes(notification[field])) {
      errors.push(`${field} must be one of: ${config.enum.join(', ')}`);
    }

    if (notification.createdAt === undefined || notification.createdAt === null) {
      if (notification.createdAt !== admin.firestore.FieldValue.serverTimestamp()) {
        errors.push('createdAt is required');
      }
    }

    if (notification.updatedAt === undefined || notification.updatedAt === null) {
      if (notification.updatedAt !== admin.firestore.FieldValue.serverTimestamp()) {
        errors.push('updatedAt is required');
      }
    }

    // Validate nested schema if it exists
    if (config.schema && notification[field]) {
      for (const [nestedField, nestedConfig] of Object.entries(config.schema)) {
        if (nestedConfig.required && (notification[field][nestedField] === undefined || notification[field][nestedField] === null)) {
          errors.push(`${field}.${nestedField} is required`);
        }

        if (notification[field][nestedField] === undefined || notification[field][nestedField] === null) continue;

        if (nestedConfig.type === 'string' && typeof notification[field][nestedField] !== 'string') {
          errors.push(`${field}.${nestedField} must be a string`);
        }

        if (nestedConfig.enum && !nestedConfig.enum.includes(notification[field][nestedField])) {
          errors.push(`${field}.${nestedField} must be one of: ${nestedConfig.enum.join(', ')}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function prepareNotification(notificationData) {
  const notification = createDefaultNotification();

  for (const [key, value] of Object.entries(notificationData)) {
    if (value !== undefined && value !== null) {
      notification[key] = value;
    }
  }

  // Ensure timestamps
  notification.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  if (!notificationData.createdAt) {
    notification.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  }

  return notification;
}

// Function to create automated inventory low stock notification
function createLowStockNotification(storeId, storeName, lowStockItems) {
  const notification = createDefaultNotification();

  notification.title = `Low Stock Alert - ${storeName}`;
  notification.message = `${lowStockItems.length} items are below the reorder point at ${storeName}.`;
  notification.type = 'system';
  notification.priority = 'high';
  notification.targetRole = 'admin';
  notification.targetStores = [storeId];
  notification.action = {
    type: 'link',
    destination: `/inventory/low-stock?storeId=${storeId}`,
    label: 'View Low Stock Items'
  };

  return notification;
}

// Function to create missing roster notification
function createMissingRosterNotification(storeId, storeName, isForAdmin = true) {
  const notification = createDefaultNotification();

  if (isForAdmin) {
    notification.title = `Missing Rosters - ${storeName}`;
    notification.message = `No rosters have been created for ${storeName} for the upcoming week. Please create rosters as soon as possible.`;
    notification.targetRole = 'admin';
  } else {
    notification.title = 'Missing Rosters Alert';
    notification.message = 'No rosters have been created for your store for the upcoming week. Please create rosters as soon as possible.';
    notification.targetRole = 'manager';
  }

  notification.type = 'system';
  notification.priority = isForAdmin ? 'medium' : 'high';
  notification.targetStores = [storeId];
  notification.action = {
    type: 'link',
    destination: `/scheduling/create${isForAdmin ? `?storeId=${storeId}` : ''}`,
    label: 'Create Rosters'
  };

  return notification;
}

// Function to create daily target notification for staff
// function createDailyTargetNotification(staffId, targetDescription, currentValue, targetValue) {
//   const notification = createDefaultNotification();

//   notification.title = 'Daily Target Reminder';
//   notification.message = `Reminder: Your target for today is ${targetDescription}. Current progress: ${currentValue || 0} / ${targetValue}.`;
//   notification.type = 'system';
//   notification.priority = 'medium';
//   notification.targetRole = 'specific';
//   notification.targetUsers = [staffId];
//   notification.action = {
//     type: 'link',
//     destination: '/targets/view',
//     label: 'View Targets'
//   };

//   return notification;
// }

module.exports = {
  notificationSchema,
  createDefaultNotification,
  validateNotification,
  prepareNotification,
  createLowStockNotification,
  createMissingRosterNotification,
  // createDailyTargetNotification,
  createFirestoreIndexes,
  cleanupSampleNotification
};