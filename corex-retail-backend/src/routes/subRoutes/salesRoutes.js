const express = require("express");
const { 
  addSale_BE, 
  getAllSales_BE, 
  getSalesByDate_Daily, 
  getSalesByDate_Monthly,
  getSalesForDate_BE, 
  getHourlySalesForDate_BE, 
  getSalesForHour_BE, 
  getSalesDashboardData_BE,
  getSalesTargets_BE, 
  getSalesTargetsByRange_BE,
  updateSalesTarget_BE
} = require("../../controllers/sales/salesController");
const verifyToken = require("../../middleware/auth");
const { trackActivity } = require("../../controllers/profile/ActivityController");

const router = express.Router();

// Dashboard data endpoint
router.get("/dashboard", verifyToken, trackActivity(
  'Sales_Dashboard_Viewed',
  (req) => 'Sales Dashboard Viewed',
  (req) => 'User viewed the sales dashboard'
), getSalesDashboardData_BE);

// Sales endpoints
router.post("/", verifyToken, trackActivity(
  'Sale_Added',
  (req) => 'New Sale Recorded',
  (req) => 'User added a new sales record'
), addSale_BE);

router.get("/", verifyToken, getAllSales_BE);

// Date-based endpoints
router.get("/by-date/daily", verifyToken, getSalesByDate_Daily);
router.get("/by-date/monthly", verifyToken, getSalesByDate_Monthly);
router.get("/date/:date", verifyToken, getSalesForDate_BE);

// Hour-based endpoints
router.get("/date/:date/hourly", verifyToken, getHourlySalesForDate_BE);
router.get("/hour/:hourKey", verifyToken, getSalesForHour_BE);

// Targets endpoints
router.get("/targets", verifyToken, getSalesTargets_BE);
router.get("/targets/range", verifyToken, getSalesTargetsByRange_BE);
router.post("/targets", verifyToken, trackActivity(
  'Sales_Target_Updated',
  (req) => 'Sales Target Updated',
  (req) => 'User updated a sales target'
), updateSalesTarget_BE);

module.exports = router;