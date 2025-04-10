const { db } = require("../../config/firebase");
const admin = require('firebase-admin');
const {
  validateSalesItem,
  prepareSalesItem
} = require("../../models/salesSchema");

// Add a new sale
const addSale_BE = async (req, res) => {
  try {
    const saleData = prepareSalesItem(req.body);

    const validation = validateSalesItem(saleData);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors
      });
    }

    // Calculate total amount if not provided
    if (!saleData.totalAmount && saleData.unitPrice && saleData.quantity) {
      saleData.totalAmount = saleData.unitPrice * saleData.quantity;
    }

    // Step 1: Fetch the inventory item
    const inventoryRef = db.collection("inventory").doc(saleData.productId);
    const inventoryDoc = await inventoryRef.get();

    if (!inventoryDoc.exists) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    const inventoryData = inventoryDoc.data();

    // Step 2: Check if there is enough stock
    if (inventoryData.currentStock < saleData.quantity) {
      return res.status(400).json({
        error: "Insufficient stock",
        availableStock: inventoryData.currentStock,
      });
    }

    // Step 3: Deduct stock
    await inventoryRef.update({
      currentStock: inventoryData.currentStock - saleData.quantity
    });

    // Step 4: Save the sale
    const saleRef = db.collection("sales").doc();
    saleData.id = saleRef.id;

    await saleRef.set(saleData);

    // Also add to time-based collections for aggregation
    if (saleData.dateKey) {
      const dateRef = db.collection("sales_by_date").doc(saleData.dateKey);
      await updateAggregation(dateRef, saleData);
    }

    if (saleData.hourKey) {
      const hourRef = db.collection("sales_by_hour").doc(saleData.hourKey);
      await updateAggregation(hourRef, saleData);
    }

    if (saleData.minuteKey) {
      const minuteRef = db.collection("sales_by_minute").doc(saleData.minuteKey);
      await updateAggregation(minuteRef, saleData);
    }

    res.status(201).json({
      message: "Sale recorded and inventory updated successfully!",
      id: saleRef.id,
      ...saleData
    });

  } catch (error) {
    console.error("Error adding sale:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// Helper function to update aggregation documents
const updateAggregation = async (docRef, saleData) => {
  const docSnapshot = await docRef.get();

  if (!docSnapshot.exists) {
    // Create a new aggregation document
    await docRef.set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      totalAmount: saleData.totalAmount || 0,
      totalQuantity: saleData.quantity || 1,
      transactionCount: 1,
      sales: [
        {
          id: saleData.id,
          productId: saleData.productId,
          productName: saleData.productName,
          quantity: saleData.quantity,
          totalAmount: saleData.totalAmount,
          unitPrice: saleData.unitPrice,
          storeLocation: saleData.storeLocation,
          saleDatetime: saleData.saleDatetime
        }
      ]
    });
  } else {
    // Update existing aggregation document
    const data = docSnapshot.data();
    const sales = data.sales || [];

    // Add the new sale to the sales array
    sales.push({
      id: saleData.id,
      productId: saleData.productId,
      productName: saleData.productName,
      quantity: saleData.quantity,
      totalAmount: saleData.totalAmount,
      unitPrice: saleData.unitPrice,
      storeLocation: saleData.storeLocation,
      saleDatetime: saleData.saleDatetime
    });

    // Update the aggregation data
    await docRef.update({
      totalAmount: admin.firestore.FieldValue.increment(saleData.totalAmount || 0),
      totalQuantity: admin.firestore.FieldValue.increment(saleData.quantity || 1),
      transactionCount: admin.firestore.FieldValue.increment(1),
      sales: sales,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
};

// Get all sales with optional filtering
const getAllSales_BE = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      storeLocation,
      category,
      limit = 100,
      offset = 0
    } = req.query;

    let query = db.collection("sales");

    // Apply filters
    if (startDate && endDate) {
      query = query.where("dateKey", ">=", startDate)
        .where("dateKey", "<=", endDate);
    } else if (startDate) {
      query = query.where("dateKey", ">=", startDate);
    } else if (endDate) {
      query = query.where("dateKey", "<=", endDate);
    }

    if (storeLocation) {
      query = query.where("storeLocation", "==", storeLocation);
    }

    if (category) {
      query = query.where("category", "==", category);
    }

    // Add ordering
    query = query.orderBy("dateKey", "desc");

    // Pagination
    const limitNumber = parseInt(limit);
    const offsetNumber = parseInt(offset);

    if (!isNaN(offsetNumber) && offsetNumber > 0) {
      const snapshot = await query.limit(offsetNumber).get();
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }

    if (!isNaN(limitNumber) && limitNumber > 0) {
      query = query.limit(limitNumber);
    }

    const snapshot = await query.get();
    const sales = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Calculate totals
    const totalAmount = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);

    res.json({
      sales,
      meta: {
        totalRecords: sales.length,
        totalAmount,
        totalQuantity
      }
    });
  } catch (error) {
    console.error("Error fetching sales:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// Get sales by date
const getSalesByDate_BE = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = db.collection("sales_by_date");

    if (startDate && endDate) {
      query = query.where(admin.firestore.FieldPath.documentId(), ">=", startDate)
        .where(admin.firestore.FieldPath.documentId(), "<=", endDate);
    } else if (startDate) {
      query = query.where(admin.firestore.FieldPath.documentId(), ">=", startDate);
    } else if (endDate) {
      query = query.where(admin.firestore.FieldPath.documentId(), "<=", endDate);
    }

    query = query.orderBy(admin.firestore.FieldPath.documentId(), "desc");

    const snapshot = await query.get();
    const salesByDate = snapshot.docs.map((doc) => ({
      date: doc.id,
      totalAmount: doc.data().totalAmount || 0,
      totalQuantity: doc.data().totalQuantity || 0,
      transactionCount: doc.data().transactionCount || 0
    }));

    res.json(salesByDate);
  } catch (error) {
    console.error("Error fetching sales by date:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get sales for a specific date
const getSalesForDate_BE = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const docRef = db.collection("sales_by_date").doc(date);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return res.json({
        date,
        totalAmount: 0,
        totalQuantity: 0,
        transactionCount: 0,
        sales: []
      });
    }

    const data = docSnapshot.data();

    res.json({
      date,
      totalAmount: data.totalAmount || 0,
      totalQuantity: data.totalQuantity || 0,
      transactionCount: data.transactionCount || 0,
      sales: data.sales || []
    });
  } catch (error) {
    console.error("Error fetching sales for date:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get hourly sales for a specific date
const getHourlySalesForDate_BE = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const query = db.collection("sales_by_hour")
      .where(admin.firestore.FieldPath.documentId(), ">=", `${date}-10`)
      .where(admin.firestore.FieldPath.documentId(), "<=", `${date}-23`)
      .orderBy(admin.firestore.FieldPath.documentId());

    const snapshot = await query.get();
    const hourlySales = snapshot.docs.map((doc) => {
      const hour = doc.id.split('-').pop();
      return {
        hour,
        hourKey: doc.id,
        totalAmount: doc.data().totalAmount || 0,
        totalQuantity: doc.data().totalQuantity || 0,
        transactionCount: doc.data().transactionCount || 0
      };
    });

    // Fill in missing hours with zero values
    const completeHourlySales = [];
    for (let i = 10; i < 22; i++) {
      const hour = i.toString().padStart(2, '0');
      const hourKey = `${date}-${hour}`;
      const existingData = hourlySales.find(item => item.hourKey === hourKey);

      if (existingData) {
        completeHourlySales.push(existingData);
      } else {
        completeHourlySales.push({
          hour,
          hourKey,
          totalAmount: 0,
          totalQuantity: 0,
          transactionCount: 0
        });
      }
    }

    res.json({ Sales_Dated_For: date, completeHourlySales });
  } catch (error) {
    console.error("Error fetching hourly sales:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get sales for a specific hour
const getSalesForHour_BE = async (req, res) => {
  try {
    const { hourKey } = req.params;

    if (!hourKey) {
      return res.status(400).json({ error: "Hour key parameter is required" });
    }

    const docRef = db.collection("sales_by_hour").doc(hourKey);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return res.json({
        hourKey,
        totalAmount: 0,
        totalQuantity: 0,
        transactionCount: 0,
        sales: []
      });
    }

    const data = docSnapshot.data();

    res.json({
      hourKey,
      totalAmount: data.totalAmount || 0,
      totalQuantity: data.totalQuantity || 0,
      transactionCount: data.transactionCount || 0,
      sales: data.sales || []
    });
  } catch (error) {
    console.error("Error fetching sales for hour:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get sales data for dashboard
const getSalesDashboardData_BE = async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date(2025, 2, 3);
    const todayStr = today.toISOString().split('T')[0];

    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get last 30 days start date
    const last30DaysStart = new Date(today);
    last30DaysStart.setDate(last30DaysStart.getDate() - 30);
    const last30DaysStartStr = last30DaysStart.toISOString().split('T')[0];

    // Get today's data
    const todayDocRef = db.collection("sales_by_date").doc(todayStr);
    const todayDoc = await todayDocRef.get();
    const todaySales = todayDoc.exists ? todayDoc.data() : { totalAmount: 0, totalQuantity: 0, transactionCount: 0 };

    // Get yesterday's data
    const yesterdayDocRef = db.collection("sales_by_date").doc(yesterdayStr);
    const yesterdayDoc = await yesterdayDocRef.get();
    const yesterdaySales = yesterdayDoc.exists ? yesterdayDoc.data() : { totalAmount: 0, totalQuantity: 0, transactionCount: 0 };

    // Get data for last 30 days
    const last30DaysQuery = db.collection("sales_by_date")
      .where(admin.firestore.FieldPath.documentId(), ">=", last30DaysStartStr)
      .where(admin.firestore.FieldPath.documentId(), "<=", todayStr)
      .orderBy(admin.firestore.FieldPath.documentId());

    const last30DaysSnapshot = await last30DaysQuery.get();
    const last30DaysData = last30DaysSnapshot.docs.map(doc => ({
      date: doc.id,
      totalAmount: doc.data().totalAmount || 0,
      totalQuantity: doc.data().totalQuantity || 0,
      transactionCount: doc.data().transactionCount || 0
    }));

    const last30DaysTotal = last30DaysData.reduce((sum, day) => sum + day.totalAmount, 0);
    const last30DaysTransactions = last30DaysData.reduce((sum, day) => sum + day.transactionCount, 0);

    const recentSalesQuery = db.collection("sales")
      .orderBy("saleDatetime", "desc")
      .limit(10);

    const recentSalesSnapshot = await recentSalesQuery.get();
    const recentSales = recentSalesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const productSalesQuery = db.collection("sales")
      .where("saleDatetime", ">=", last30DaysStart);

    const productSalesSnapshot = await productSalesQuery.get();
    const productSalesData = productSalesSnapshot.docs.map(doc => ({
      productId: doc.data().productId,
      productName: doc.data().productName,
      amount: doc.data().totalAmount || 0,
      quantity: doc.data().quantity || 0
    }));

    const productSales = {};
    productSalesData.forEach(sale => {
      if (!productSales[sale.productId]) {
        productSales[sale.productId] = {
          productId: sale.productId,
          productName: sale.productName,
          totalAmount: 0,
          totalQuantity: 0,
          count: 0
        };
      }

      productSales[sale.productId].totalAmount += sale.amount;
      productSales[sale.productId].totalQuantity += sale.quantity;
      productSales[sale.productId].count += 1;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    res.json({
      today: {
        date: todayStr,
        totalAmount: todaySales.totalAmount || 0,
        totalQuantity: todaySales.totalQuantity || 0,
        transactionCount: todaySales.transactionCount || 0,
        percentChange: yesterdaySales.totalAmount > 0
          ? ((todaySales.totalAmount - yesterdaySales.totalAmount) / yesterdaySales.totalAmount) * 100
          : 0
      },
      last30Days: {
        totalAmount: last30DaysTotal,
        totalTransactions: last30DaysTransactions,
        dailySales: last30DaysData
      },
      recentSales,
      topProducts
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get sales target data
const getSalesTargets_BE = async (req, res) => {
  try {
    const { year, month, day } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: "Please provide year and month. Day is optional." });
    }

    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);
    const parsedDay = day ? parseInt(day) : null;

    const targetsRef = db.collection("sales_targets");
    const targetsSnapshot = await targetsRef.get();

    const allTargets = [];
    const summary = {};

    for (const doc of targetsSnapshot.docs) {
      const data = doc.data();
      const { targetType, period, amount } = data;

      const periodParts = period.split("-");
      const targetYear = parseInt(periodParts[0]);
      const targetMonth = parseInt(periodParts[1]);
      const targetDay = targetType === "daily" ? parseInt(periodParts[2]) : null;

      let include = false;

      if (targetType === "monthly" && targetYear === parsedYear && targetMonth === parsedMonth) {
        include = true;
      }

      if (
        targetType === "daily" &&
        targetYear === parsedYear &&
        targetMonth === parsedMonth &&
        (!parsedDay || targetDay === parsedDay)
      ) {
        include = true;
      }

      if (!include) continue;

      let achieved = 0;

      if (targetType === "daily") {
        const formattedDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
        const salesDoc = await db.collection("sales_by_date").doc(formattedDate).get();
        achieved = salesDoc.exists ? (salesDoc.data().totalAmount || 0) : 0;
      }

      if (targetType === "monthly") {
        const startDate = `${parsedYear}-${String(parsedMonth).padStart(2, "0")}-01`;
        const nextMonth = parsedMonth === 12 ? 1 : parsedMonth + 1;
        const nextYear = parsedMonth === 12 ? parsedYear + 1 : parsedYear;
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

        const salesSnapshot = await db.collection("sales_by_date")
          .where(admin.firestore.FieldPath.documentId(), ">=", startDate)
          .where(admin.firestore.FieldPath.documentId(), "<", endDate)
          .get();

        achieved = salesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
      }

      summary[`${targetType}-${period}`] = {
        period,
        type: targetType,
        target: amount,
        achieved,
        percentage: (achieved / amount) * 100
      };

      allTargets.push({ id: doc.id, ...data });
    }

    res.json({ summary, allTargets });
  } catch (error) {
    console.error("Error fetching sales targets:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getSalesTargetsByRange_BE = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide both startDate and endDate in YYYY-MM-DD format." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ error: "startDate cannot be after endDate." });
    }

    const targetsRef = db.collection("sales_targets");
    const targetsSnapshot = await targetsRef.get();

    const allTargets = [];
    const summary = {};

    for (const doc of targetsSnapshot.docs) {
      const data = doc.data();
      const { targetType, period, amount } = data;

      let include = false;
      let achieved = 0;

      if (targetType === "daily") {
        const [yyyy, mm, dd] = period.split("-").map(Number);
        const periodDate = new Date(`${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`);
        if (periodDate >= start && periodDate <= end) {
          include = true;

          const docId = `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
          const salesDoc = await db.collection("sales_by_date").doc(docId).get();
          achieved = salesDoc.exists ? (salesDoc.data().totalAmount || 0) : 0;
        }
      }

      if (targetType === "monthly") {
        const [yyyy, mm] = period.split("-").map(Number);
        const monthStart = new Date(`${yyyy}-${String(mm).padStart(2, '0')}-01`);
        const nextMonth = mm === 12 ? 1 : mm + 1;
        const nextYear = mm === 12 ? yyyy + 1 : yyyy;
        const monthEnd = new Date(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01`);

        // Include if month overlaps with range
        if (monthStart <= end && monthEnd >= start) {
          include = true;

          const startDateStr = `${yyyy}-${String(mm).padStart(2, "0")}-01`;
          const endDateStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

          const salesSnapshot = await db.collection("sales_by_date")
            .where(admin.firestore.FieldPath.documentId(), ">=", startDateStr)
            .where(admin.firestore.FieldPath.documentId(), "<", endDateStr)
            .get();

          achieved = salesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
        }
      }

      if (!include) continue;

      summary[`${targetType}-${period}`] = {
        period,
        type: targetType,
        target: amount,
        achieved,
        percentage: (achieved / amount) * 100
      };

      allTargets.push({ id: doc.id, ...data });
    }

    res.json({ summary, allTargets });
  } catch (error) {
    console.error("Error fetching range-based sales targets:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// Create or update a sales target
const updateSalesTarget_BE = async (req, res) => {
  try {
    const { targetType, period, amount, description } = req.body;

    if (!targetType || !period || !amount) {
      return res.status(400).json({ error: "targetType, period, and amount are required" });
    }

    // Validate target type
    if (!['daily', 'monthly', 'quarterly', 'yearly'].includes(targetType)) {
      return res.status(400).json({ error: "targetType must be one of: daily, monthly, quarterly, yearly" });
    }

    // Create target ID based on type and period
    const targetId = `${targetType}-${period}`;

    // Create or update the target
    await db.collection("sales_targets").doc(targetId).set({
      targetType,
      period,
      amount: parseFloat(amount),
      description: description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.status(200).json({ message: "Sales target updated successfully", id: targetId });
  } catch (error) {
    console.error("Error updating sales target:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addSale_BE,
  getAllSales_BE,
  getSalesByDate_BE,
  getSalesForDate_BE,
  getHourlySalesForDate_BE,
  getSalesForHour_BE,
  getSalesDashboardData_BE,
  getSalesTargets_BE,
  getSalesTargetsByRange_BE,
  updateSalesTarget_BE
};