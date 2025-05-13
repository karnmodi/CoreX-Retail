// models/requestSchema.js
// Update to the existing requestSchema.js file

const admin = require('firebase-admin');

const requestTypes = ['day_off', 'sick_leave', 'holiday_leave', 'multiple_shift_assignment'];
const requestStatus = ['pending', 'approved', 'rejected'];

const requestSchema = {
    requestType: {
        type: 'string',
        required: true,
        enum: requestTypes,
        default: 'day_off'
    },

    requesterId: {
        type: 'string',
        required: true,
        default: ''
    },
    requesterName: {
        type: 'string',
        required: true,
        default: ''
    },
    requesterRole: {
        type: 'string',
        required: true,
        default: ''
    },

    // Date Information
    startDate: {
        type: 'string',
        required: true,
        default: ''
    },
    endDate: {
        type: 'string',
        required: false,
        default: ''
    },

    storeId: {
        type: 'string',
        required: false,
        default: ''
    },
    storeName: {
        type: 'string',
        required: false,
        default: ''
    },

    leaveReason: {
        type: 'string',
        required: false,
        default: ''
    },

    staffAssignments: {
        type: 'array',
        required: false,
        default: []
        // Array of objects: [{ staffId, staffName, date, startTime, endTime }]
    },

    // Status tracking
    status: {
        type: 'string',
        required: true,
        enum: requestStatus,
        default: 'pending'
    },

    processedBy: {
        type: 'object',
        required: false,
        default: {
            uid: '',
            name: ''
        }
    },

    processedDate: {
        type: 'timestamp',
        required: false,
        default: null
    },

    // Comments
    comments: {
        type: 'array',
        required: false,
        default: []
    },

    decisionNotes: {
        type: 'string',
        required: false,
        default: ''
    },

    // Timestamps
    createdAt: {
        type: 'timestamp',
        required: true,
        default: () => admin.firestore.FieldValue.serverTimestamp()
    },
    updatedAt: {
        type: 'timestamp',
        required: true,
        default: () => admin.firestore.FieldValue.serverTimestamp()
    }
};

function createDefaultRequest() {
    const defaultRequest = {};

    for (const [field, config] of Object.entries(requestSchema)) {
        if (typeof config.default === 'function') {
            defaultRequest[field] = config.default();
        } else {
            defaultRequest[field] = config.default;
        }
    }

    return defaultRequest;
}

function validateRequest(request) {
    const errors = [];

    for (const [field, config] of Object.entries(requestSchema)) {
        if (field === 'id') continue;

        if (config.required && (request[field] === undefined || request[field] === null || request[field] === '')) {
            errors.push(`${field} is required`);
            continue;
        }

        if (request[field] === undefined || request[field] === null) continue;

        if (config.type === 'string' && typeof request[field] !== 'string') {
            errors.push(`${field} must be a string`);
        }

        if (config.type === 'number' && typeof request[field] !== 'number') {
            errors.push(`${field} must be a number`);
        }

        if (config.type === 'array' && !Array.isArray(request[field])) {
            errors.push(`${field} must be an array`);
        }

        if (config.enum && !config.enum.includes(request[field])) {
            errors.push(`${field} must be one of: ${config.enum.join(', ')}`);
        }
    }

    if (request.requestType === 'multiple_shift_assignment' &&
        (!request.staffAssignments || request.staffAssignments.length === 0)) {
        errors.push('staffAssignments are required for multiple shift assignments');
    }

    if (request.startDate && request.endDate && new Date(request.endDate) < new Date(request.startDate)) {
        errors.push('endDate cannot be before startDate');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

function prepareRequest(requestData) {
    const request = createDefaultRequest();

    for (const [key, value] of Object.entries(requestData)) {
        if (value !== undefined && value !== null) {
            request[key] = value;
        }
    }

    if (!requestData.endDate && requestData.startDate) {
        request.endDate = requestData.startDate;
    }

    request.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    if (!requestData.createdAt) {
        request.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    return request;
}

function formatDateRange(startDate, endDate) {
    if (!startDate) return '';
    if (!endDate || startDate === endDate) return startDate;

    return `${startDate} to ${endDate}`;
}

function createStaffAssignment(staffId, staffName, date, startTime, endTime) {
    return {
        staffId,
        staffName,
        date: date || '',
        startTime: startTime || '',
        endTime: endTime || ''
    };
}

module.exports = {
    requestTypes,
    requestStatus,
    requestSchema,
    createDefaultRequest,
    validateRequest,
    prepareRequest,
    formatDateRange,
    createStaffAssignment
};