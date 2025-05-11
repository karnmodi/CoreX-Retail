// routes/api/reportsRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/auth");
const {
  getSalesReport_BE,
  getStaffReport_BE,
  getInventoryReport_BE,
  getFinancialReport_BE,
  getOperationsReport_BE,
  getCustomReport_BE,
  getRecentReports_BE
} = require("../../controllers/reports/reportsController");
const { trackActivity } = require("../../controllers/profile/ActivityController");

router.use(verifyToken);

router.get("/recent", getRecentReports_BE);

router.get("/sales",
  trackActivity(
    'reports_view',
    (req) => 'Sales Report Generated',
    (req) => `Generated a ${req.query.reportType || 'revenue'} sales report`
  ),
  getSalesReport_BE
);

// Staff reports
router.get("/staff",
  trackActivity(
    'reports_view',
    (req) => 'Staff Report Generated',
    (req) => `Generated a ${req.query.reportType || 'hours'} staff report`
  ),
  getStaffReport_BE
);

// Inventory reports
router.get("/inventory",
  trackActivity(
    'reports_view',
    (req) => 'Inventory Report Generated',
    (req) => `Generated a ${req.query.reportType || 'stock'} inventory report`
  ),
  getInventoryReport_BE
);

// Financial reports
router.get("/financial",
  trackActivity(
    'reports_view',
    (req) => 'Financial Report Generated',
    (req) => `Generated a ${req.query.reportType || 'pnl'} financial report`
  ),
  getFinancialReport_BE
);

// Operations reports
router.get("/operations",
  trackActivity(
    'reports_view',
    (req) => 'Operations Report Generated',
    (req) => `Generated a ${req.query.reportType || 'efficiency'} operations report`
  ),
  getOperationsReport_BE
);

// Custom reports
router.get("/custom",
  trackActivity(
    'reports_view',
    (req) => 'Custom Report Generated',
    (req) => `Generated a custom report with ${req.query.dataSources || 'multiple'} data sources`
  ),
  getCustomReport_BE
);

module.exports = router;