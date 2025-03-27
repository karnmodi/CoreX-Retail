const express = require("express");
const router = express.Router();
const  verifyToken  = require("../../middleware/auth");
const {
  addShift_BE,
  getShifts_BE,
  updateShift_BE,
  deleteShift_BE,
  getWorkingEmployeesByDate_BE,
} = require("../../controllers/Rosters/rostersController");

router.get("/",verifyToken, getShifts_BE);
router.post("/",verifyToken,  addShift_BE);
router.put("/:id", verifyToken, updateShift_BE);
router.delete("/:id", verifyToken, deleteShift_BE);
router.get("/by-date", getWorkingEmployeesByDate_BE);

module.exports = router;
