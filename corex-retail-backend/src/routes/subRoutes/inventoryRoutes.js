const express = require("express");
const multer = require("multer");
const { addProduct_BE, getAllProducts_BE, getProductById_BE, updateProduct_BE, deleteProduct_BE } = require("../../controllers/inventoryController");
const  verifyToken  = require("../../middleware/auth");

const router = express.Router();

// ✅ Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", verifyToken, upload.array("images", 5), addProduct_BE);
router.get("/", verifyToken, getAllProducts_BE);
router.get("/:id", verifyToken, getProductById_BE);
router.put("/:id", verifyToken, upload.array("images", 5), updateProduct_BE);
router.delete("/:id", verifyToken, deleteProduct_BE);

module.exports = router;
