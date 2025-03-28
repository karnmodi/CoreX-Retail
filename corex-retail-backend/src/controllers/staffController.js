const { db } = require("../config/firebase");
const admin = require("firebase-admin");
const auth = admin.auth();
const { 
  employeeSchema,
  validateEmployee, 
  prepareEmployee 
} = require("../models/staffSchema");


const addStaff_BE = async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);
    const employeeData = prepareEmployee(req.body);

    console.log("Processed employee data:", employeeData);
    
    const validation = validateEmployee(employeeData);
    console.log("Validation result:", validation);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validation.errors 
      });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        error: "Email and password are required" 
      });
    }

    const userRecord = await auth.createUser({ email, password });

    const staffRef = db.collection("employees").doc(userRecord.uid);
    await staffRef.set(employeeData);
    
    res.status(201).json({ message: "Staff added successfully", uid: userRecord.uid });

  } catch (e) {
    console.error("Error adding staff:", e.message);
    res.status(500).json({ error: e.message });  
  }
};

const getAllStaff_BE = async (req, res) => {
  try {
    const snapshot = await db.collection("employees").orderBy("createdAt", "desc").get();
    const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json(employees);
  } catch (errors) {
    res.status(500).json({ error: errors.message });
  }
};

const getStaffById_BE = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: "Missing staff ID" });
    }

    const staffDoc = await db.collection("employees").doc(id).get();

    if (!staffDoc.exists) return res.status(404).json({ message: "Staff not found" });

    res.json({ id: staffDoc.id, ...staffDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStaff_BE = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ error: "Invalid or missing ID" });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update fields provided" });
    }

    const staffRef = db.collection("employees").doc(id);
    const docSnapshot = await staffRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    await staffRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    const updatedDoc = await staffRef.get();
    const updatedData = updatedDoc.data();

    res.json({ message: "Staff updated successfully", updatedData });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ error: error.message });
  }
};


const deleteStaff_BE = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: "Invalid or missing ID" });
    }

    const staffRef = db.collection("employees").doc(id);
    const docSnapshot = await staffRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "User not found in Firestore" });
    }

    await auth.deleteUser(id);

    await staffRef.delete();

    res.json({ message: "Staff deleted successfully" });

  } catch (error) {
    console.error("Error deleting staff:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllStaff_BE, addStaff_BE, updateStaff_BE, getStaffById_BE, deleteStaff_BE };
