import {
  getAllShifts,
  postShift,
  putShift,
  deleteShiftById,
} from "../services/rostersAPI";

import { getAllEmployees } from "../services/staffAPI";
import { useAuth } from "../configs/AuthContext";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

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
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const { token } = useAuth();
  const [businessHours, setBusinessHours] = useState({
    startTime: "09:00",
    endTime: "20:00",
    duration: 8,
  });

  // Fetch all employees
  const fetchEmployees = useCallback(async () => {
    if (!token) return;

    try {
      const data = await getAllEmployees(token);
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.message || "Failed to fetch employees");
    }
  }, [token]);

  // Fetch all shifts (optionally by date)
  const fetchShiftsForDate = useCallback(
    async (date) => {
      if (!date || !token) return;

      // Format the date string
      const formattedDate = date.toISOString().split("T")[0];

      // Check if we've already fetched this date recently (within the last minute)
      if (
        lastFetched &&
        lastFetched.date === formattedDate &&
        Date.now() - lastFetched.timestamp < 60000
      ) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getAllShifts(formattedDate, token);
        setShifts(data || []);
        setLastFetched({
          date: formattedDate,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error("Error fetching shifts:", err);
        setError(err.message || "Failed to fetch shifts");
        setShifts([]);
      } finally {
        setLoading(false);
      }
    },
    [token, lastFetched]
  );

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

      // Update the shifts state if the new shift is for the currently selected date
      if (formattedDate === selectedDate.toISOString().split("T")[0]) {
        setShifts((prev) => [...prev, { id: res.id, ...res.data }]);
      }

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

      // Update the shifts state with the updated shift data
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

      // Remove the deleted shift from the shifts state
      setShifts((prev) => prev.filter((s) => s.id !== id));

      return { success: true, message: "Shift deleted successfully" };
    } catch (err) {
      console.error("Error deleting shift:", err);
      return { success: false, message: err.message };
    }
  };

  // Handle selected date change - using useCallback to prevent recreation on every render
  const changeSelectedDate = useCallback(
    (date) => {
      if (!date) return;

      const newDateStr = date.toISOString().split("T")[0];
      const currentDateStr = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : "";

      // Set the selected date
      if (currentDateStr !== newDateStr) {
        setSelectedDate(date);
      }
    },
    [selectedDate]
  );

  // Initial load - fetch employees when the provider mounts
  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  }, [token, fetchEmployees]);

  // Fetch shifts whenever selectedDate changes
  useEffect(() => {
    if (selectedDate && token) {
      fetchShiftsForDate(selectedDate);
    }
  }, [selectedDate, token, fetchShiftsForDate]);

  // Clear shifts when unmounting to prevent stale data on next mount
  useEffect(() => {
    return () => {
      setShifts([]);
      setLastFetched(null);
    };
  }, []);

  return (
    <RostersContext.Provider
      value={{
        employees,
        businessHours,
        shifts,
        selectedDate,
        loading,
        error,
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
