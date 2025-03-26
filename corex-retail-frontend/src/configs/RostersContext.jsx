import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./FirebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { duration } from "moment/moment";

// const RostersContext = useContext(RostersContext);
const RostersContext = createContext();

export const useRoster = () => {
  const context = useContext(RostersContext);
  if (!context) {
    throw new Error("useRoster must be used within a RosterProvider");
  }
  return context;
};

export const RosterProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [businessHours, setBusinessHours] = useState({
    startTime: "09:00",
    endTime: "20:00",
    duration : 8,
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const employeesCollection = collection(db, "employees");
      const employeesSnapshot = await getDocs(employeesCollection);
      const employeesList = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees: ", error);
      setLoading(false);
    }
  };

  const fetchShiftsForDate = async (date) => {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const shiftsCollection = collection(db, "shifts");
      const q = query(
        shiftsCollection,
        where("date", "==", formattedDate)
      );
      const shiftsSnapshot = await getDocs(q);
      const shiftsList = shiftsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShifts(shiftsList);
    } catch (error) {
      console.error("Error fetching shifts: ", error);
    }
  };

  const addShift = async (employeeId, date, startTime, endTime, notes) => {
    try {
      const formattedDate = date.toISOString().split("T")[0];

      const newShift = {
        employeeId,
        date: formattedDate,
        startTime,
        endTime,
        notes,
        createdAt : new Date(),
      };
      const docRef = await addDoc(collection(db, "shifts"), newShift);
      setShifts([...shifts, { id: docRef.id, ...newShift }]);
      return {
        success: true,
        message: "Shift added successfully",
        id: docRef.id,
      };
    } catch (error) {
      console.error("Error adding shift: ", error);
      return { success: false, message: "Error adding shift" };
    }
  };

  const updateShift = async (shiftId, updatedData) => {
    try {
      const shiftDocRef = doc(db, "shifts", shiftId);
      const updatedAt = new Date(); 
  
      await updateDoc(shiftDocRef, { ...updatedData, updatedAt });
  
      setShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift.id === shiftId ? { ...shift, ...updatedData, updatedAt } : shift
        )
      );
  
      return { success: true, message: "Shift updated successfully" };
    } catch (error) {
      console.error("Error updating shift: ", error);
      return { success: false, message: "Error updating shift" };
    }
  };
  

  const deleteShift = async (shiftId) => {
    try {
      const shiftDocRef = doc(db, "shifts", shiftId);
      await deleteDoc(shiftDocRef);

      setShifts(shifts.filter((shift) => shift.id !== shiftId));

      return { success: true, message: "Shift deleted successfully" };
    } catch (error) {
      console.error("Error deleting shift: ", error);
      return { success: false, message: "Error deleting shift" };
    }
  };

  const getEmployeeWorkingOnDate = (date) => {
    console.log("Date received:", date);
    const formattedDate = date.toISOString().split("T")[0];
    console.log("Formatted date:", formattedDate);
    console.log("Current shifts:", shifts);

    const workingEmployeeIds = shifts
      .filter((shift) => {
        console.log(
          "Comparing shift date:",
          shift.date,
          "with formatted date:",
          formattedDate
        );
        return shift.date === formattedDate;
      })
      .map((shift) => shift.employeeId);

    console.log("Working employee IDs:", workingEmployeeIds);
    console.log("All employees:", employees);

    return employees.filter((employee) =>
      workingEmployeeIds.includes(employee.id)
    );
  };

  const changeSelectedDate = (date) => {
    setSelectedDate(date);
    fetchShiftsForDate(date);
  };

  const updateBusinessHours = async (startTime, endTime) => {
    setBusinessHours({ startTime, endTime, duration });
  };

  // Load initial data
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch shifts whenever selected date changes
  useEffect(() => {
    if (selectedDate) {
      fetchShiftsForDate(selectedDate);
    }
  }, [selectedDate]);

  const value = {
    employees,
    shifts,
    selectedDate,
    businessHours,
    loading,
    fetchEmployees,
    fetchShiftsForDate,
    addShift,
    updateShift,
    deleteShift,
    getEmployeeWorkingOnDate,
    changeSelectedDate,
    updateBusinessHours,
  };
  return (
    <RostersContext.Provider value={value}>{children}</RostersContext.Provider>
  );
};

export default RostersContext;
