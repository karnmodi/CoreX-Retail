const express = require("express");
const multer = require("multer");
const { addProduct_BE, getAllProducts_BE, getProductById_BE, getLowStockProducts_BE, updateProduct_BE, updateProductStock_BE, deleteProduct_BE, getInventoryValue_BE, } = require("../../controllers/inventoryController");
const verifyToken = require("../../middleware/auth");

const router = express.Router();

// ✅ Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/value", verifyToken, getInventoryValue_BE);
router.get("/low-stock", verifyToken, getLowStockProducts_BE);
router.post("/", verifyToken, upload.array("images", 5), addProduct_BE);
router.get("/", verifyToken, getAllProducts_BE);
router.get("/:id", verifyToken, getProductById_BE);
router.put("/:id", verifyToken, upload.array("images", 5), updateProduct_BE);
router.patch("/:id/update-stock", verifyToken, updateProductStock_BE);
router.delete("/:id", verifyToken, deleteProduct_BE);

module.exports = router;
