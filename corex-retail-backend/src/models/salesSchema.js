const firebase = require('firebase-admin');

const salesSchema = {
  // Transaction Information
  transactionId: {
    type: 'string',
    required: true,
    default: ''
  },
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
    required: true,
    enum: ['Phones', 'Tabs', 'Watches', 'Earbuds', 'Others'],
    default: 'Phones'
  },

  // Pricing and Quantity
  unitPrice: {
    type: 'number',
    required: true,
    min: 0,
    default: 0.0
  },
  quantity: {
    type: 'number',
    required: true,
    min: 1,
    default: 1
  },
  totalAmount: {
    type: 'number',
    required: true,
    min: 0,
    default: 0.0
  },

  // Store Information
  storeLocation: {
    type: 'string',
    required: true,
    default: ''
  },

  // Timestamps
  saleDateTime: {
    type: 'timestamp',
    required: true,
    default: () => firebase.firestore.FieldValue.serverTimestamp()
  },

  // Minute-Level Data
  minuteKey: {
    type: 'string',
    required: true,
    default: '' // Format: YYYY-MM-DD-HH-MM
  },
  hourKey: {
    type: 'string',
    required: true,
    default: '' // Format: YYYY-MM-DD-HH
  },
  dateKey: {
    type: 'string',
    required: true,
    default: '' // Format: YYYY-MM-DD
  },

  // Additional Information
  paymentMethod: {
    type: 'string',
    required: false,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Other'],
    default: 'Cash'
  },

  // Metadata
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

function createDefaultSalesRecord() {
  const defaultRecord = {};

  for (const [field, config] of Object.entries(salesSchema)) {
    if (typeof config.default === 'function') {
      defaultRecord[field] = config.default();
    } else {
      defaultRecord[field] = config.default;
    }
  }

  return defaultRecord;
}

function validateSalesRecord(record) {
  const errors = [];

  for (const [field, config] of Object.entries(salesSchema)) {
    if (field === 'id') continue;

    if (config.required && (record[field] === undefined || record[field] === null)) {
      errors.push(`${field} is required`);
      continue;
    }

    if (record[field] === undefined || record[field] === null) continue;

    if (config.type === 'string' && typeof record[field] !== 'string') {
      errors.push(`${field} must be a string`);
    }

    if (config.type === 'number' && typeof record[field] !== 'number') {
      errors.push(`${field} must be a number`);
    }

    if (config.enum && !config.enum.includes(record[field])) {
      errors.push(`${field} must be one of: ${config.enum.join(', ')}`);
    }

    if (config.type === 'number') {
      if (config.min !== undefined && record[field] < config.min) {
        errors.push(`${field} must be at least ${config.min}`);
      }
      if (config.max !== undefined && record[field] > config.max) {
        errors.push(`${field} must be at most ${config.max}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function prepareSalesRecord(recordData) {
  const record = createDefaultSalesRecord();

  for (const [key, value] of Object.entries(recordData)) {
    if (value !== undefined && value !== null) {
      if (salesSchema[key] && salesSchema[key].type === 'number' && typeof value !== 'number') {
        record[key] = parseFloat(value) || salesSchema[key].default;
      } else {
        record[key] = value;
      }
    }
  }

  if (!recordData.totalAmount) {
    record.totalAmount = record.unitPrice * record.quantity;
  }

  // Make sure the date keys (dateKey, hourKey, minuteKey) are preserved
  if (recordData.dateKey) record.dateKey = recordData.dateKey;
  if (recordData.hourKey) record.hourKey = recordData.hourKey;
  if (recordData.minuteKey) record.minuteKey = recordData.minuteKey;

  // Set saleDateTime if not already set but datetime exists
  if (!record.saleDateTime && recordData.datetime) {
    if (typeof recordData.datetime === 'object' && recordData.datetime instanceof Date) {
      record.saleDateTime = recordData.datetime;
    } else {
      record.saleDateTime = new Date(recordData.datetime);
    }
  }

  // Calculate total amount if not provided
  if (!recordData.totalAmount && recordData.unitPrice && recordData.quantity) {
    record.totalAmount = parseFloat(recordData.unitPrice) * parseInt(recordData.quantity);
  }

  // Ensure timestamps
  record.updatedAt = new Date();
  if (!recordData.createdAt) {
    record.createdAt = new Date();
  }

  return record;
}

module.exports = {
  salesSchema,
  createDefaultSalesRecord,
  validateSalesRecord,
  prepareSalesRecord
};