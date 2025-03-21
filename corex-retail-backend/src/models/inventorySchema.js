const firebase = require('firebase-admin');

const inventorySchema = {
    // Basic Information
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
    status: {
      type: 'string',
      required: true,
      enum: ['Active', 'Discontinued', 'Out of Stock'],
      default: 'Active'
    },
    
    // Inventory Metrics
    currentStock: {
      type: 'number',
      required: true,
      min: 0,
      default: 0
    },
    reorderPoint: {
      type: 'number',
      required: true,
      min: 0,
      default: 0
    },
    reorderQuantity: {
      type: 'number',
      required: true,
      min: 0,
      default: 0
    },
    leadTimeDays: {
      type: 'number',
      required: true,
      min: 0,
      default: 0
    },
    
    // Pricing
    costPrice: {
      type: 'number',
      required: true,
      min: 0,
      default: 0.0
    },
    sellingPrice: {
      type: 'number',
      required: true,
      min: 0,
      default: 0.0
    },
    margin: {
      type: 'number',
      required: false,
      min: 0,
      default: 0.0
    },
    
    // Physical Attributes
    weightKg: {
      type: 'number',
      required: false,
      min: 0,
      default: 0.0
    },
    dimensions: {
      type: 'object',
      required: false,
      default: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'cm'
      }
    },
    
    // Location & Dates
    storageLocation: {
      type: 'string',
      required: false,
      default: ''
    },
    dateAdded: {
      type: 'timestamp',
      required: true,
      default: () => firebase.firestore.FieldValue.serverTimestamp()
    },
    expirationDate: {
      type: 'timestamp',
      required: false,
      default: null
    },
    
    // Images
    images: {
      type: 'array',
      required: false,
      default: []
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
  
  function createDefaultInventoryItem() {
    const defaultItem = {};
    
    for (const [field, config] of Object.entries(inventorySchema)) {
      if (typeof config.default === 'function') {
        defaultItem[field] = config.default();
      } else {
        defaultItem[field] = config.default;
      }
    }
    
    return defaultItem;
  }
  
  function validateInventoryItem(item) {
    const errors = [];
    
    for (const [field, config] of Object.entries(inventorySchema)) {
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
      
      if (config.type === 'array' && !Array.isArray(item[field])) {
        errors.push(`${field} must be an array`);
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
  
  function prepareInventoryItem(itemData) {
    const item = createDefaultInventoryItem();
    
    for (const [key, value] of Object.entries(itemData)) {
      
      if (value !== undefined && value !== null) {

        if (inventorySchema[key] && inventorySchema[key].type === 'number' && typeof value !== 'number') {
          item[key] = parseFloat(value) || inventorySchema[key].default;
        } else {
          item[key] = value;
        }
      }
    }
    
    // Ensure timestamps
    item.updatedAt = new Date();
    if (!itemData.createdAt) {
      item.createdAt = new Date();
    }
    
    return item;
  }

  module.exports = {
    inventorySchema,
    createDefaultInventoryItem,
    validateInventoryItem,
    prepareInventoryItem
  };