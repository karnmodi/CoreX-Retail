const { db } = require("../../config/firebase");
const admin = require('firebase-admin');
const {
  validateSalesItem,
  prepareSalesItem
} = require("../../models/salesSchema");
const axios = require('axios');
const { createPredictionDoc } = require('../../models/predictedSalesSchema');
const ML_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5000";


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

    if (!saleData.totalAmount && saleData.unitPrice && saleData.quantity) {
      saleData.totalAmount = saleData.unitPrice * saleData.quantity;
    }

    const inventoryRef = db.collection("inventory").doc(saleData.productId);
    const inventoryDoc = await inventoryRef.get();

    if (!inventoryDoc.exists) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    const inventoryData = inventoryDoc.data();

    if (inventoryData.currentStock < saleData.quantity) {
      return res.status(400).json({
        error: "Insufficient stock",
        availableStock: inventoryData.currentStock,
      });
    }

    await inventoryRef.update({
      currentStock: inventoryData.currentStock - saleData.quantity
    });

    const saleRef = db.collection("sales").doc();
    saleData.id = saleRef.id;

    await saleRef.set(saleData);

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

    try {
      const saleDate = new Date(saleData.saleDatetime);
      const currentHour = saleDate.getUTCHours();
      const currentDate = saleData.dateKey;

      console.log(`Processing sale at hour: ${currentHour} for date: ${currentDate}`);

      // Calculate day of week (0-6, monday is 0, sunday is 6)
      const dayOfWeek = (saleDate.getUTCDay() + 6) % 7;

      const isWeekend = dayOfWeek >= 5 ? 1 : 0;

      const month = saleDate.getMonth() + 1;

      const dateRef = db.collection("sales_by_date").doc(saleData.dateKey);
      const dateDoc = await dateRef.get();
      let cumulativeSales = 0;

      if (dateDoc.exists) {
        const dateData = dateDoc.data();
        cumulativeSales = dateData.totalAmount || 0;
      }

      console.log(`Cumulative sales for ${currentDate}: ${cumulativeSales}`);

      const hourString = currentHour.toString().padStart(2, '0');
      const currentHourKey = `${currentDate}-${hourString}`;

      const hourlyPredictionRef = db.collection("predicted_sales_hourly").doc(currentHourKey);
      const hourlyPredictionDoc = await hourlyPredictionRef.get();

      if (!hourlyPredictionDoc.exists) {
        const features = [
          currentHour,
          cumulativeSales,
          dayOfWeek,
          isWeekend,
          month
        ];

        console.log(`Making prediction with features:`, features);

        const response = await axios.post(`${ML_URL}/predict`, {
  features: features
});

        const predictedSales = response.data.prediction[0];
        console.log(`Prediction result: ${predictedSales}`);

        const hourlyPredictionData = {
          dateKey: currentDate,
          hourKey: currentHourKey,
          hour: currentHour,
          cumulativeSales: cumulativeSales,
          predictedSales: predictedSales,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await hourlyPredictionRef.set(hourlyPredictionData);
        console.log(`Saved hourly prediction for ${currentHourKey}`);

        const dailyPredictionRef = db.collection("predicted_sales").doc(currentDate);
        await dailyPredictionRef.set({
          dateKey: currentDate,
          hourKey: currentHourKey,
          cumulativeSales: cumulativeSales,
          predictedSales: predictedSales,
          actualSalesEndOfDay: null,
          accuracy: null,
          createdAt: hourlyPredictionData.createdAt,
          updatedAt: hourlyPredictionData.updatedAt
        }, { merge: true });
        console.log(`Updated daily prediction for ${currentDate}`);
      }

      if (currentHour >= 21) {
        console.log(`Sale time ${currentHour}:00 is after business hours. Processing EOD...`);

        const hourlyPredictions = await db.collection("predicted_sales_hourly")
          .where("dateKey", "==", currentDate)
          .orderBy("hour", "desc")
          .limit(1)
          .get();

        let finalPrediction = null;

        if (!hourlyPredictions.empty) {
          finalPrediction = hourlyPredictions.docs[0].data();
          console.log(`Final prediction for EOD: ${finalPrediction.predictedSales}`);
        } else {
          console.log(`No hourly predictions found for ${currentDate}`);

          const mainPredictionRef = db.collection("predicted_sales").doc(currentDate);
          const mainPredictionDoc = await mainPredictionRef.get();

          if (mainPredictionDoc.exists) {
            finalPrediction = mainPredictionDoc.data();
            console.log(`Using main prediction document: ${finalPrediction.predictedSales}`);
          }
        }

        let accuracyValue = null;

        if (finalPrediction && finalPrediction.predictedSales && cumulativeSales > 0) {
          const predictedValue = parseFloat(finalPrediction.predictedSales);
          const actualValue = parseFloat(cumulativeSales);

          const absoluteError = Math.abs(predictedValue - actualValue);

          const largerValue = Math.max(predictedValue, actualValue);
          const scaledError = (absoluteError / largerValue) * 100;

          accuracyValue = Math.max(0, Math.min(100, 100 - scaledError));

          console.log(`Predicted: ${predictedValue}, Actual: ${actualValue}`);
          console.log(`Absolute error: ${absoluteError}, Scaled error: ${scaledError.toFixed(2)}%`);
          console.log(`Adjusted accuracy: ${accuracyValue.toFixed(2)}%`);
        } else {
          console.log(`Cannot calculate accuracy - missing predicted or actual values`);
        }

        const eodRef = db.collection("predicted_sales_eod").doc(currentDate);

        const eodData = {
          dateKey: currentDate,
          actualSalesEndOfDay: cumulativeSales,
          predictedSales: finalPrediction ? finalPrediction.predictedSales : null,
          accuracy: accuracyValue,
          processedAt: new Date(),
          updatedAt: new Date()
        };

        // Save EOD data
        await eodRef.set(eodData);
        console.log(`Saved EOD data to predicted_sales_eod/${currentDate}`);

        // Update main prediction document
        const dailyPredictionRef = db.collection("predicted_sales").doc(currentDate);
        await dailyPredictionRef.update({
          actualSalesEndOfDay: cumulativeSales,
          accuracy: accuracyValue,
          updatedAt: new Date()
        });
        console.log(`Updated main prediction document with EOD data`);

        const allHourlyPredictions = await db.collection("predicted_sales_hourly")
          .where("dateKey", "==", currentDate)
          .get();

        if (!allHourlyPredictions.empty) {
          const hourlyUpdates = allHourlyPredictions.docs.map(async (doc) => {
            const predData = doc.data();
            const predDocRef = db.collection("predicted_sales_hourly").doc(doc.id);

            let hourlyAccuracy = null;
            if (cumulativeSales > 0 && predData.predictedSales) {
              const predValue = parseFloat(predData.predictedSales);
              const actValue = parseFloat(cumulativeSales);

              const absError = Math.abs(predValue - actValue);
              const largerVal = Math.max(predValue, actValue);
              const scaledErr = (absError / largerVal) * 100;
              hourlyAccuracy = Math.max(0, Math.min(100, 100 - scaledErr));
            }

            return predDocRef.update({
              actualSalesEndOfDay: cumulativeSales,
              accuracy: hourlyAccuracy
            });
          });

          await Promise.all(hourlyUpdates);
          console.log(`Updated all ${allHourlyPredictions.size} hourly predictions with accuracy values`);
        }
      }
    } catch (predictionError) {
      console.error("Error in sales prediction process:", predictionError);
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

const getSalesByDate_Daily = async (req, res) => {
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
    console.error("Error fetching daily sales data:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Function to get monthly sales data 
const getSalesByDate_Monthly = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate input dates
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Both startDate and endDate are required for monthly data" });
    }

    // Query the daily sales data
    let query = db.collection("sales_by_date")
      .where(admin.firestore.FieldPath.documentId(), ">=", startDate)
      .where(admin.firestore.FieldPath.documentId(), "<=", endDate)
      .orderBy(admin.firestore.FieldPath.documentId());

    const snapshot = await query.get();

    // Process the data to group by month
    const monthlySales = {};

    snapshot.docs.forEach((doc) => {
      const date = doc.id; // Format: YYYY-MM-DD
      const yearMonth = date.substring(0, 7); // Extract YYYY-MM

      // Initialize the month if not exists
      if (!monthlySales[yearMonth]) {
        monthlySales[yearMonth] = {
          month: yearMonth,
          totalAmount: 0,
          totalQuantity: 0,
          transactionCount: 0
        };
      }

      // Add the daily values to the monthly totals
      const data = doc.data();
      monthlySales[yearMonth].totalAmount += data.totalAmount || 0;
      monthlySales[yearMonth].totalQuantity += data.totalQuantity || 0;
      monthlySales[yearMonth].transactionCount += data.transactionCount || 0;
    });

    // Convert to array and sort by month
    const result = Object.values(monthlySales).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching monthly sales data:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get sales for a specific date // prediction included
const getSalesForDate_BE = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Get sales data
    const docRef = db.collection("sales_by_date").doc(date);
    const docSnapshot = await docRef.get();

    const salesData = !docSnapshot.exists ? {
      date,
      totalAmount: 0,
      totalQuantity: 0,
      transactionCount: 0,
      sales: []
    } : {
      date,
      totalAmount: docSnapshot.data().totalAmount || 0,
      totalQuantity: docSnapshot.data().totalQuantity || 0,
      transactionCount: docSnapshot.data().transactionCount || 0,
      sales: docSnapshot.data().sales || []
    };

    // Get prediction data
    const predictionRef = db.collection("predicted_sales").doc(date);
    const predictionDoc = await predictionRef.get();

    // Get EOD prediction if available
    const eodRef = db.collection("predicted_sales_eod").doc(date);
    const eodDoc = await eodRef.get();

    // Add prediction data to response
    salesData.prediction = predictionDoc.exists ? {
      cumulativeSales: predictionDoc.data().cumulativeSales || 0,
      predictedSales: predictionDoc.data().predictedSales || 0,
      hourKey: predictionDoc.data().hourKey || null,
      updatedAt: predictionDoc.data().updatedAt || null,
      actualSalesEndOfDay: predictionDoc.data().actualSalesEndOfDay || null,
      accuracy: predictionDoc.data().accuracy || null
    } : null;

    salesData.endOfDayPrediction = eodDoc.exists ? {
      actualSalesEndOfDay: eodDoc.data().actualSalesEndOfDay || 0,
      predictedSales: eodDoc.data().predictedSales || 0,
      accuracy: eodDoc.data().accuracy || null,
      processedAt: eodDoc.data().processedAt || null
    } : null;

    res.json(salesData);
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

    // Get hourly sales data
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

    // Get hourly predictions
    const hourlyPredictionsQuery = db.collection("predicted_sales_hourly")
      .where("dateKey", "==", date)
      .orderBy("hour", "asc");

    const hourlyPredictionsSnapshot = await hourlyPredictionsQuery.get();
    const hourlyPredictions = {};

    hourlyPredictionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      hourlyPredictions[data.hour] = {
        predictedSales: data.predictedSales,
        cumulativeSales: data.cumulativeSales,
        accuracy: data.accuracy,
        actualSalesEndOfDay: data.actualSalesEndOfDay
      };
    });

    // Fill in missing hours with zero values and add prediction data
    const completeHourlySales = [];
    for (let i = 10; i < 22; i++) {
      const hour = i.toString().padStart(2, '0');
      const hourKey = `${date}-${hour}`;
      const existingData = hourlySales.find(item => item.hourKey === hourKey);
      const predictionData = hourlyPredictions[i] || null;

      if (existingData) {
        completeHourlySales.push({
          ...existingData,
          prediction: predictionData
        });
      } else {
        completeHourlySales.push({
          hour,
          hourKey,
          totalAmount: 0,
          totalQuantity: 0,
          transactionCount: 0,
          prediction: predictionData
        });
      }
    }

    // Get main prediction document
    const predictionRef = db.collection("predicted_sales").doc(date);
    const predictionDoc = await predictionRef.get();

    // Get EOD prediction
    const eodRef = db.collection("predicted_sales_eod").doc(date);
    const eodDoc = await eodRef.get();

    res.json({
      Sales_Dated_For: date,
      completeHourlySales,
      currentPrediction: predictionDoc.exists ? {
        cumulativeSales: predictionDoc.data().cumulativeSales || 0,
        predictedSales: predictionDoc.data().predictedSales || 0,
        hourKey: predictionDoc.data().hourKey || null,
        updatedAt: predictionDoc.data().updatedAt || null,
        actualSalesEndOfDay: predictionDoc.data().actualSalesEndOfDay || null,
        accuracy: predictionDoc.data().accuracy || null
      } : null,
      endOfDayPrediction: eodDoc.exists ? {
        actualSalesEndOfDay: eodDoc.data().actualSalesEndOfDay || 0,
        predictedSales: eodDoc.data().predictedSales || 0,
        accuracy: eodDoc.data().accuracy || null,
        processedAt: eodDoc.data().processedAt || null
      } : null
    });
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

// Optimized sales dashboard data controller
const getSalesDashboardData_BE = async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get last 30 days start date
    const last30DaysStart = new Date(today);
    last30DaysStart.setDate(last30DaysStart.getDate() - 30);
    const last30DaysStartStr = last30DaysStart.toISOString().split('T')[0];

    // Run all the main queries in parallel to save time
    const [
      todayDoc,
      todayPredictionDoc,
      yesterdayDoc,
      yesterdayEODDoc,
      last30DaysSnapshot,
      eodSnapshot
    ] = await Promise.all([
      // Get today's data
      db.collection("sales_by_date").doc(todayStr).get(),

      // Get today's prediction
      db.collection("predicted_sales").doc(todayStr).get(),

      // Get yesterday's data
      db.collection("sales_by_date").doc(yesterdayStr).get(),

      // Get yesterday's prediction accuracy
      db.collection("predicted_sales_eod").doc(yesterdayStr).get(),

      // Get data for last 30 days
      db.collection("sales_by_date")
        .where(admin.firestore.FieldPath.documentId(), ">=", last30DaysStartStr)
        .where(admin.firestore.FieldPath.documentId(), "<=", todayStr)
        .orderBy(admin.firestore.FieldPath.documentId())
        .get(),

      // Get predictions for last 30 days
      db.collection("predicted_sales_eod")
        .where("dateKey", ">=", last30DaysStartStr)
        .where("dateKey", "<=", todayStr)
        .get()
    ]);

    // Process the results
    const todaySales = todayDoc.exists ? todayDoc.data() : { totalAmount: 0, totalQuantity: 0, transactionCount: 0 };
    const todayPrediction = todayPredictionDoc.exists ? todayPredictionDoc.data() : null;
    const yesterdaySales = yesterdayDoc.exists ? yesterdayDoc.data() : { totalAmount: 0, totalQuantity: 0, transactionCount: 0 };
    const yesterdayPrediction = yesterdayEODDoc.exists ? yesterdayEODDoc.data() : null;

    // Process EOD predictions
    const eodPredictions = {};
    eodSnapshot.forEach(doc => {
      eodPredictions[doc.id] = doc.data();
    });

    // Process last 30 days data
    const last30DaysData = [];
    let last30DaysTotal = 0;
    let last30DaysTransactions = 0;

    // Combine sales data with predictions
    for (const doc of last30DaysSnapshot.docs) {
      const date = doc.id;
      const docData = doc.data();
      const totalAmount = docData.totalAmount || 0;
      const transactionCount = docData.transactionCount || 0;

      // Add to totals
      last30DaysTotal += totalAmount;
      last30DaysTransactions += transactionCount;

      const sales = {
        date,
        totalAmount,
        totalQuantity: docData.totalQuantity || 0,
        transactionCount
      };

      // Add prediction if available
      if (eodPredictions[date]) {
        sales.prediction = {
          predictedSales: eodPredictions[date].predictedSales || 0,
          accuracy: eodPredictions[date].accuracy || null
        };
      }

      last30DaysData.push(sales);
    }

    // For recent sales and top products, we'll limit data to improve performance
    // Get only 5 recent sales instead of 10
    const recentSalesQuery = await db.collection("sales")
      .orderBy("saleDatetime", "desc")
      .limit(5)
      .get();

    const recentSales = recentSalesQuery.docs.map(doc => ({
      id: doc.id,
      productId: doc.data().productId,
      productName: doc.data().productName,
      totalAmount: doc.data().totalAmount,
      quantity: doc.data().quantity,
      saleDatetime: doc.data().saleDatetime,
      storeLocation: doc.data().storeLocation
    }));

    let topProducts = [];

    try {
      const topProductsSnapshot = await db.collection("top_products")
        .orderBy("totalAmount", "desc")
        .limit(5)
        .get();

      if (!topProductsSnapshot.empty) {
        topProducts = topProductsSnapshot.docs.map(doc => doc.data());
      } else {
        const last7DaysStart = new Date(today);
        last7DaysStart.setDate(last7DaysStart.getDate() - 7);

        const productSalesSnapshot = await db.collection("sales")
          .where("saleDatetime", ">=", last7DaysStart)
          .limit(100)
          .get();

        const productSales = {};
        productSalesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const productId = data.productId;

          if (!productSales[productId]) {
            productSales[productId] = {
              productId,
              productName: data.productName,
              totalAmount: 0,
              totalQuantity: 0,
              count: 0
            };
          }

          productSales[productId].totalAmount += data.totalAmount || 0;
          productSales[productId].totalQuantity += data.quantity || 0;
          productSales[productId].count += 1;
        });

        topProducts = Object.values(productSales)
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 5);
      }
    } catch (topProductsError) {
      console.error("Error fetching top products:", topProductsError);
      // In case of error, just return an empty array
      topProducts = [];
    }

    const response = {
      today: {
        date: todayStr,
        totalAmount: todaySales.totalAmount || 0,
        totalQuantity: todaySales.totalQuantity || 0,
        transactionCount: todaySales.transactionCount || 0,
        percentChange: yesterdaySales.totalAmount > 0
          ? ((todaySales.totalAmount - yesterdaySales.totalAmount) / yesterdaySales.totalAmount) * 100
          : 0,
        prediction: todayPrediction ? {
          currentSales: todayPrediction.cumulativeSales || 0,
          predictedEndOfDay: todayPrediction.predictedSales || 0,
          lastUpdated: todayPrediction.updatedAt
        } : null
      },
      yesterday: {
        date: yesterdayStr,
        totalAmount: yesterdaySales.totalAmount || 0,
        prediction: yesterdayPrediction ? {
          predictedSales: yesterdayPrediction.predictedSales || 0,
          actualSales: yesterdayPrediction.actualSalesEndOfDay || 0,
          accuracy: yesterdayPrediction.accuracy || 0
        } : null
      },
      last30Days: {
        totalAmount: last30DaysTotal,
        totalTransactions: last30DaysTransactions,
        dailySales: last30DaysData
      },
      recentSales,
      topProducts
    };

    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.json(response);

  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    res.status(500).json({
      error: error.message,
      dashboard: {
        today: {
          date: new Date().toISOString().split('T')[0],
          totalAmount: 0,
          prediction: null
        },
        yesterday: {
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          totalAmount: 0,
          prediction: null
        },
        last30Days: {
          totalAmount: 0,
          totalTransactions: 0,
          dailySales: []
        },
        recentSales: [],
        topProducts: []
      }
    });
  }
};

// Get sales target data
const getSalesTargets_BE = async (req, res) => {
  try {
    const { year, month, day } = req.query;

    if (!year) {
      return res.status(400).json({ error: "Please provide year. Month and day are optional." });
    }

    const parsedYear = parseInt(year);
    const parsedMonth = month ? parseInt(month) : null;
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
      const targetMonth = targetType !== "yearly" ? parseInt(periodParts[1]) : null;
      const targetDay = targetType === "daily" ? parseInt(periodParts[2]) : null;

      let include = false;

      // Check yearly targets
      if (targetType === "yearly" && targetYear === parsedYear) {
        include = true;
      }

      // Check monthly targets
      if (
        targetType === "monthly" &&
        targetYear === parsedYear &&
        (!parsedMonth || targetMonth === parsedMonth)
      ) {
        include = true;
      }

      // Check daily targets
      if (
        targetType === "daily" &&
        targetYear === parsedYear &&
        (!parsedMonth || targetMonth === parsedMonth) &&
        (!parsedDay || targetDay === parsedDay)
      ) {
        include = true;
      }

      if (!include) continue;

      let achieved = 0;

      // Calculate achievement for daily targets
      if (targetType === "daily") {
        const formattedDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
        const salesDoc = await db.collection("sales_by_date").doc(formattedDate).get();
        achieved = salesDoc.exists ? (salesDoc.data().totalAmount || 0) : 0;
      }

      // Calculate achievement for monthly targets
      if (targetType === "monthly") {
        const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
        const nextMonth = targetMonth === 12 ? 1 : targetMonth + 1;
        const nextYear = targetMonth === 12 ? targetYear + 1 : targetYear;
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

        const salesSnapshot = await db.collection("sales_by_date")
          .where(admin.firestore.FieldPath.documentId(), ">=", startDate)
          .where(admin.firestore.FieldPath.documentId(), "<", endDate)
          .get();

        achieved = salesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
      }

      // Calculate achievement for yearly targets
      if (targetType === "yearly") {
        const startDate = `${targetYear}-01-01`;
        const endDate = `${targetYear + 1}-01-01`;

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

      // Check daily targets
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

      // Check monthly targets
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

      // Check yearly targets
      if (targetType === "yearly") {
        const [yyyy] = period.split("-").map(Number);
        const yearStart = new Date(`${yyyy}-01-01`);
        const yearEnd = new Date(`${yyyy + 1}-01-01`);

        // Include if year overlaps with range
        if (yearStart <= end && yearEnd >= start) {
          include = true;

          const startDateStr = `${yyyy}-01-01`;
          const endDateStr = `${yyyy + 1}-01-01`;

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

const deleteSalesTarget_BE = async (req, res) => {
  try {
    const { targetId } = req.params;

    if (!targetId) {
      return res.status(400).json({ error: "Target ID is required" });
    }

    // The document ID in the sales_targets collection is the targetId directly
    const targetRef = db.collection("sales_targets").doc(targetId);
    const targetDoc = await targetRef.get();

    if (!targetDoc.exists) {
      return res.status(404).json({ error: "Sales target not found" });
    }

    // Delete the target
    await targetRef.delete();

    res.status(200).json({
      message: "Sales target deleted successfully",
      id: targetId
    });
  } catch (error) {
    console.error("Error deleting sales target:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getPredictionForDate_BE = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const predictionRef = db.collection("predicted_sales").doc(date);
    const predictionDoc = await predictionRef.get();

    const eodRef = db.collection("predicted_sales_eod").doc(date);
    const eodDoc = await eodRef.get();

    const hourlyQuery = db.collection("predicted_sales_hourly")
      .where("dateKey", "==", date)
      .orderBy("hour", "asc");

    const hourlySnapshot = await hourlyQuery.get();
    const hourlyPredictions = hourlySnapshot.docs.map(doc => doc.data());

    const result = {
      date,
      currentPrediction: predictionDoc.exists ? {
        cumulativeSales: predictionDoc.data().cumulativeSales || 0,
        predictedSales: predictionDoc.data().predictedSales || 0,
        hourKey: predictionDoc.data().hourKey || null,
        updatedAt: predictionDoc.data().updatedAt || null,
        actualSalesEndOfDay: predictionDoc.data().actualSalesEndOfDay || null,
        accuracy: predictionDoc.data().accuracy || null
      } : null,
      endOfDayPrediction: eodDoc.exists ? {
        actualSalesEndOfDay: eodDoc.data().actualSalesEndOfDay || 0,
        predictedSales: eodDoc.data().predictedSales || 0,
        accuracy: eodDoc.data().accuracy || null,
        processedAt: eodDoc.data().processedAt || null
      } : null,
      hourlyPredictions: hourlyPredictions
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching prediction for date:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getAllPredictions_BE = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Both startDate and endDate are required" });
    }

    // Get EOD predictions (highest priority)
    const eodQuery = db.collection("predicted_sales_eod")
      .where("dateKey", ">=", startDate)
      .where("dateKey", "<=", endDate)
      .orderBy("dateKey", "desc");
    const eodSnapshot = await eodQuery.get();

    // Create a map of EOD predictions by date
    const eodPredictions = {};
    eodSnapshot.docs.forEach(doc => {
      const data = doc.data();
      eodPredictions[data.dateKey] = {
        date: data.dateKey,
        source: "eod",
        ...data
      };
    });

    // Get regular daily predictions (medium priority)
    const regularQuery = db.collection("predicted_sales")
      .where("dateKey", ">=", startDate)
      .where("dateKey", "<=", endDate)
      .orderBy("dateKey", "desc");
    const regularSnapshot = await regularQuery.get();

    const regularPredictions = {};
    regularSnapshot.docs.forEach(doc => {
      const data = doc.data();
      regularPredictions[data.dateKey] = {
        date: data.dateKey,
        source: "daily",
        ...data
      };
    });

    // Get hourly predictions (lowest priority)
    // We'll get the latest hourly prediction for each date by filtering later
    const hourlyQuery = db.collection("predicted_sales_hourly")
      .where("dateKey", ">=", startDate)
      .where("dateKey", "<=", endDate)
      .orderBy("dateKey", "desc")
      .orderBy("hour", "desc"); // Latest hour first for each date
    const hourlySnapshot = await hourlyQuery.get();

    // Group hourly predictions by date, keeping only the latest hour
    const hourlyPredictions = {};
    hourlySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const dateKey = data.dateKey;

      // Only add if we don't already have an entry for this date
      // This works because we ordered by hour desc, so first entry for a date is latest
      if (!hourlyPredictions[dateKey]) {
        hourlyPredictions[dateKey] = {
          date: dateKey,
          source: "hourly",
          ...data
        };
      }
    });

    // Get actual sales for comparison
    const salesQuery = db.collection("sales_by_date")
      .where(admin.firestore.FieldPath.documentId(), ">=", startDate)
      .where(admin.firestore.FieldPath.documentId(), "<=", endDate)
      .orderBy(admin.firestore.FieldPath.documentId(), "desc");
    const salesSnapshot = await salesQuery.get();
    const salesData = {};
    salesSnapshot.docs.forEach(doc => {
      salesData[doc.id] = {
        totalAmount: doc.data().totalAmount || 0
      };
    });

    // Create a list of all dates in the range
    const allDates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      allDates.push(dateKey);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Combine all predictions with priority: EOD > Daily > Hourly
    const result = allDates.map(dateKey => {
      // Choose prediction source with priority: EOD > Regular > Hourly
      const prediction =
        eodPredictions[dateKey] ||
        regularPredictions[dateKey] ||
        hourlyPredictions[dateKey] ||
        { date: dateKey, dateKey: dateKey };

      const salesInfo = salesData[dateKey] || { totalAmount: 0 };

      return {
        ...prediction,
        actualSales: prediction.actualSalesEndOfDay || salesInfo.totalAmount
      };
    });

    // Sort results by date descending
    result.sort((a, b) => {
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      return 0;
    });

    // Filter out entries that have no predictions from any collection
    const filteredResult = result.filter(item =>
      eodPredictions[item.dateKey] || regularPredictions[item.dateKey] || hourlyPredictions[item.dateKey]
    );

    // Calculate overall accuracy
    const totalPredicted = filteredResult.reduce((sum, item) => sum + (item.predictedSales || 0), 0);
    const totalActual = filteredResult.reduce((sum, item) => sum + (item.actualSales || 0), 0);
    let overallAccuracy = null;
    if (totalPredicted > 0 && totalActual > 0) {
      const absError = Math.abs(totalPredicted - totalActual);
      const largerVal = Math.max(totalPredicted, totalActual);
      const scaledErr = (absError / largerVal) * 100;
      overallAccuracy = Math.max(0, Math.min(100, 100 - scaledErr));
    }

    // Remove the source field from the final output
    const cleanResult = filteredResult.map(({ source, ...rest }) => rest);

    res.json({
      predictions: cleanResult,
      summary: {
        totalPredicted,
        totalActual,
        overallAccuracy
      }
    });
  } catch (error) {
    console.error("Error fetching predictions:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addSale_BE,
  getAllSales_BE,
  getSalesByDate_Daily,
  getSalesByDate_Monthly,
  getSalesForDate_BE, // Prediction included
  getHourlySalesForDate_BE, // Prediction included
  getSalesForHour_BE,
  getSalesDashboardData_BE, // Prediction included
  getSalesTargets_BE,
  getSalesTargetsByRange_BE,
  updateSalesTarget_BE,
  deleteSalesTarget_BE,
  getPredictionForDate_BE,
  getAllPredictions_BE,
};