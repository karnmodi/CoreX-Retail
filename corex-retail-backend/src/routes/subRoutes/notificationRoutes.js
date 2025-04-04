// routes/api/notifications.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/auth');
const notificationController = require('../../controllers/notifications/notificationController');
const inventoryFunctions = require('../../../functions/subFunctions/inventoryFunctions');
const rostersFunctions = require('../../../functions/subFunctions/rosterFunctions');
const { auth } = require('../../config/firebase');

// Apply authentication middleware to all notification routes
router.use(verifyToken);

router.post('/manual-inventory-check', notificationController.manualInventoryCheck);

router.post('/manual-roster-check', notificationController.manualRosterCheck);

router.get('/', notificationController.getUserNotifications);

router.post('/', notificationController.createNotification);

router.put('/:id/read', notificationController.markAsRead);

router.get('/unread', notificationController.getUnreadNotifications);

router.put('/read-all', notificationController.markAllAsRead);

router.get('/new', notificationController.getNewNotifications);

router.get('/summary', notificationController.getNotificationSummary);

router.delete('/:id', notificationController.deleteNotification);

router.post('/check-inventory', async (req, res) => {
    try {
        // Verify admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only administrators can trigger this check' });
        }

        const result = await inventoryFunctions.checkLowInventory();
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error running inventory check:', error);
        return res.status(500).json({ error: 'Failed to run inventory check' });
    }
});

router.post('/check-rosters', async (req, res) => {
    try {
        // Verify admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only administrators can trigger this check' });
        }

        const result = await rostersFunctions.checkMissingRosters();
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error running roster check:', error);
        return res.status(500).json({ error: 'Failed to run roster check' });
    }
});

module.exports = router;