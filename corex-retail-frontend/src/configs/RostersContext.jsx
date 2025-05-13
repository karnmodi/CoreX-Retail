import {
  getAllShifts,
  postShift,
  putShift,
  deleteShiftById,
  getUpcomingRostersByStaffId,
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
  const [upcomingShifts, setUpcomingShifts] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [upcomingError, setUpcomingError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const { token, userData } = useAuth();
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

  // Fetch upcoming shifts for a specific staff member
  const fetchUpcomingShifts = useCallback(
    async (staffId, days = 14) => {
      if (!staffId || !token) return;

      setUpcomingLoading(true);
      setUpcomingError(null);

      try {
        const data = await getUpcomingRostersByStaffId(staffId, days, token);
        setUpcomingShifts(data);
        return data;
      } catch (err) {
        console.error("Error fetching upcoming shifts:", err);
        setUpcomingError(err.message || "Failed to fetch upcoming shifts");
        setUpcomingShifts({});
        throw err;
      } finally {
        setUpcomingLoading(false);
      }
    },
    [token]
  );

  // Format upcoming shifts data for easier consumption
  const getFormattedUpcomingShifts = useCallback(() => {
    if (!upcomingShifts?.shiftsByDate) {
      return [];
    }

    return Object.entries(upcomingShifts.shiftsByDate).map(([date, shifts]) => {
      // Format the date for display
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Calculate total hours for the day
      const totalHours = shifts.reduce((total, shift) => {
        const startTime = new Date(`${date}T${shift.startTime}`);
        const endTime = new Date(`${date}T${shift.endTime}`);
        const hours = (endTime - startTime) / (1000 * 60 * 60);
        return total + hours;
      }, 0);

      return {
        date,
        formattedDate,
        shifts,
        totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
        totalShifts: shifts.length,
      };
    });
  }, [upcomingShifts]);

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

  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  }, [token, fetchEmployees]);

  useEffect(() => {
    if (selectedDate && token) {
      fetchShiftsForDate(selectedDate);
    }
  }, [selectedDate, token, fetchShiftsForDate]);

  useEffect(() => {
    if (userData?.uid && token) {
      fetchUpcomingShifts(userData.uid);
    }
  }, [userData, token, fetchUpcomingShifts]);

  useEffect(() => {
    return () => {
      setShifts([]);
      setUpcomingShifts({});
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
        upcomingShifts,
        upcomingLoading,
        upcomingError,
        fetchUpcomingShifts,
        getFormattedUpcomingShifts,
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
