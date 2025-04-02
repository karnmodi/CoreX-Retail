import {
  getAllShifts,
  postShift,
  putShift,
  deleteShiftById,
} from "../services/rostersAPI";

import { getAllEmployees } from "../services/staffAPI";
import { useAuth } from "../configs/AuthContext";
import { createContext, useContext, useState, useEffect } from "react";

const RostersContext = createContext();

// Custom hook
export const useRoster = () => {
  const context = useContext(RostersContext);
  if (!context) {
    throw new Error("useRoster must be used within a RosterProvider");
  }
  return context;
};

export const RosterProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [businessHours, setBusinessHours] = useState({
    startTime: "09:00",
    endTime: "20:00",
    duration: 8,
  });

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees(token);
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Fetch all shifts (optionally by date)
  const fetchShiftsForDate = async (date) => {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const data = await getAllShifts(formattedDate, token);
      setShifts(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching shifts:", err);
    }
  };

  // Add new shift
  const addShift = async (employeeId, date, startTime, endTime, shiftNote) => {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const shiftData = {
        employeeId: { uid: employeeId },
        date: formattedDate,
        startTime,
        endTime,
        shiftNote,
      };

      const res = await postShift(shiftData, token);
      setShifts((prev) => [...prev, { id: res.id, ...res.data }]);
      return { success: true, message: res.message };
    } catch (err) {
      console.error("Error adding shift:", err);
      return { success: false, message: err.message };
    }
  };

  // Update existing shift
  const updateShift = async (id, updatedData) => {
    try {
      const res = await putShift(id, updatedData, token);
      setShifts((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...res.updatedData } : s))
      );
      return { success: true, message: res.message };
    } catch (err) {
      console.error("Error updating shift:", err);
      return { success: false, message: err.message };
    }
  };

  // Delete shift
  const deleteShift = async (id) => {
    try {
      await deleteShiftById(id, token);
      setShifts((prev) => prev.filter((s) => s.id !== id));
      return { success: true, message: "Shift deleted successfully" };
    } catch (err) {
      console.error("Error deleting shift:", err);
      return { success: false, message: err.message };
    }
  };

  // Handle selected date change
  const changeSelectedDate = (date) => {
    setSelectedDate(date);
    fetchShiftsForDate(date);
  };

  // Initial load
  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchShiftsForDate(selectedDate);
    }
  }, [selectedDate]);

  return (
    <RostersContext.Provider
      value={{
        employees,
        businessHours,
        shifts,
        selectedDate,
        loading,
        fetchShiftsForDate,
        addShift,
        updateShift,
        deleteShift,
        changeSelectedDate,
      }}
    >
      {children}
    </RostersContext.Provider>
  );
};
