// controllers/requestController.js
const admin = require('firebase-admin');
const db = admin.firestore();
const {
    requestTypes,
    requestStatus,
    validateRequest,
    prepareRequest
} = require('../../models/requestSchema');

const createRequest = async (req, res) => {
    try {
        const userId = req.user.uid;

        const userRef = db.collection('employees').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const requestData = {
            ...req.body,
            requesterId: userId,
            requesterName: `${userData.firstName} ${userData.lastName}`.trim(),
            requesterRole: userData.role || 'staff',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Validate the request
        const preparedData = prepareRequest(requestData);
        const validation = validateRequest(preparedData);

        if (!validation.valid) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.errors
            });
        }

        // For multiple shift assignments, fetch and add staff names
        if (requestData.requestType === 'multiple_shift_assignment') {
            if (!requestData.staffAssignments || requestData.staffAssignments.length === 0) {
                return res.status(400).json({ error: 'Staff assignments are required for multiple shift assignments' });
            }

            // Enhanced staffAssignments with staff names
            const enhancedStaffAssignments = [];

            for (const assignment of requestData.staffAssignments) {
                const staffDoc = await db.collection('employees').doc(assignment.staffId).get();

                if (!staffDoc.exists) {
                    return res.status(404).json({ error: `Staff with ID ${assignment.staffId} not found` });
                }

                const staffData = staffDoc.data();

                enhancedStaffAssignments.push({
                    ...assignment,
                    staffName: `${staffData.firstName} ${staffData.lastName}`.trim(),
                    staffEmail: staffData.email || ''
                });
            }

            preparedData.staffAssignments = enhancedStaffAssignments;
        }

        const docRef = await db.collection('requests').add(preparedData);

        await createRequestNotification(preparedData, 'admin');

        if (userData.role === 'staff' && ['day_off', 'sick_leave', 'holiday_leave'].includes(requestData.requestType)) {
            await createRequestNotification(preparedData, 'store manager');
        }

        res.status(201).json({
            message: 'Request created successfully',
            id: docRef.id,
            data: preparedData
        });
    } catch (error) {
        console.error('Error creating request:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const createRequestNotification = async (requestData, targetRole) => {
    try {
        const requestTypesMap = {
            'day_off': 'Day Off',
            'sick_leave': 'Sick Leave',
            'holiday_leave': 'Holiday Leave',
            'multiple_shift_assignment': 'Multiple Shift Assignment'
        };

        const requestTypeDisplay = requestTypesMap[requestData.requestType] || requestData.requestType;

        const notification = {
            title: `New ${requestTypeDisplay} Request`,
            message: `${requestData.requesterName} (${requestData.requesterRole}) has requested ${requestTypeDisplay} from ${requestData.startDate}${requestData.endDate && requestData.startDate !== requestData.endDate ? ` to ${requestData.endDate}` : ''}.`,
            type: 'system',
            priority: requestData.requestType === 'sick_leave' ? 'high' : 'medium',
            targetRole: targetRole,
            read: {},
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            action: {
                type: 'link',
                destination: 'more/requests',
                label: 'Review Request'
            }
        };

        await db.collection('notifications').add(notification);
    } catch (error) {
        console.error('Error creating notification for request:', error);
    }
};

// Get all requests (with filtering options)
const getRequests = async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('employees').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const userRole = userData.role;

        const { status, type, startDate, endDate } = req.query;

        let query = db.collection('requests');

        if (status) {
            query = query.where('status', '==', status);
        }

        if (type) {
            query = query.where('requestType', '==', type);
        }

        if (startDate) {
            query = query.where('startDate', '>=', startDate);
        }

        if (endDate) {
            query = query.where('endDate', '<=', endDate);
        }

        if (userRole === 'staff') {
            query = query.where('requesterId', '==', userId);
        } else if (userRole === 'store manager') {
            const managerRequests = await query.where('requesterId', '==', userId).get();

            const staffRequests = await query.where('requesterRole', '==', 'staff').get();

            const requests = [
                ...managerRequests.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })),
                ...staffRequests.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
            ];

            return res.status(200).json(requests);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get request by ID
const getRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        if (!id) {
            return res.status(400).json({ error: 'Request ID is required' });
        }

        const requestDoc = await db.collection('requests').doc(id).get();

        if (!requestDoc.exists) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const requestData = requestDoc.data();
        const userDoc = await db.collection('employees').doc(userId).get();
        const userData = userDoc.data();

        // Check if user has permission to view this request
        if (userData.role === 'staff' && requestData.requesterId !== userId) {
            return res.status(403).json({ error: 'You do not have permission to view this request' });
        }

        if (userData.role === 'store manager' &&
            requestData.requesterId !== userId &&
            requestData.requesterRole !== 'staff') {
            return res.status(403).json({ error: 'You do not have permission to view this request' });
        }

        res.status(200).json({
            id: requestDoc.id,
            ...requestData
        });
    } catch (error) {
        console.error('Error fetching request by ID:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Update request status (approve/reject)
const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;
        const userId = req.user.uid;

        if (!id) {
            return res.status(400).json({ error: 'Request ID is required' });
        }

        if (!status || !requestStatus.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${requestStatus.join(', ')}` });
        }

        const requestRef = db.collection('requests').doc(id);
        const requestDoc = await requestRef.get();

        if (!requestDoc.exists) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const requestData = requestDoc.data();
        const userDoc = await db.collection('employees').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();

        if (userData.role !== 'admin') {
            return res.status(403).json({ error: 'Only administrators can approve or reject requests' });
        }

        // If the request is already processed
        if (requestData.status !== 'pending') {
            return res.status(400).json({ error: `This request is already ${requestData.status}` });
        }

        const updates = {
            status,
            updatedAt: new Date(),
            processedBy: {
                uid: userId,
                name: `${userData.firstName} ${userData.lastName}`.trim()
            },
            processedDate: new Date()
        };

        if (comment) {
            const commentObj = {
                authorId: userId,
                authorName: `${userData.firstName} ${userData.lastName}`.trim(),
                text: comment,
                timestamp: new Date()
            };

            if (requestData.comments && Array.isArray(requestData.comments)) {
                updates.comments = [...requestData.comments, commentObj];
            } else {
                updates.comments = [commentObj];
            }
        }

        await requestRef.update(updates);

        await createStatusUpdateNotification(requestData, status, userId, userData);

        if (status === 'approved' && requestData.requestType === 'multiple_shift_assignment' &&
            requestData.staffAssignments && requestData.staffAssignments.length > 0) {
            await createRosterEntriesFromRequest(requestData);
        }

        if (status === 'approved' &&
            ['day_off', 'sick_leave', 'holiday_leave'].includes(requestData.requestType)) {
            await removeExistingShiftsForLeave(requestData);
        }

        const updatedDoc = await requestRef.get();
        res.status(200).json({
            message: `Request ${status} successfully`,
            updatedData: updatedDoc.data()
        });
    } catch (error) {
        console.error('Error updating request status:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const removeExistingShiftsForLeave = async (requestData) => {
    try {
        const employeeId = requestData.requesterId;

        const startDate = requestData.startDate;
        const endDate = requestData.endDate || requestData.startDate;

        const dateRange = [];
        const currentDate = new Date(startDate);
        const lastDate = new Date(endDate);

        while (currentDate <= lastDate) {
            dateRange.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const batch = db.batch();
        let shiftsFound = 0;

        for (const date of dateRange) {
            const shiftsSnapshot = await db.collection('shifts')
                .where('employeeId.uid', '==', employeeId)
                .where('date', '==', date)
                .get();

            if (!shiftsSnapshot.empty) {
                shiftsSnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                    shiftsFound++;
                });
            }
        }

        if (shiftsFound > 0) {
            await batch.commit();
            console.log(`Removed ${shiftsFound} existing shifts for employee ${employeeId} during approved leave from ${startDate} to ${endDate}`);

            await createShiftRemovalNotification(requestData, shiftsFound);
        }

        return shiftsFound;
    } catch (error) {
        console.error('Error removing existing shifts for leave:', error);
        throw error;
    }
};

const createShiftRemovalNotification = async (requestData, shiftsRemoved) => {
    try {
        const requesterId = requestData.requesterId;
        const requesterName = requestData.requesterName;

        const requestTypesMap = {
            'day_off': 'Day Off',
            'sick_leave': 'Sick Leave',
            'holiday_leave': 'Holiday Leave'
        };

        const requestTypeDisplay = requestTypesMap[requestData.requestType] || requestData.requestType;

        // Notification for the employee
        const employeeNotification = {
            title: 'Scheduled Shifts Removed',
            message: `${shiftsRemoved} scheduled shift(s) have been automatically removed due to your approved ${requestTypeDisplay} from ${requestData.startDate}${requestData.endDate && requestData.startDate !== requestData.endDate ? ` to ${requestData.endDate}` : ''}.`,
            type: 'system',
            priority: 'medium',
            targetRole: 'specific',
            targetUsers: [requesterId],
            read: {},
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            action: {
                type: 'link',
                destination: `more/requests`,
                label: 'View Details'
            }
        };

        // Notification for managers
        const managerNotification = {
            title: 'Staff Shifts Removed',
            message: `${shiftsRemoved} scheduled shift(s) for ${requesterName} have been automatically removed due to approved ${requestTypeDisplay} from ${requestData.startDate}${requestData.endDate && requestData.startDate !== requestData.endDate ? ` to ${requestData.endDate}` : ''}.`,
            type: 'system',
            priority: 'medium',
            targetRole: 'store manager',
            read: {},
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            action: {
                type: 'link',
                destination: `/scheduling`,
                label: 'View Schedule'
            }
        };

        // Send both notifications
        await db.collection('notifications').add(employeeNotification);
        await db.collection('notifications').add(managerNotification);

    } catch (error) {
        console.error('Error creating shift removal notification:', error);
    }
};

const createStatusUpdateNotification = async (requestData, newStatus, processedByUid, processedByData) => {
    try {
        const requesterId = requestData.requesterId;

        const requestTypesMap = {
            'day_off': 'Day Off',
            'sick_leave': 'Sick Leave',
            'holiday_leave': 'Holiday Leave',
            'multiple_shift_assignment': 'Multiple Shift Assignment'
        };

        const requestTypeDisplay = requestTypesMap[requestData.requestType] || requestData.requestType;

        const notification = {
            title: `${requestTypeDisplay} Request ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `Your request for ${requestTypeDisplay} from ${requestData.startDate}${requestData.endDate && requestData.startDate !== requestData.endDate ? ` to ${requestData.endDate}` : ''} has been ${newStatus}.`,
            type: 'system',
            priority: 'medium',
            targetRole: 'specific',
            targetUsers: [requesterId],
            read: {},
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: {
                userId: processedByUid,
                userName: `${processedByData.firstName} ${processedByData.lastName}`.trim(),
                userRole: processedByData.role
            },
            action: {
                type: 'link',
                destination: `more/requests/`,
                label: 'View Details'
            }
        };

        await db.collection('notifications').add(notification);
    } catch (error) {
        console.error('Error creating status update notification:', error);
    }
};

const createRosterEntriesFromRequest = async (requestData) => {
    try {
        const batch = db.batch();

        for (const assignment of requestData.staffAssignments) {
            // Get the staff details
            const staffDoc = await db.collection('employees').doc(assignment.staffId).get();

            if (staffDoc.exists) {
                const staffData = staffDoc.data();
                const fullEmployee = {
                    uid: assignment.staffId,
                    username: `${staffData.firstName} ${staffData.lastName}`.trim(),
                    profilePicture: staffData.profilePicture || '',
                };

                // Create a shift entry
                const shiftRef = db.collection('shifts').doc();
                const shiftData = {
                    employeeId: fullEmployee,
                    date: assignment.date || requestData.startDate,
                    startTime: assignment.startTime,
                    endTime: assignment.endTime,
                    note: `Auto-generated from approved request #${requestData.id}`,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                };

                batch.set(shiftRef, shiftData);
            }
        }

        await batch.commit();
    } catch (error) {
        console.error('Error creating roster entries from request:', error);
        throw error;
    }
};

// Add a comment to a request
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user.uid;

        if (!id) {
            return res.status(400).json({ error: 'Request ID is required' });
        }

        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const requestRef = db.collection('requests').doc(id);
        const requestDoc = await requestRef.get();

        if (!requestDoc.exists) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const requestData = requestDoc.data();
        const userDoc = await db.collection('employees').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();

        // Check if user has permission to comment on this request
        if (userData.role === 'staff' && requestData.requesterId !== userId) {
            return res.status(403).json({ error: 'You do not have permission to comment on this request' });
        }

        // Create the comment
        const commentObj = {
            authorId: userId,
            authorName: `${userData.firstName} ${userData.lastName}`.trim(),
            text: text.trim(),
            timestamp: new Date()
        };

        // Update the request with the new comment
        if (requestData.comments && Array.isArray(requestData.comments)) {
            await requestRef.update({
                comments: admin.firestore.FieldValue.arrayUnion(commentObj),
                updatedAt: new Date()
            });
        } else {
            await requestRef.update({
                comments: [commentObj],
                updatedAt: new Date()
            });
        }

        const updatedDoc = await requestRef.get();
        res.status(200).json({
            message: 'Comment added successfully',
            updatedData: updatedDoc.data()
        });
    } catch (error) {
        console.error('Error adding comment to request:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Delete a request (only if it's pending and created by the requester)
const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        if (!id) {
            return res.status(400).json({ error: 'Request ID is required' });
        }

        const requestRef = db.collection('requests').doc(id);
        const requestDoc = await requestRef.get();

        if (!requestDoc.exists) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const requestData = requestDoc.data();

        // Check if user has permission to delete this request
        if (requestData.requesterId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You do not have permission to delete this request' });
        }

        // Only pending requests can be deleted
        if (requestData.status !== 'pending' && req.user.role !== 'admin') {
            return res.status(400).json({ error: `Cannot delete a request that is already ${requestData.status}` });
        }

        await requestRef.delete();

        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error deleting request:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get requests for current user
const getMyRequests = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { status } = req.query;

        let query = db.collection('requests').where('requesterId', '==', userId);

        if (status) {
            query = query.where('status', '==', status);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching my requests:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get pending requests for admin/manager approval
const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('employees').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const userRole = userData.role;

        if (userRole !== 'admin' && userRole !== 'store manager') {
            return res.status(403).json({ error: 'Only administrators and managers can view pending requests' });
        }

        let query = db.collection('requests').where('status', '==', 'pending');

        if (userRole === 'store manager') {
            // Store managers can only see staff requests
            query = query.where('requesterRole', '==', 'staff');
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching pending requests:', error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createRequest,
    getRequests,
    getRequestById,
    updateRequestStatus,
    addComment,
    deleteRequest,
    getMyRequests,
    getPendingRequests
};