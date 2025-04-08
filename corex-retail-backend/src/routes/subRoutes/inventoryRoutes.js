const express = require("express");
const multer = require("multer");
const { addProduct_BE, getAllProducts_BE, getProductById_BE, getLowStockProducts_BE, updateProduct_BE, updateProductStock_BE, deleteProduct_BE, getInventoryValue_BE, } = require("../../controllers/inventoryController");
const verifyToken = require("../../middleware/auth");
const { trackActivity } = require("../../controllers/profile/ActivityController");

const router = express.Router();

// ✅ Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/value", verifyToken, getInventoryValue_BE);
router.get("/low-stock", verifyToken, getLowStockProducts_BE);
router.post("/", verifyToken, upload.array("images", 5), trackActivity(
    'Inventory_Added',
    (req) => 'Product Added',
    (req) => 'Checked Inventory to add new product',
), addProduct_BE);
router.get("/", verifyToken, getAllProducts_BE);
router.get("/:id", verifyToken, getProductById_BE);
router.put("/:id", verifyToken, upload.array("images", 5), trackActivity(
    'Inventory_Updated',
    (req) => 'Product Updated',
    (req) => 'Checked Inventory to Update new product',
), updateProduct_BE);
router.patch("/:id/update-stock", verifyToken, updateProductStock_BE);
router.delete("/:id", verifyToken, trackActivity(
    'Inventory_Deleted',
    (req) => 'Product Deleted',
    (req) => 'Checked Inventory to delete new product',
), deleteProduct_BE);

module.exports = router;
