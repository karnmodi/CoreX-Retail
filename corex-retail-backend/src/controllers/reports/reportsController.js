const admin = require("firebase-admin");
const db = admin.firestore();

const getSalesReport_BE = async (req, res) => {
  try {
    const { startDate, endDate, reportType, groupBy } = req.query;
    const userId = req.user.uid; // Get the user ID from the request

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    const userRole = req.user.role;
    if (userRole !== 'admin' && userRole !== 'manager' && userRole !== 'store manager') {
      return res.status(403).json({ error: "Only managers and administrators can generate reports" });
    }

    let query = db.collection("sales_by_date")
      .where(admin.firestore.FieldPath.documentId(), ">=", startDate)
      .where(admin.firestore.FieldPath.documentId(), "<=", endDate)
      .orderBy(admin.firestore.FieldPath.documentId());

    const snapshot = await query.get();
    const salesData = snapshot.docs.map((doc) => ({
      date: doc.id,
      ...doc.data(),
    }));

    let processedData = generateRevenueReport(salesData, groupBy);

    const report = {
      reportType: reportType || 'revenue',
      dateRange: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      groupBy: groupBy || 'daily',
      data: processedData,
      summary: calculateSummary(processedData)
    };

    // Save the report to collection
    await saveReportToCollection(report, userId);

    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ error: error.message });
  }
};


const getStaffReport_BE = async (req, res) => {
  try {
    const { startDate, endDate, reportType, staffIds } = req.query;
    const userId = req.user.uid;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    const userRole = req.user.role;
    if (userRole !== 'admin' && userRole !== 'manager' && userRole !== 'store manager') {
      return res.status(403).json({ error: "Only managers and administrators can generate reports" });
    }

    let staffQuery = db.collection("employees");
    if (staffIds && staffIds.length > 0) {
      const staffIdsArray = typeof staffIds === 'string' ? staffIds.split(',') : staffIds;
      staffQuery = staffQuery.where(admin.firestore.FieldPath.documentId(), "in", staffIdsArray);
    }

    const staffSnapshot = await staffQuery.get();
    const staffMembers = staffSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    let shiftsQuery = db.collection("shifts")
      .where("date", ">=", startDate)
      .where("date", "<=", endDate);

    const shiftsSnapshot = await shiftsQuery.get();
    let allShifts = shiftsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (staffIds && staffIds.length > 0) {
      const staffIdsArray = typeof staffIds === 'string' ? staffIds.split(',') : staffIds;
      allShifts = allShifts.filter(shift => {
        const shiftEmployeeId = typeof shift.employeeId === 'string'
          ? shift.employeeId
          : shift.employeeId?.uid;
        return staffIdsArray.includes(shiftEmployeeId);
      });
    }

    const processedData = generateStaffHoursReport(allShifts, staffMembers);

    const report = {
      reportType: reportType || 'hours',
      dateRange: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      data: processedData,
      summary: calculateStaffSummary(processedData)
    };

    // Save the report to collection
    await saveReportToCollection(report, userId);

    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating staff report:", error);
    res.status(500).json({ error: error.message });
  }
};


const getInventoryReport_BE = async (req, res) => {
  try {
    const { reportType, categories } = req.query;
    const userId = req.user.uid;

    const userRole = req.user.role;
    if (userRole !== 'admin' && userRole !== 'manager' && userRole !== 'store manager') {
      return res.status(403).json({ error: "Only managers and administrators can generate reports" });
    }

    let query = db.collection("inventory");

    if (categories && categories !== 'all') {
      const categoriesArray = typeof categories === 'string' ? categories.split(',') : categories;
      if (categoriesArray.length > 0 && !categoriesArray.includes('all')) {
        query = query.where("category", "in", categoriesArray);
      }
    }

    const snapshot = await query.get();
    const inventoryData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const processedData = generateStockLevelsReport(inventoryData);

    const report = {
      reportType: reportType || 'stock',
      generatedAt: new Date().toISOString(),
      data: processedData,
      summary: calculateInventorySummary(processedData, reportType)
    };

    await saveReportToCollection(report, userId);

    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating inventory report:", error);
    res.status(500).json({ error: error.message });
  }
};

const getFinancialReport_BE = async (req, res) => {
  try {
    const { startDate, endDate, reportType, detailLevel } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    const userRole = req.user.role;
    if (userRole !== 'admin' && userRole !== 'manager' && userRole !== 'store manager') {
      return res.status(403).json({ error: "Only managers and administrators can generate reports" });
    }

    const salesQuery = db.collection("sales_by_date")
      .where(admin.firestore.FieldPath.documentId(), ">=", startDate)
      .where(admin.firestore.FieldPath.documentId(), "<=", endDate)
      .orderBy(admin.firestore.FieldPath.documentId());

    const salesSnapshot = await salesQuery.get();
    const salesData = salesSnapshot.docs.map((doc) => ({
      date: doc.id,
      ...doc.data(),
    }));

    const inventorySnapshot = await db.collection("inventory").get();
    const inventoryData = inventorySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const processedData = generateFinancialReport(salesData, inventoryData, reportType, detailLevel);

    const report = {
      reportType: reportType || 'pnl',
      dateRange: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      detailLevel: detailLevel || 'summary',
      data: processedData,
      summary: calculateFinancialSummary(processedData, reportType)
    };

    await saveReportToCollection(report);
    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating financial report:", error);
    res.status(500).json({ error: error.message });
  }
};

const getOperationsReport_BE = async (req, res) => {
  try {
    const { startDate, endDate, reportType, metrics } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    const userRole = req.user.role;
    if (userRole !== 'admin' && userRole !== 'manager' && userRole !== 'store manager') {
      return res.status(403).json({ error: "Only managers and administrators can generate reports" });
    }

    const shiftsQuery = db.collection("shifts")
      .where("date", ">=", startDate)
      .where("date", "<=", endDate);

    const shiftsSnapshot = await shiftsQuery.get();
    const shiftsData = shiftsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const salesQuery = db.collection("sales_by_date")
      .where(admin.firestore.FieldPath.documentId(), ">=", startDate)
      .where(admin.firestore.FieldPath.documentId(), "<=", endDate);

    const salesSnapshot = await salesQuery.get();
    const salesData = salesSnapshot.docs.map((doc) => ({
      date: doc.id,
      ...doc.data(),
    }));

    const staffSnapshot = await db.collection("employees").get();
    const staffData = staffSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const processedData = generateEfficiencyReport(shiftsData, salesData, staffData, metrics);

    const report = {
      reportType: reportType || 'efficiency',
      dateRange: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      metrics: metrics ? (typeof metrics === 'string' ? metrics.split(',') : metrics) : [],
      data: processedData,
      summary: calculateOperationsSummary(processedData, reportType)
    };
    
    await saveReportToCollection(report);
    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating operations report:", error);
    res.status(500).json({ error: error.message });
  }
};

const getCustomReport_BE = async (req, res) => {
  try {
    const {
      startDate, endDate,
      dataSources,
      format,
      metrics,
      groupBy
    } = req.query;

    if (!startDate || !endDate || !dataSources) {
      return res.status(400).json({ error: "Start date, end date, and data sources are required" });
    }

    const userRole = req.user.role;
    if (userRole !== 'admin' && userRole !== 'manager' && userRole !== 'store manager') {
      return res.status(403).json({ error: "Only managers and administrators can generate reports" });
    }

    const dataSourcesArray = typeof dataSources === 'string' ? dataSources.split(',') : dataSources;
    const reportData = {};

    if (dataSourcesArray.includes('sales')) {
      const salesQuery = db.collection("sales_by_date")
        .where(admin.firestore.FieldPath.documentId(), ">=", startDate)
        .where(admin.firestore.FieldPath.documentId(), "<=", endDate)
        .orderBy(admin.firestore.FieldPath.documentId());

      const salesSnapshot = await salesQuery.get();
      reportData.sales = salesSnapshot.docs.map((doc) => ({
        date: doc.id,
        ...doc.data(),
      }));
    }

    if (dataSourcesArray.includes('staff')) {
      const staffSnapshot = await db.collection("employees").get();
      reportData.staff = staffSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const shiftsQuery = db.collection("shifts")
        .where("date", ">=", startDate)
        .where("date", "<=", endDate);

      const shiftsSnapshot = await shiftsQuery.get();
      reportData.shifts = shiftsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    if (dataSourcesArray.includes('inventory')) {
      const inventorySnapshot = await db.collection("inventory").get();
      reportData.inventory = inventorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    const processedData = generateCustomReport(reportData, metrics, groupBy);

    const report = {
      reportType: 'custom',
      dateRange: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      dataSources: dataSourcesArray,
      format: format || 'json',
      groupBy: groupBy || 'daily',
      data: processedData,
      summary: calculateCustomSummary(processedData, dataSourcesArray)
    };

    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating custom report:", error);
    res.status(500).json({ error: error.message });
  }
};

async function saveReportToCollection(reportData, userId) {
  try {
    const reportDoc = {
      reportType: reportData.reportType,
      generatedAt: reportData.generatedAt,
      createdBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      name: `${reportData.reportType} Report - ${new Date(reportData.generatedAt).toLocaleDateString()}`,
      summary: reportData.summary,
      dateRange: reportData.dateRange,
      groupBy: reportData.groupBy || null,
      metrics: reportData.metrics || null,
      dataSources: reportData.dataSources || null,
      sampleDataIds: reportData.data && reportData.data.length > 0
        ? reportData.data.slice(0, 3).map(item => item.id || '')
        : [],
      dataCount: reportData.data ? reportData.data.length : 0
    };

    const reportRef = await db.collection("reports").add(reportDoc);
    console.log(`Report saved with ID: ${reportRef.id}`);
    return reportRef.id;
  } catch (error) {
    console.error("Error saving report to collection:", error);
    return null;
  }
}

const getRecentReports_BE = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.uid;

    if (userRole !== 'admin' && userRole !== 'manager' && userRole !== 'store manager') {
      return res.status(403).json({ error: "Only managers and administrators can access reports" });
    }

    let query = db.collection("reports")
      .orderBy("createdAt", "desc")
      .limit(10);

    if (userRole !== 'admin') {
      query = query.where("createdBy", "==", userId);
    }

    const snapshot = await query.get();
    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ reports });
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    res.status(500).json({ error: error.message });
  }
};

function generateRevenueReport(salesData, groupBy) {
  const groupedData = {};

  salesData.forEach(sale => {
    let key;
    const date = new Date(sale.date);

    if (groupBy === 'weekly') {
      const day = date.getDay() || 7;
      const diff = date.getDate() - day + 1;
      const monday = new Date(date);
      monday.setDate(diff);
      key = monday.toISOString().split('T')[0];
    } else if (groupBy === 'monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = sale.date;
    }

    if (!groupedData[key]) {
      groupedData[key] = {
        period: key,
        totalAmount: 0,
        totalQuantity: 0,
        transactionCount: 0
      };
    }

    groupedData[key].totalAmount += sale.totalAmount || 0;
    groupedData[key].totalQuantity += sale.totalQuantity || 0;
    groupedData[key].transactionCount += sale.transactionCount || 0;
  });

  return Object.values(groupedData);
}

function generateStaffHoursReport(shifts, staffMembers) {
  const staffHours = {};

  staffMembers.forEach(staff => {
    staffHours[staff.id] = {
      id: staff.id,
      name: `${staff.firstName} ${staff.lastName}`,
      role: staff.role || 'Staff',
      totalHours: 0,
      totalShifts: 0,
      shifts: []
    };
  });

  shifts.forEach(shift => {
    const employeeId = typeof shift.employeeId === 'string'
      ? shift.employeeId
      : shift.employeeId?.uid;

    if (!staffHours[employeeId]) return;

    const startTime = new Date(`${shift.date}T${shift.startTime}`);
    const endTime = new Date(`${shift.date}T${shift.endTime}`);
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);

    staffHours[employeeId].totalHours += durationHours;
    staffHours[employeeId].totalShifts += 1;
    staffHours[employeeId].shifts.push({
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      hours: durationHours,
      notes: shift.notes || ''
    });
  });

  return Object.values(staffHours);
}

function generateStockLevelsReport(inventoryData) {
  return inventoryData.map(item => ({
    id: item.id,
    productName: item.productName,
    category: item.category,
    currentStock: item.currentStock || 0,
    reorderPoint: item.reorderPoint || 0,
    maxStock: item.maxStock || 0,
    status: getStockStatus(item),
    value: (item.currentStock || 0) * (item.costPrice || 0)
  }));
}

function generateEfficiencyReport(shiftsData, salesData, staffData, metrics) {
  const result = [];
  const dateMap = {};

  shiftsData.forEach(shift => {
    const date = shift.date;
    if (!dateMap[date]) {
      dateMap[date] = {
        date,
        shifts: [],
        sales: [],
        metrics: {}
      };
    }
    dateMap[date].shifts.push(shift);
  });

  salesData.forEach(sale => {
    const date = sale.date;
    if (dateMap[date]) {
      dateMap[date].sales.push(sale);
    }
  });

  Object.values(dateMap).forEach(dateData => {
    const metricsArray = typeof metrics === 'string' ? metrics.split(',') : (Array.isArray(metrics) ? metrics : []);

    if (metricsArray.includes('productivity')) {
      dateData.metrics.productivity = calculateProductivity(dateData.shifts, dateData.sales);
    }

    if (metricsArray.includes('sales_per_hour')) {
      dateData.metrics.sales_per_hour = calculateSalesPerHour(dateData.shifts, dateData.sales);
    }

    result.push({
      date: dateData.date,
      metrics: dateData.metrics
    });
  });

  return result;
}

function generateCustomReport(reportData, metrics, groupBy) {
  const result = [];
  const metricsArray = typeof metrics === 'string' ? metrics.split(',') : (Array.isArray(metrics) ? metrics : []);

  if (groupBy === 'daily' && reportData.sales) {
    const dateMap = {};

    reportData.sales.forEach(saleDay => {
      const date = saleDay.date;
      if (!dateMap[date]) {
        dateMap[date] = {
          date,
          metrics: {}
        };
      }

      if (metricsArray.includes('revenue')) {
        dateMap[date].metrics.revenue = calculateRevenue(saleDay);
      }
    });

    if (reportData.inventory && metricsArray.includes('stock_levels')) {
      reportData.inventory.forEach(item => {
        Object.values(dateMap).forEach(dateData => {
          if (!dateData.metrics.inventory) {
            dateData.metrics.inventory = [];
          }
          dateData.metrics.inventory.push({
            id: item.id,
            name: item.productName,
            stock: item.currentStock
          });
        });
      });
    }

    result.push(...Object.values(dateMap));
  }

  return result;
}

function generateFinancialReport(salesData, inventoryData, reportType, detailLevel) {
  const result = [];

  salesData.forEach(sale => {
    const dateData = {
      date: sale.date,
      revenue: sale.totalAmount || 0,
      transactions: sale.transactionCount || 0,
      itemsSold: sale.totalQuantity || 0
    };

    // Calculate costs using inventory data
    if (sale.sales && Array.isArray(sale.sales)) {
      let costOfGoodsSold = 0;

      sale.sales.forEach(transaction => {
        const product = inventoryData.find(item => item.id === transaction.productId);
        if (product) {
          costOfGoodsSold += (product.costPrice || 0) * (transaction.quantity || 0);
        }
      });

      dateData.costOfGoodsSold = costOfGoodsSold;
      dateData.grossProfit = dateData.revenue - costOfGoodsSold;
      dateData.grossMargin = dateData.revenue > 0 ? (dateData.grossProfit / dateData.revenue) * 100 : 0;
    }

    result.push(dateData);
  });

  return result;
}

function getStockStatus(item) {
  if (!item.currentStock) return 'out_of_stock';
  if (item.currentStock <= item.reorderPoint) return 'low_stock';
  if (item.currentStock > item.maxStock) return 'overstock';
  return 'normal';
}

function calculateProductivity(shifts, sales) {
  const totalShiftHours = shifts.reduce((total, shift) => {
    const start = new Date(`${shift.date}T${shift.startTime}`);
    const end = new Date(`${shift.date}T${shift.endTime}`);
    return total + (end - start) / (1000 * 60 * 60);
  }, 0);

  const totalSales = sales.reduce((total, sale) => total + (sale.totalAmount || 0), 0);

  return totalShiftHours > 0 ? totalSales / totalShiftHours : 0;
}

function calculateSalesPerHour(shifts, sales) {
  const totalSalesAmount = sales.reduce((total, sale) => total + (sale.totalAmount || 0), 0);
  return totalSalesAmount;
}


function calculateRevenue(saleDay) {
  return saleDay.totalAmount || 0;
}

function calculateSummary(data) {
  const totalRevenue = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalQuantity = data.reduce((sum, item) => sum + item.totalQuantity, 0);
  const totalTransactions = data.reduce((sum, item) => sum + item.transactionCount, 0);

  return {
    totalRevenue,
    totalQuantity,
    totalTransactions,
    averageTransactionValue: totalTransactions ? totalRevenue / totalTransactions : 0
  };
}

function calculateStaffSummary(data) {
  const totalHours = data.reduce((sum, staff) => sum + staff.totalHours, 0);
  const totalShifts = data.reduce((sum, staff) => sum + staff.totalShifts, 0);

  return {
    totalStaff: data.length,
    totalHours,
    totalShifts,
    averageHoursPerStaff: data.length ? totalHours / data.length : 0
  };
}

function calculateInventorySummary(data, reportType) {
  if (reportType === 'stock' || reportType === 'lowstock') {
    const totalItems = data.reduce((sum, item) => sum + (item.currentStock || 0), 0);
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const lowStockItems = data.filter(item => item.status === 'low_stock').length;
    const outOfStockItems = data.filter(item => item.status === 'out_of_stock').length;

    return {
      totalProducts: data.length,
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems
    };
  }

  return {
    totalProducts: data.length
  };
}

function calculateFinancialSummary(data, reportType) {
  const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalCost = data.reduce((sum, item) => sum + (item.costOfGoodsSold || 0), 0);
  const totalProfit = data.reduce((sum, item) => sum + (item.grossProfit || 0), 0);

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  };
}

function calculateOperationsSummary(data, reportType) {
  const avgProductivity = data.reduce((sum, item) => sum + (item.metrics.productivity || 0), 0) / (data.length || 1);
  const avgSalesPerHour = data.reduce((sum, item) => sum + (item.metrics.sales_per_hour || 0), 0) / (data.length || 1);

  return {
    periodCovered: data.length,
    averageProductivity: avgProductivity,
    averageSalesPerHour: avgSalesPerHour
  };
}

function calculateCustomSummary(data, dataSources) {
  const summary = {};

  if (data.length > 0) {
    if (dataSources.includes('sales')) {
      summary.totalRevenue = data.reduce((sum, item) => sum + (item.metrics.revenue || 0), 0);
    }

    if (dataSources.includes('inventory')) {
      let totalInventoryItems = 0;
      data.forEach(day => {
        if (day.metrics.inventory) {
          totalInventoryItems += day.metrics.inventory.reduce((sum, item) => sum + (item.stock || 0), 0);
        }
      });
      summary.averageInventoryLevel = totalInventoryItems / data.length;
    }
  }

  return summary;
}

module.exports = {
  getSalesReport_BE,
  getStaffReport_BE,
  getInventoryReport_BE,
  getFinancialReport_BE,
  getOperationsReport_BE,
  getCustomReport_BE,
  getRecentReports_BE
};