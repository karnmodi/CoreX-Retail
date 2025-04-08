const express = require("express");
const multer = require("multer");
const {
  getEmployeeById_BE,
  updateEmployeeProfile_BE,
  uploadProfilePicture_BE,
} = require("../../controllers/profile/ProfileController");
const { getUserActivities_BE } = require("../../controllers/profile/ActivityController");
const verifyToken = require("../../middleware/auth");
const { trackActivity } = require("../../controllers/profile/ActivityController");

const router = express.Router();

// Setup multer for memory storage (for profile pictures)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes that require authentication
router.get("/:id", verifyToken, getEmployeeById_BE);
router.put("/:id",
  verifyToken,
  trackActivity(
    'profile_update',
    (req) => 'Profile Updated',
    (req) => 'Your profile information was updated'
  ),
  updateEmployeeProfile_BE
);
router.post("/:id/profile-picture", verifyToken, upload.single("profilePicture"), trackActivity(
  'profile_update',
  (req) => 'Profile Photo Updated',
  (req) => 'Your profile Photo was updated'
), uploadProfilePicture_BE);

router.get("/:id/activity", verifyToken, getUserActivities_BE);



module.exports = router;