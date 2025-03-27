const firebase = require('firebase-admin');

const rostersSchema = {
  // Shift Info
  date: {
    type: 'string',
    required: true,
    default: ''
  },
  startTime: {
    type: 'string',
    required: true,
    default: ''
  },
  endTime: {
    type: 'string',
    required: true,
    default: ''
  },

  // Employee Reference (Nested Object)
  employeeId: {
    type: 'object',
    required: true,
    default: {
      uid: '',
      username: ''
    }
  },

  // Optional Notes (if needed)
  shiftNote: {
    type: 'string',
    required: false,
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

function createDefaultRoster() {
    const defaultRoster = {};
  
    for (const [field, config] of Object.entries(rostersSchema)) {
      defaultRoster[field] =
        typeof config.default === 'function' ? config.default() : config.default;
    }
  
    return defaultRoster;
  }
  
  function validateRoster(roster) {
    const errors = [];
  
    for (const [field, config] of Object.entries(rostersSchema)) {
      if (field === 'id') continue;
  
      const value = roster[field];
  
      if (config.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
  
      if (value === undefined || value === null) continue;
  
      switch (config.type) {
        case 'string':
          if (typeof value !== 'string') errors.push(`${field} must be a string`);
          break;
        case 'object':
          if (typeof value !== 'object') errors.push(`${field} must be an object`);
          break;
      }
    }
  
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  function prepareRoster(data) {
    const roster = createDefaultRoster();
  
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        roster[key] = value;
      }
    }
  
    // Ensure timestamps
    roster.updatedAt = new Date();
    if (!data.createdAt) {
      roster.createdAt = new Date();
    }
  
    return roster;
  }
  
  module.exports = {
    rostersSchema,
    createDefaultRoster,
    validateRoster,
    prepareRoster
  };
  