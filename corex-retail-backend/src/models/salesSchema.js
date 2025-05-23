const firebase = require('firebase-admin');

const salesSchema = {
  // Basic Information
  productId: {
    type: 'string',
    required: true,
    default: ''
  },
  productName: {
    type: 'string',
    required: true,
    default: ''
  },
  category: {
    type: 'string',
    required: false,
    enum: ['Phones', 'Tabs', 'Watches', 'Earbuds', 'Others'],
    default: 'Others'
  },
  
  // Transaction Information
  quantity: {
    type: 'number',
    required: true,
    min: 1,
    default: 1
  },
  unitPrice: {
    type: 'number',
    required: true,
    min: 0,
    default: 0.0
  },
  totalAmount: {
    type: 'number',
    required: true,
    min: 0,
    default: 0.0
  },
  
  // Location and Payment Info
  storeLocation: {
    type: 'string',
    required: true,
    default: ''
  },
  paymentMethod: {
    type: 'string',
    required: true,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Other'],
    default: 'Cash'
  },
  
  // Time-related fields for aggregations
  saleDatetime: {
    type: 'timestamp',
    required: true,
    default: () => firebase.firestore.FieldValue.serverTimestamp()
  },
  dateKey: {
    type: 'string',
    required: true,
    default: ''
  },
  hourKey: {
    type: 'string',
    required: true,
    default: ''
  },
  minuteKey: {
    type: 'string',
    required: true,
    default: ''
  },
  
  // Identifiers
  transactionId: {
    type: 'string',
    required: true,
    default: ''
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

function createDefaultSalesItem() {
  const defaultItem = {};

  for (const [field, config] of Object.entries(salesSchema)) {
    if (typeof config.default === 'function') {
      defaultItem[field] = config.default();
    } else {
      defaultItem[field] = config.default;
    }
  }

  return defaultItem;
}

function validateSalesItem(item) {
  const errors = [];

  for (const [field, config] of Object.entries(salesSchema)) {
    if (field === 'id') continue;

    if (config.required && (item[field] === undefined || item[field] === null)) {
      errors.push(`${field} is required`);
      continue;
    }

    if (item[field] === undefined || item[field] === null) continue;

    if (config.type === 'string' && typeof item[field] !== 'string') {
      errors.push(`${field} must be a string`);
    }

    if (config.type === 'number' && typeof item[field] !== 'number') {
      errors.push(`${field} must be a number`);
    }

    if (config.enum && !config.enum.includes(item[field])) {
      errors.push(`${field} must be one of: ${config.enum.join(', ')}`);
    }

    if (config.type === 'number') {
      if (config.min !== undefined && item[field] < config.min) {
        errors.push(`${field} must be at least ${config.min}`);
      }
      if (config.max !== undefined && item[field] > config.max) {
        errors.push(`${field} must be at most ${config.max}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function prepareSalesItem(itemData) {
  const item = createDefaultSalesItem();

  for (const [key, value] of Object.entries(itemData)) {
    if (value !== undefined && value !== null) {
      if (salesSchema[key] && salesSchema[key].type === 'number' && typeof value !== 'number') {
        item[key] = parseFloat(value) || salesSchema[key].default;
      } else {
        item[key] = value;
      }
    }
  }

  // Generate time-based keys if not provided
  if (itemData.saleDatetime && (!itemData.dateKey || !itemData.hourKey || !itemData.minuteKey)) {
    const date = new Date(itemData.saleDatetime);
    
    if (!itemData.dateKey) {
      item.dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    if (!itemData.hourKey) {
      const hours = date.getHours().toString().padStart(2, '0');
      item.hourKey = `${item.dateKey}-${hours}`;
    }
    
    if (!itemData.minuteKey) {
      const minutes = date.getMinutes().toString().padStart(2, '0');
      item.minuteKey = `${item.hourKey}-${minutes}`;
    }
  }

  // Ensure timestamps
  item.updatedAt = new Date();
  if (!itemData.createdAt) {
    item.createdAt = new Date();
  }

  // Generate transaction ID if not provided
  if (!itemData.transactionId) {
    item.transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  return item;
}

module.exports = {
  salesSchema,
  createDefaultSalesItem,
  validateSalesItem,
  prepareSalesItem
};