// routes/api/requestRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/auth');
const {
    createRequest,
    getRequests,
    getRequestById,
    updateRequestStatus,
    addComment,
    deleteRequest,
    getMyRequests,
    getPendingRequests
} = require('../../controllers/requests/requestController');
const { trackActivity } = require('../../controllers/profile/ActivityController');

router.use(verifyToken);

router.post('/',
    trackActivity(
        'Request_create',
        (req) => `${req.body.requestType} Request Created`,
        (req) => `New ${req.body.requestType} request was created from ${req.body.startDate}`
    ),
    createRequest
);

router.get('/', getRequests);

router.get('/my-requests', getMyRequests);

router.get('/pending', getPendingRequests);

router.get('/:id', getRequestById);

router.put('/:id/status',
    trackActivity(
        'Request_status_update',
        (req) => `Request ${req.body.status}`,
        (req) => `Request was ${req.body.status}`
    ),
    updateRequestStatus
);

router.post('/:id/comments',
    trackActivity(
        'Request_comment',
        (req) => 'Comment Added',
        (req) => 'Comment was added to request'
    ),
    addComment
);

router.delete('/:id',
    trackActivity(
        'Request_delete',
        (req) => 'Request Deleted',
        (req) => 'Request was deleted'
    ),
    deleteRequest
);

module.exports = router;