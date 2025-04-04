const admin = require('firebase-admin');
// models/employeeSchema.js

const employeeSchema = {
  // Basic Information
  firstName: {
    type: 'string',
    required: true,
    default: ''
  },
  lastName: {
    type: 'string',
    required: true,
    default: ''
  },
  email: {
    type: 'string',
    required: true,
    default: ''
  },
  empId: {
    type: 'string',
    required: true,
    default: ''
  },

  // Employment Details
  employeeStatus: {
    type: 'string',
    required: true,
    enum: ['active', 'inactive', 'on leave', 'terminated'],
    default: 'active'
  },
  employeeType: {
    type: 'string',
    required: true,
    enum: ['full-time', 'part-time', 'contract', 'intern'],
    default: 'full-time'
  },
  classificationType: {
    type: 'string',
    required: true,
    enum: ['full-time', 'part-time', 'temporary', 'seasonal'],
    default: 'full-time'
  },
  currentEmployeeRating: {
    type: 'string',
    required: false,
    default: ''
  },

  // Department Information
  departmentType: {
    type: 'string',
    required: true,
    default: ''
  },
  division: {
    type: 'string',
    required: false,
    default: ''
  },
  jobFunctionDescription: {
    type: 'string',
    required: false,
    default: ''
  },
  role: {
    type: 'string',
    required: false,
    default: ''
  },
  supervisor: {
    type: 'string',
    required: false,
    default: ''
  },

  // Personal Information
  dateOfBirth: {
    type: 'string',
    required: false,
    default: ''
  },
  genderCode: {
    type: 'string',
    required: false,
    enum: ['male', 'female', 'other', 'prefer not to say'],
    default: ''
  },
  maritalStatus: {
    type: 'string',
    required: false,
    enum: ['single', 'married', 'divorced', 'widowed', 'separated'],
    default: ''
  },

  // Location Information
  locationCode: {
    type: 'string',
    required: false,
    default: ''
  },
  payZone: {
    type: 'string',
    required: false,
    default: ''
  },
  state: {
    type: 'string',
    required: false,
    default: ''
  },

  // Performance Information
  performanceScore: {
    type: 'string',
    required: false,
    default: ''
  },
  feedback: {
    type: 'string',
    required: false,
    default: ''
  },

  // Date Information
  startDate: {
    type: 'string',
    required: false,
    default: ''
  },
  exitDate: {
    type: 'string',
    required: false,
    default: null
  },
  terminationType: {
    type: 'string',
    required: false,
    enum: ['voluntary', 'involuntary', 'retirement', 'n/a', 'unk'],
    default: 'n/a'
  },
  terminationDescription: {
    type: 'string',
    required: false,
    default: 'not applicable'
  },

  // Timestamps

  lastNotificationCheck: {
    type: 'timestamp',
    default: admin.firestore.FieldValue.serverTimestamp()
  },
    createdAt: {
    type: 'timestamp',
    required: true,
    default: () => new Date()
  },
  updatedAt: {
    type: 'timestamp',
    required: true,
    default: () => new Date()
  }
};

function createDefaultEmployee() {
  const defaultEmployee = {};

  for (const [field, config] of Object.entries(employeeSchema)) {
    if (typeof config.default === 'function') {
      defaultEmployee[field] = config.default();
    } else {
      defaultEmployee[field] = config.default;
    }
  }

  return defaultEmployee;
}

function validateEmployee(employee) {
  const errors = [];

  for (const [field, config] of Object.entries(employeeSchema)) {
    if (field === 'id') continue;

    if (config.required && (employee[field] === undefined || employee[field] === null || employee[field] === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (employee[field] === undefined || employee[field] === null) continue;

    if (config.type === 'string' && typeof employee[field] !== 'string') {
      errors.push(`${field} must be a string`);
    }

    if (config.type === 'number' && typeof employee[field] !== 'number') {
      errors.push(`${field} must be a number`);
    }

    if (config.type === 'array' && !Array.isArray(employee[field])) {
      errors.push(`${field} must be an array`);
    }

    if (config.enum && !config.enum.includes(employee[field])) {
      errors.push(`${field} must be one of: ${config.enum.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function prepareEmployee(employeeData) {
  const employee = createDefaultEmployee();

  for (const [key, value] of Object.entries(employeeData)) {
    if (value !== undefined && value !== null && value !== '') {
      employee[key] = value;
    }
  }

  employee.updatedAt = new Date().toISOString();
  if (!employeeData.createdAt) {
    employee.createdAt = new Date().toISOString();
  }

  console.log("Final Employee Data Before Insertion:", employee);
  return employee;
}


module.exports = {
  employeeSchema,
  createDefaultEmployee,
  validateEmployee,
  prepareEmployee
};