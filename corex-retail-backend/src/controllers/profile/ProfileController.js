const { db } = require("../../config/firebase");
const admin = require('firebase-admin');
const {
  validateEmployee,
  prepareEmployee
} = require("../../models/staffSchema");
const { recordProfileUpdateActivity } = require('../../controllers/profile/ActivityController');

// 📌 Get Employee by ID
const getEmployeeById_BE = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify that the requesting user is authorized to access this employee
    if (req.user.uid !== id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: "Unauthorized access. You can only access your own profile." 
      });
    }

    const employeeRef = db.collection("employees").doc(id);
    const docSnapshot = await employeeRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ 
      id: docSnapshot.id, 
      ...docSnapshot.data() 
    });
  } catch (error) {
    console.error("Error fetching employee:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Update Employee Profile
const updateEmployeeProfile_BE = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify that the requesting user is authorized to update this employee
    if (req.user.uid !== id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: "Unauthorized access. You can only update your own profile." 
      });
    }

    // Get the current employee data
    const employeeRef = db.collection("employees").doc(id);
    const docSnapshot = await employeeRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const existingEmployee = docSnapshot.data();
    
    // Prepare and validate the updated employee data
    const updateData = prepareEmployee({...existingEmployee, ...req.body});
    
    const validation = validateEmployee(updateData);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors
      });
    }

    // Only allow updating of profile fields, not sensitive fields
    const allowedFields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 
      'state', 'zipCode', 'dateOfBirth', 'emergencyContact',
      'notes', 'location', 'department', 'role', 'updatedAt'
    ];
    
    const filteredUpdate = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdate[key] = updateData[key];
      }
    });
    
    // Always set the updated timestamp
    filteredUpdate.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await employeeRef.update(filteredUpdate);

    // Fetch the updated document
    const updatedDoc = await employeeRef.get();

    res.status(200).json({
      message: "Profile updated successfully",
      employee: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });

    await recordProfileUpdateActivity(id, Object.keys(filteredUpdate));

  } catch (error) {
    console.error("Error updating employee profile:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Upload Profile Picture
const uploadProfilePicture_BE = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify that the requesting user is authorized
    if (req.user.uid !== id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: "Unauthorized access. You can only update your own profile picture." 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Get reference to the employee
    const employeeRef = db.collection("employees").doc(id);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Upload the image to Firebase Storage
    const fileName = `profile_pictures/${id}_${Date.now()}_${req.file.originalname}`;
    const fileUpload = admin.storage().bucket().file(fileName);
    
    await fileUpload.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });
    
    // Make the file publicly accessible
    await fileUpload.makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${admin.storage().bucket().name}/${fileName}`;
    
    // Update the employee profile with the new image URL
    await employeeRef.update({
      profilePicture: publicUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: publicUrl
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error.message);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getEmployeeById_BE,
  updateEmployeeProfile_BE,
  uploadProfilePicture_BE,
};