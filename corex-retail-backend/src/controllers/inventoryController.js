const { db, storage } = require("../config/firebase");
const admin = require('firebase-admin');
const {
  validateInventoryItem,
  prepareInventoryItem
} = require("../models/inventorySchema");


// 📌 Add New Product
const addProduct_BE = async (req, res) => {
  try {
    const productData = prepareInventoryItem(req.body);

    const validation = validateInventoryItem(productData);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors
      });
    }

    const images = req.files ? await uploadImages_BE(req.files) : [];
    productData.images = images;

    const productRef = db.collection("inventory").doc();
    productData.id = productRef.id;

    await productRef.set(productData);

    res.status(201).json({ message: "Product added successfully!", id: productRef.id, ...productData });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get All Products
const getAllProducts_BE = async (req, res) => {
  try {
    const snapshot = await db.collection("inventory").get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get Product by ID
const getProductById_BE = async (req, res) => {
  try {
    const id = req.params.id;
    const productRef = db.collection("inventory").doc(id);
    const docSnapshot = await productRef.get();

    if (!docSnapshot.exists) return res.status(404).json({ message: "Product not found" });

    res.json({ id: docSnapshot.id, ...docSnapshot.data() });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Update Product
const updateProduct_BE = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the current product data
    const productDoc = await db.collection("inventory").doc(id).get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existingProduct = productDoc.data();

    const updateData = prepareInventoryItem(req.body);

    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = typeof req.body.existingImages === 'string'
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
      } catch (error) {
        console.error("Error parsing existing images:", error);
        existingImages = [];
      }
    }

    let imagesToDelete = [];
    if (req.body.imagesToDelete) {
      try {
        imagesToDelete = typeof req.body.imagesToDelete === 'string'
          ? JSON.parse(req.body.imagesToDelete)
          : req.body.imagesToDelete;
      } catch (error) {
        console.error("Error parsing images to delete:", error);
        imagesToDelete = [];
      }
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = await uploadImages_BE(req.files);
    }

    let finalImages = existingImages.filter(url => !imagesToDelete.includes(url));

    finalImages = [...finalImages, ...newImages];

    updateData.images = finalImages;

    await db.collection("inventory").doc(id).update(updateData);

    const updatedDoc = await db.collection("inventory").doc(id).get();

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedDoc.data()
    });

  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Delete Product
const deleteProduct_BE = async (req, res) => {
  try {
    const id = req.params.id;
    const productRef = db.collection("inventory").doc(id);
    const docSnapshot = await productRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete product images from Firebase Storage
    await deleteImages_BE(docSnapshot.data().images);

    // Delete product from Firestore
    await productRef.delete();

    res.json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getLowStockProducts_BE = async (req, res) => {
  try {
    const inventoryRef = admin.firestore().collection('inventory');
    const snapshot = await inventoryRef
      .where('currentStock', '<', 10)
      .get();

    // Transform query results
    const lowStockProducts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Additional logging
    console.log('Low stock products query executed');
    console.log('Number of low stock products found:', lowStockProducts.length);

    // Check if products exist
    if (lowStockProducts.length === 0) {
      return res.status(200).json({
        message: 'No low stock products found',
        products: []
      });
    }

    // Successful response
    res.status(200).json({
      message: 'Low stock products retrieved successfully',
      products: lowStockProducts
    });
  } catch (error) {
    // Comprehensive error logging
    console.error('Error in getLowStockProducts_BE:', error);

    // Generic error response
    res.status(500).json({
      message: 'Error fetching low stock products',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

const checkAndNotifyLowStock = async () => {
  try {
    const inventoryRef = admin.firestore().collection('inventory');
    const snapshot = await inventoryRef
      .where('currentStock', '<', 10)
      .get();

    const lowStockProducts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (lowStockProducts.length > 0) {
      // Send notifications for each low stock product
      for (const product of lowStockProducts) {
        await sendStockNotification({
          productId: product.id,
          productName: product.productName,
          currentStock: product.currentStock,
          reorderPoint: product.reorderPoint
        });
      }
    }

    return lowStockProducts;
  } catch (error) {
    console.error('Stock Notification Check Error:', error);
    return [];
  }
};

// Notification method
const sendStockNotification = async (productDetails) => {
  try {
    const notificationsRef = admin.firestore().collection('notifications');

    await notificationsRef.add({
      type: 'LOW_STOCK',
      message: `Low stock alert for ${productDetails.productName}. Current stock: ${productDetails.currentStock}`,
      productId: productDetails.productId,
      severity: 'high',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Optional: Send email or other notification methods
    console.log(`Low stock notification created for ${productDetails.productName}`);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Scheduled job to check low stock
const scheduleLowStockCheck = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily low stock check');
    await checkAndNotifyLowStock();
  });
};

// Update product stock
const updateProductStock_BE = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity, action } = req.body;

    const inventoryRef = admin.firestore().collection('inventory').doc(id);
    const doc = await inventoryRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productData = doc.data();
    let updatedStock;

    if (action === 'add') {
      updatedStock = (productData.currentStock || 0) + stockQuantity;
    } else if (action === 'subtract') {
      updatedStock = (productData.currentStock || 0) - stockQuantity;
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Update the document
    await inventoryRef.update({
      currentStock: updatedStock,
      lastStockUpdate: admin.firestore.FieldValue.serverTimestamp()
    });

    // Fetch and return the updated document
    const updatedDoc = await inventoryRef.get();
    const updatedProduct = { id: updatedDoc.id, ...updatedDoc.data() };

    if (updatedStock < 10) {
      await sendStockNotification({
        productId: id,
        productName: updatedProduct.productName,
        currentStock: updatedStock,
        reorderPoint: updatedProduct.reorderPoint
      });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      message: 'Error updating stock',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

const uploadImages_BE = async (files) => {
  if (!files || files.length === 0) {
    console.log("No images uploaded");
    return [];
  }
  const urls = [];

  for (const file of files) {
    const fileName = `inventory/${Date.now()}_${file.originalname}`;
    const fileUpload = storage.file(fileName);

    await fileUpload.save(file.buffer, { metadata: { contentType: file.mimetype } });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(fileName)}?alt=media`;
    urls.push(publicUrl);
  }

  return urls;
};

const deleteImages_BE = async (imageUrls) => {
  for (const url of imageUrls) {
    const filename = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
    await storage.file(filename).delete().catch((err) => console.error("Error deleting image:", err.message));
  }
};



// Get Inventory Value Summary
const getInventoryValue_BE = async (req, res) => {
  try {
    // Get all products with quantity and cost information
    const snapshot = await db.collection("inventory").get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate current inventory value
    const currentValue = products.reduce((total, product) => {
      const stockValue = (product.currentStock || 0) * (product.costPrice || 0);
      return total + stockValue;
    }, 0);

    // Get last month's date
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // Try to get last month's inventory snapshot from history collection (if exists)
    let previousValue = 0;
    let change = 0;

    try {
      const historySnapshot = await db.collection("inventory_history")
        .where("date", "<=", lastMonth)
        .orderBy("date", "desc")
        .limit(1)
        .get();

      if (!historySnapshot.empty) {
        previousValue = historySnapshot.docs[0].data().totalValue || 0;
        change = currentValue - previousValue;
      } else {
        // If no history exists, we'll create a record for comparison next month
        await saveCurrentInventorySnapshot(products, currentValue);
      }
    } catch (historyError) {
      console.error("Error getting inventory history:", historyError);
      // Still proceed with current value calculation
    }

    // Calculate percentage change
    const percentChange = previousValue > 0 ? (change / previousValue) * 100 : 0;

    // Return the inventory value data
    res.status(200).json({
      currentValue: parseFloat(currentValue.toFixed(2)),
      previousValue: parseFloat(previousValue.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      percentChange: parseFloat(percentChange.toFixed(2)),
      totalItems: products.reduce((sum, product) => sum + (product.currentStock || 0), 0),
      productCount: products.length
    });
  } catch (error) {
    console.error("Error calculating inventory value:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to save current inventory snapshot for future comparison
const saveCurrentInventorySnapshot = async (products, totalValue) => {
  try {
    // Check if we already have a snapshot for this month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const existingSnapshot = await db.collection("inventory_history")
      .where("date", ">=", startOfMonth)
      .where("date", "<=", endOfMonth)
      .get();

    if (!existingSnapshot.empty) {
      // We already have a snapshot this month, no need to create another
      return;
    }

    const totalItems = products.reduce((sum, product) => sum + (product.currentStock || 0), 0);

    await db.collection("inventory_history").add({
      date: new Date(),
      totalValue,
      totalItems,
      productCount: products.length
    });

    console.log("Saved inventory snapshot for:", new Date().toISOString().split('T')[0]);
  } catch (error) {
    console.error("Error saving inventory snapshot:", error);
  }
};


module.exports = { addProduct_BE, getAllProducts_BE, getProductById_BE, getLowStockProducts_BE, updateProduct_BE, updateProductStock_BE, deleteProduct_BE, getInventoryValue_BE };
