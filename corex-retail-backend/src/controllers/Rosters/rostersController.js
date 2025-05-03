const admin = require("firebase-admin");
const db = admin.firestore();

const {
  validateRoster,
  prepareRoster
} = require("../../models/rostersSchema");

// Create a new shift
const addShift_BE = async (req, res) => {
  try {
    console.log("Incoming shift data:", req.body);
    const { employeeId } = req.body;

    if (!employeeId || !employeeId.uid) {
      return res.status(400).json({ error: "Employee UID is required in employeeId" });
    }

    // Fetch employee details from Firestore
    const empRef = db.collection("employees").doc(employeeId.uid);
    const empDoc = await empRef.get();

    if (!empDoc.exists) {
      return res.status(404).json({ error: "Employee not found with given UID" });
    }

    const employeeData = empDoc.data();
    const firstName = employeeData.firstName || "";
    const lastName = employeeData.lastName || "";
    const profilePicture = employeeData.profilePicture || "";

    const fullEmployee = {
      uid: employeeId.uid,
      username: `${firstName} ${lastName}`.trim(),
      profilePicture: `${profilePicture}`,
    };

    const rosterData = {
      ...req.body,
      employeeId: fullEmployee
    };

    const preparedData = prepareRoster(rosterData);
    const validation = validateRoster(preparedData);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors
      });
    }

    const docRef = await db.collection("shifts").add(preparedData);

    res.status(201).json({
      message: "Shift added successfully",
      id: docRef.id,
      data: preparedData
    });
  } catch (error) {
    console.error("Error adding shift:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get all shifts (or filter by date)
const getShifts_BE = async (req, res) => {
  try {
    const { date } = req.query;

    let queryRef = db.collection("shifts");

    if (date) {
      queryRef = queryRef
        .where("date", "==", date)
    } else {
      queryRef = queryRef.orderBy("createdAt", "desc");
    }

    const snapshot = await queryRef.get();
    const shifts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET upcoming rosters by staff ID
const getUpcomingRostersByStaffId_BE = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { days = 7 } = req.query; 

    if (!staffId) {
      return res.status(400).json({ error: "Staff ID is required" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + parseInt(days));

    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const shiftsSnapshot = await db.collection("shifts")
      .where("employeeId.uid", "==", staffId)
      .where("date", ">=", startDateStr)
      .where("date", "<=", endDateStr)
      .orderBy("date", "asc") 
      .get();

    if (shiftsSnapshot.empty) {
      return res.status(200).json({
        message: "No upcoming shifts found for this staff member",
        shifts: [],
        date: startDateStr,
        endDate: endDateStr,
      });
    }

    const shifts = shiftsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const shiftsByDate = shifts.reduce((acc, shift) => {
      const date = shift.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(shift);
      return acc;
    }, {});

    return res.status(200).json({
      message: "Upcoming shifts retrieved successfully",
      totalShifts: shifts.length,
      upcomingDays: Object.keys(shiftsByDate).length,
      shiftsByDate,
      shifts
    });
  } catch (error) {
    console.error("Error fetching upcoming shifts:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Update shift by ID
const updateShift_BE = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) return res.status(400).json({ error: "Missing shift ID" });

    const shiftRef = db.collection("shifts").doc(id);
    const docSnapshot = await shiftRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Shift not found" });
    }

    await shiftRef.update({
      ...updates,
      updatedAt: new Date()
    });

    const updatedDoc = await shiftRef.get();
    res.json({
      message: "Shift updated successfully",
      updatedData: updatedDoc.data()
    });
  } catch (error) {
    console.error("Error updating shift:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Delete shift by ID
const deleteShift_BE = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Missing shift ID" });

    const shiftRef = db.collection("shifts").doc(id);
    const docSnapshot = await shiftRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Shift not found" });
    }

    await shiftRef.delete();

    res.json({ message: "Shift deleted successfully" });
  } catch (error) {
    console.error("Error deleting shift:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getWorkingEmployeesByDate_BE = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const shiftsSnapshot = await db
      .collection("shifts")
      .where("date", "==", date)
      .get();


    if (shiftsSnapshot.empty) {
      return res.status(200).json([]);
    }

    const shifts = shiftsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(shifts);
  } catch (error) {
    console.error("Error fetching shifts by date:", error.message);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  addShift_BE,
  getShifts_BE,
  getUpcomingRostersByStaffId_BE,
  updateShift_BE,
  deleteShift_BE,
  getWorkingEmployeesByDate_BE
};
