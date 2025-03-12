const express = require("express");
const {getAllStaff_BE, addStaff_BE, updateStaff_BE, getStaffById_BE, deleteStaff_BE} = require("../controllers/staffController");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.post("/",verifyToken, addStaff_BE);

router.get("/", verifyToken, getAllStaff_BE);  
router.get("/:id", verifyToken, getStaffById_BE);

router.put("/:id", verifyToken, updateStaff_BE);

router.delete("/:id", verifyToken, deleteStaff_BE);

module.exports = router;