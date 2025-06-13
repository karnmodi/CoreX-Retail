const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/auth");
const {
  addShift_BE,
  getShifts_BE,
  updateShift_BE,
  deleteShift_BE,
  getWorkingEmployeesByDate_BE,
  getUpcomingRostersByStaffId_BE,
  getMonthlyShiftsByEmployeeId_BE
} = require("../../controllers/Rosters/rostersController");
const { trackActivity } = require("../../controllers/profile/ActivityController");

router.get("/", verifyToken, getShifts_BE);
router.post("/", verifyToken, addShift_BE);
router.put("/:id", verifyToken, trackActivity(
  'Rosters_update',
  (req) => 'Roster Updated',
  (req) => 'some roster was updated',
), updateShift_BE);
router.delete("/:id", verifyToken, deleteShift_BE);
router.get("/by-date", getWorkingEmployeesByDate_BE);
router.get("/upcoming/:staffId/", getUpcomingRostersByStaffId_BE);
router.get("/by-month/:staffId/", getMonthlyShiftsByEmployeeId_BE);


module.exports = router;
