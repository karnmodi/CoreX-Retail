const admin = require('firebase-admin');
const notificationFunctions = require('./notificationFunctions');

// Check for low inventory items and send notifications
async function checkLowInventory() {
  try {
    console.log('Checking for low inventory items...');
    const db = admin.firestore();

    // Get all inventory items
    const inventorySnapshot = await db.collection('inventory').get();
    const lowStockItems = [];

    // Process each inventory item
    inventorySnapshot.forEach(doc => {
      const item = doc.data();

      // Check if stock is below reorder point
      if (item.currentStock <= item.reorderPoint) {
        lowStockItems.push({
          id: doc.id,
          name: item.productName,
          currentStock: item.currentStock,
          reorderPoint: item.reorderPoint
        });
      }
    });

    if (lowStockItems.length === 0) {
      console.log('No low stock items found');
      return { success: true, message: 'No low stock items found' };
    }

    // Create notifications for admins and managers
    await notificationFunctions.createLowStockNotification(lowStockItems);
    await notificationFunctions.createLowStockNotificationForManager(lowStockItems);

    console.log(`Created notifications for low stock items`);
    return {
      success: true,
      message: `Created notifications for ${lowStockItems.length} low stock items`
    };
  } catch (error) {
    console.error('Error checking low inventory:', error);
    return { success: false, error: 'Failed to check inventory levels' };
  }
}


module.exports = {
  checkLowInventory,
};