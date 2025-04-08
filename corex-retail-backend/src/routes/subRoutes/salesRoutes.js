const express = require("express");
const {
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
} = require("../../controllers/sales/salesController");
const verifyToken = require("../../middleware/auth");

const router = express.Router();

// Middleware to parse JSON payloads up to 10MB for bulk imports
router.use(express.json({ limit: '10mb' }));

// 📌 Base Sales Routes
router.post("/", verifyToken, addSale_BE);
router.get("/", verifyToken, getAllSales_BE);
router.get("/:id", verifyToken, getSaleById_BE);
router.put("/:id", verifyToken, updateSale_BE);
router.delete("/:id", verifyToken, deleteSale_BE);

// 📌 Aggregation Routes
router.get("/analytics/by-minute", verifyToken, getSalesByMinute_BE);
router.get("/analytics/by-hour", verifyToken, getSalesByHour_BE);
router.get("/analytics/by-date", verifyToken, getSalesByDate_BE);
router.get("/analytics/summary", verifyToken, getSalesSummary_BE);
router.get("/analytics/product-ranking", verifyToken, getProductSalesRanking_BE);

// 📌 Bulk Operations
router.post("/bulk-import", verifyToken, bulkImportSales_BE);

module.exports = router;