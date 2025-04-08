const { db } = require("../../config/firebase");
const admin = require('firebase-admin');
const {
  validateSalesRecord,
  prepareSalesRecord
} = require("../../models/salesSchema");

// Add New Sale
const addSale_BE = async (req, res) => {
  try {
    const saleData = prepareSalesRecord(req.body);

    const validation = validateSalesRecord(saleData);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors
      });
    }

    if (!saleData.transactionId) {
      saleData.transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    const saleRef = db.collection("sales").doc();
    saleData.id = saleRef.id;

    await saleRef.set(saleData);

    // Update minute-based aggregated data
    await updateMinuteAggregation(saleData);

    res.status(201).json({ message: "Sale recorded successfully!", id: saleRef.id, ...saleData });
  } catch (error) {
    console.error("Error adding sale:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get All Sales
const getAllSales_BE = async (req, res) => {
  try {
    const { startDate, endDate, location, category, limit = 100 } = req.query;
    let query = db.collection("sales");
    
    // Apply filters if they exist
    if (startDate && endDate) {
      const startTimestamp = new Date(startDate);
      const endTimestamp = new Date(endDate);
      query = query.where("saleDateTime", ">=", startTimestamp)
                   .where("saleDateTime", "<=", endTimestamp);
    } else if (startDate) {
      const startTimestamp = new Date(startDate);
      query = query.where("saleDateTime", ">=", startTimestamp);
    } else if (endDate) {
      const endTimestamp = new Date(endDate);
      query = query.where("saleDateTime", "<=", endTimestamp);
    }
    
    if (location) {
      query = query.where("storeLocation", "==", location);
    }
    
    if (category) {
      query = query.where("category", "==", category);
    }
    
    query = query.orderBy("saleDateTime", "desc").limit(parseInt(limit));
    
    const snapshot = await query.get();
    const sales = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get Sale by ID
const getSaleById_BE = async (req, res) => {
  try {
    const id = req.params.id;
    const saleRef = db.collection("sales").doc(id);
    const docSnapshot = await saleRef.get();

    if (!docSnapshot.exists) return res.status(404).json({ message: "Sale record not found" });

    res.json({ id: docSnapshot.id, ...docSnapshot.data() });
  } catch (error) {
    console.error("Error fetching sale:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Update Sale
const updateSale_BE = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the current sale data
    const saleDoc = await db.collection("sales").doc(id).get();

    if (!saleDoc.exists) {
      return res.status(404).json({ error: "Sale record not found" });
    }

    const existingSale = saleDoc.data();
    
    // Remove the old data from aggregations
    await removeFromMinuteAggregation(existingSale);
    
    const updateData = prepareSalesRecord({...existingSale, ...req.body});
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection("sales").doc(id).update(updateData);
    
    // Add the updated data to aggregations
    await updateMinuteAggregation(updateData);

    const updatedDoc = await db.collection("sales").doc(id).get();

    res.status(200).json({
      message: "Sale record updated successfully",
      sale: updatedDoc.data()
    });

  } catch (error) {
    console.error("Error updating sale:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Delete Sale
const deleteSale_BE = async (req, res) => {
  try {
    const id = req.params.id;
    const saleRef = db.collection("sales").doc(id);
    const docSnapshot = await saleRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Sale record not found" });
    }

    // Remove the data from aggregations
    await removeFromMinuteAggregation(docSnapshot.data());

    // Delete sale from Firestore
    await saleRef.delete();

    res.json({ message: "Sale record deleted successfully!" });
  } catch (error) {
    console.error("Error deleting sale:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//   Get Sales By Minute
const getSalesByMinute_BE = async (req, res) => {
  try {
    const { date, hour, minute } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required (YYYY-MM-DD)" });
    }
    
    let minuteKey;
    if (date && hour && minute) {
      minuteKey = `${date}-${hour}-${minute}`;
    } else {
      return res.status(400).json({ error: "Hour and minute parameters are required" });
    }
    
    const aggregationRef = db.collection("sales_by_minute").doc(minuteKey);
    const docSnapshot = await aggregationRef.get();
    
    if (!docSnapshot.exists) {
      return res.status(404).json({ 
        message: "No sales data found for the specified minute",
        minuteKey,
        sales: [] 
      });
    }
    
    res.json({
      minuteKey,
      ...docSnapshot.data()
    });
  } catch (error) {
    console.error("Error fetching minute sales:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//   Get Sales By Hour
const getSalesByHour_BE = async (req, res) => {
  try {
    const { date, hour } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required (YYYY-MM-DD)" });
    }
    
    let hourKey;
    if (date && hour) {
      hourKey = `${date}-${hour}`;
    } else {
      return res.status(400).json({ error: "Hour parameter is required" });
    }
    
    const aggregationRef = db.collection("sales_by_hour").doc(hourKey);
    const docSnapshot = await aggregationRef.get();
    
    if (!docSnapshot.exists) {
      return res.status(404).json({ 
        message: "No sales data found for the specified hour",
        hourKey,
        sales: [] 
      });
    }
    
    res.json({
      hourKey,
      ...docSnapshot.data()
    });
  } catch (error) {
    console.error("Error fetching hourly sales:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//   Get Sales By Date
const getSalesByDate_BE = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required (YYYY-MM-DD)" });
    }
    
    const dateKey = date;
    const aggregationRef = db.collection("sales_by_date").doc(dateKey);
    const docSnapshot = await aggregationRef.get();
    
    if (!docSnapshot.exists) {
      return res.status(404).json({ 
        message: "No sales data found for the specified date",
        dateKey,
        sales: [] 
      });
    }
    
    res.json({
      dateKey,
      ...docSnapshot.data()
    });
  } catch (error) {
    console.error("Error fetching daily sales:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//   Get Sales Summary
const getSalesSummary_BE = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Both startDate and endDate parameters are required" });
    }
    
    let collection;
    let keyPrefix;
    
    // Determine which collection to query based on grouping
    if (groupBy === 'minute') {
      collection = 'sales_by_minute';
      keyPrefix = '';
    } else if (groupBy === 'hour') {
      collection = 'sales_by_hour';
      keyPrefix = '';
    } else {
      collection = 'sales_by_date';
      keyPrefix = '';
    }
    
    // Generate all keys in the date range
    const startKey = startDate + (groupBy !== 'day' ? keyPrefix : '');
    const endKey = endDate + (groupBy !== 'day' ? 'Z' : ''); // Z to include all possible suffixes
    
    const snapshot = await db.collection(collection)
      .where(admin.firestore.FieldPath.documentId(), '>=', startKey)
      .where(admin.firestore.FieldPath.documentId(), '<=', endKey)
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({
        message: "No sales data found for the specified period",
        summary: {
          totalSales: 0,
          totalItems: 0,
          averageOrderValue: 0,
          data: []
        }
      });
    }
    
    const salesData = snapshot.docs.map(doc => ({
      key: doc.id,
      ...doc.data()
    }));
    
    // Calculate summary metrics
    const totalSales = salesData.reduce((sum, day) => sum + (day.totalAmount || 0), 0);
    const totalItems = salesData.reduce((sum, day) => sum + (day.totalQuantity || 0), 0);
    const totalTransactions = salesData.reduce((sum, day) => sum + (day.transactionCount || 0), 0);
    
    res.json({
      startDate,
      endDate,
      groupBy,
      summary: {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalItems,
        totalTransactions,
        averageOrderValue: totalTransactions > 0 ? parseFloat((totalSales / totalTransactions).toFixed(2)) : 0,
        data: salesData
      }
    });
  } catch (error) {
    console.error("Error fetching sales summary:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//   Get Product Sales Ranking
const getProductSalesRanking_BE = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Both startDate and endDate parameters are required" });
    }
    
    const startTimestamp = new Date(startDate);
    const endTimestamp = new Date(endDate);
    
    const snapshot = await db.collection("sales")
      .where("saleDateTime", ">=", startTimestamp)
      .where("saleDateTime", "<=", endTimestamp)
      .get();
    
    if (snapshot.empty) {
      return res.json({
        message: "No sales data found for the specified period",
        ranking: []
      });
    }
    
    // Group by product and calculate totals
    const productSales = {};
    
    snapshot.docs.forEach(doc => {
      const sale = doc.data();
      const productId = sale.productId;
      
      if (!productSales[productId]) {
        productSales[productId] = {
          productId,
          productName: sale.productName,
          category: sale.category,
          totalQuantity: 0,
          totalAmount: 0,
          transactionCount: 0
        };
      }
      
      productSales[productId].totalQuantity += (sale.quantity || 0);
      productSales[productId].totalAmount += (sale.totalAmount || 0);
      productSales[productId].transactionCount += 1;
    });
    
    // Convert to array and sort by total amount
    const ranking = Object.values(productSales)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, parseInt(limit));
    
    res.json({
      startDate,
      endDate,
      ranking
    });
  } catch (error) {
    console.error("Error fetching product sales ranking:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//   Bulk Import Sales
const bulkImportSales_BE = async (req, res) => {
  try {
    const { salesData } = req.body;
    
    if (!Array.isArray(salesData) || salesData.length === 0) {
      return res.status(400).json({ error: "Invalid sales data format. Expected non-empty array." });
    }
    
    const batch = db.batch();
    const validSales = [];
    const errors = [];
    
    for (let i = 0; i < salesData.length; i++) {
      const saleData = prepareSalesRecord(salesData[i]);
      
      const validation = validateSalesRecord(saleData);
      if (!validation.valid) {
        errors.push({
          index: i,
          data: salesData[i],
          errors: validation.errors
        });
        continue;
      }
      
      if (!saleData.transactionId) {
        saleData.transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i}`;
      }
      
      const saleRef = db.collection("sales").doc();
      saleData.id = saleRef.id;
      
      batch.set(saleRef, saleData);
      validSales.push(saleData);
    }
    
    if (validSales.length === 0) {
      return res.status(400).json({
        error: "No valid sales records found",
        errors
      });
    }
    
    await batch.commit();
    
    // Update aggregations for all valid sales
    for (const sale of validSales) {
      await updateMinuteAggregation(sale);
    }
    
    res.status(201).json({
      message: `Successfully imported ${validSales.length} sales records`,
      totalProcessed: salesData.length,
      successful: validSales.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error bulk importing sales:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ========== Helper Functions ==========

// Function to update minute-based aggregation
async function updateMinuteAggregation(saleData) {
  try {
    // Get the relevant keys
    const { minuteKey, hourKey, dateKey } = saleData;
    
    if (!minuteKey || !hourKey || !dateKey) {
      console.error("Missing time keys for aggregation");
      return;
    }
    
    // Update minute aggregation
    await updateAggregation("sales_by_minute", minuteKey, saleData);
    
    // Update hour aggregation
    await updateAggregation("sales_by_hour", hourKey, saleData);
    
    // Update date aggregation
    await updateAggregation("sales_by_date", dateKey, saleData);
  } catch (error) {
    console.error("Error updating minute aggregation:", error);
  }
}

// Function to remove from minute-based aggregation
async function removeFromMinuteAggregation(saleData) {
  try {
    // Get the relevant keys
    const { minuteKey, hourKey, dateKey } = saleData;
    
    if (!minuteKey || !hourKey || !dateKey) {
      console.error("Missing time keys for aggregation removal");
      return;
    }
    
    // Remove from minute aggregation
    await removeFromAggregation("sales_by_minute", minuteKey, saleData);
    
    // Remove from hour aggregation
    await removeFromAggregation("sales_by_hour", hourKey, saleData);
    
    // Remove from date aggregation
    await removeFromAggregation("sales_by_date", dateKey, saleData);
  } catch (error) {
    console.error("Error removing from minute aggregation:", error);
  }
}

// Generic function to update an aggregation document
async function updateAggregation(collection, docId, saleData) {
  const docRef = db.collection(collection).doc(docId);
  
  // Try to update the existing document
  try {
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      
      if (doc.exists) {
        // Update existing aggregation
        const currentData = doc.data();
        
        transaction.update(docRef, {
          totalAmount: admin.firestore.FieldValue.increment(saleData.totalAmount || 0),
          totalQuantity: admin.firestore.FieldValue.increment(saleData.quantity || 0),
          transactionCount: admin.firestore.FieldValue.increment(1),
          sales: admin.firestore.FieldValue.arrayUnion({
            id: saleData.id,
            productId: saleData.productId,
            productName: saleData.productName,
            quantity: saleData.quantity,
            unitPrice: saleData.unitPrice,
            totalAmount: saleData.totalAmount,
            storeLocation: saleData.storeLocation,
            saleDateTime: saleData.saleDateTime
          }),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // Create new aggregation document
        transaction.set(docRef, {
          totalAmount: saleData.totalAmount || 0,
          totalQuantity: saleData.quantity || 0,
          transactionCount: 1,
          sales: [{
            id: saleData.id,
            productId: saleData.productId,
            productName: saleData.productName,
            quantity: saleData.quantity,
            unitPrice: saleData.unitPrice,
            totalAmount: saleData.totalAmount,
            storeLocation: saleData.storeLocation,
            saleDateTime: saleData.saleDateTime
          }],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });
  } catch (error) {
    console.error(`Error updating ${collection} aggregation:`, error);
    throw error;
  }
}

// Generic function to remove from an aggregation document
async function removeFromAggregation(collection, docId, saleData) {
  const docRef = db.collection(collection).doc(docId);
  
  try {
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      
      if (doc.exists) {
        const currentData = doc.data();
        const sales = currentData.sales || [];
        
        // Find the sale in the array
        const saleIndex = sales.findIndex(sale => sale.id === saleData.id);
        
        if (saleIndex !== -1) {
          // Remove the sale from the array
          sales.splice(saleIndex, 1);
          
          // Update the aggregation
          transaction.update(docRef, {
            totalAmount: admin.firestore.FieldValue.increment(-(saleData.totalAmount || 0)),
            totalQuantity: admin.firestore.FieldValue.increment(-(saleData.quantity || 0)),
            transactionCount: admin.firestore.FieldValue.increment(-1),
            sales: sales,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // If there are no more sales, delete the document
          if (sales.length === 0) {
            transaction.delete(docRef);
          }
        }
      }
    });
  } catch (error) {
    console.error(`Error removing from ${collection} aggregation:`, error);
    throw error;
  }
}

module.exports = {
  addSale_BE,
  getAllSales_BE,
  getSaleById_BE,
  updateSale_BE,
  deleteSale_BE,
  getSalesByMinute_BE,
  getSalesByHour_BE,
  getSalesByDate_BE,
  getSalesSummary_BE,
  getProductSalesRanking_BE,
  bulkImportSales_BE
};