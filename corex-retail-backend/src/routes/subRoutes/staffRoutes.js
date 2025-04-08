const express = require("express");
const { getAllStaff_BE, addStaff_BE, updateStaff_BE, getStaffById_BE, deleteStaff_BE } = require("../../controllers/staffController");
const verifyToken = require("../../middleware/auth");
const { trackActivity } = require("../../controllers/profile/ActivityController");

const router = express.Router();

router.post("/", verifyToken, trackActivity(
    'Staff_add',
    (req) => 'Staff Added',
    (req) => 'New Staff member was added',
), addStaff_BE);

router.get("/", verifyToken, getAllStaff_BE);
router.get("/:id", verifyToken, getStaffById_BE);

router.put("/:id", verifyToken, updateStaff_BE);

router.delete("/:id", verifyToken, trackActivity(
    'Staff_delete',
    (req) => 'Staff Deleted',
    (req) => 'New Staff member was deleted',
), deleteStaff_BE);

module.exports = router;