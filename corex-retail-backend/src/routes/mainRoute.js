const express = require("express");
const router = express.Router();

const authRoutes = require("./subRoutes/authRoutes");
const staffRoutes = require("./SubRoutes/staffRoutes");
const inventoryRoutes = require("./subRoutes/inventoryRoutes");
const rostersRoutes = require("./subRoutes/rostersRoutes");

router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "CoreX Retail Backend API is up and running 🚀",
  });
});

router.use("api/auth", authRoutes);
router.use("api/employees", staffRoutes);
router.use("api/inventory", inventoryRoutes);
router.use("api/rosters", rostersRoutes);

// 404 Handler - Page Not Found
router.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
  });
});

router.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);

  res.status(500).json({
    status: "error",
    message: "Something went wrong on the server",
  });
});

module.exports = router;
