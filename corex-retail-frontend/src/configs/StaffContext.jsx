import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../configs/AuthContext";
import {
  getAllEmployees,
  getEmployeeByID,
  postStaff,
  deleteStaff,
  putStaff,
} from "../services/staffAPI";

const StaffContext = createContext();

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaff must be used within a StaffProvider");
  }
  return context;
};

export const StaffProvider = ({ children }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [newStaffCount, setNewStaffCount] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    const loadUsers = async () => {
      try {
        const users = await getAllEmployees(token);
        setStaff(users);
        
        // Calculate new staff in the last month
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        // Assuming each staff member has a 'createdAt' or similar date field
        // If your API returns a different date field, adjust accordingly
        const recentlyAddedStaff = users.filter(user => {
          // Check if createdAt exists and is a valid date string
          if (user.createdAt) {
            const createdDate = new Date(user.createdAt);
            return createdDate >= oneMonthAgo;
          }
          return false;
        });
        
        setNewStaffCount(recentlyAddedStaff.length);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    loadUsers();
  }, [token]);

  const handleRowClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedStaff(null);
  };

  const getStaffById = async (id) => {
    try {
      const staffDetails = await getEmployeeByID(id, token);

      if (!staffDetails || Object.keys(staffDetails).length === 0) {
        console.warn(`No data found for staff ID: ${id}`);
        return null;
      }

      setSelectedStaff(staffDetails);
      return staffDetails;
    } catch (error) {
      console.error("Error fetching staff:", error.message);
      setError(error.message);
      return null;
    }
  };

  const addStaffMember = async (staffData) => {
    try {
      if (!staffData || Object.keys(staffData).length === 0) {
        console.error("Error: staffData is empty or undefined", staffData);
        setError("Staff data is missing");
        return;
      }

      console.log("Adding Staff Member: ", staffData);

      // Add createdAt timestamp if not already present
      const staffWithTimestamp = {
        ...staffData,
        createdAt: staffData.createdAt || new Date().toISOString(),
      };

      const newStaff = await postStaff(staffWithTimestamp, token);

      if (!newStaff) {
        console.error("Error: No response received from API");
        setError("Failed to add staff");
        return;
      }

      setStaff((prevStaff) => [...prevStaff, newStaff]);
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const createdDate = new Date(newStaff.createdAt);
      if (createdDate >= oneMonthAgo) {
        setNewStaffCount(prev => prev + 1);
      }

      console.log("Staff added successfully:", newStaff);
    } catch (error) {
      console.error("Error adding staff:", error.message);
      setError(error.message);
    }
  };

  const updateStaffMember = async (id, updates) => {
    try {
      if (!id || Object.keys(updates).length === 0) {
        console.warn("Warning: Empty update object. Skipping API call.");
        return;
      }
      const updatedData = await putStaff(id, updates, token);

      if (!updatedData) {
        console.warn("Warning: No updated data returned from API");
        return;
      }

      setStaff((prevStaff) =>
        prevStaff.map((staff) =>
          staff.id === id ? { ...staff, ...updatedData } : staff
        )
      );
    } catch (error) {
      console.error("Error loading staff data:", error.message);
      setError(error.message);
    }
  };

  const deleteStaffMember = async (id) => {
    try {
      confirm("Are you sure you want to delete this user?")
        ? [
            await deleteStaff(id, token),
            setStaff(staff.filter((staff) => staff.id !== id)),
            
            // If the deleted staff was added in the last month, update the count
            (() => {
              const deletedStaff = staff.find(s => s.id === id);
              if (deletedStaff && deletedStaff.createdAt) {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                const createdDate = new Date(deletedStaff.createdAt);
                
                if (createdDate >= oneMonthAgo) {
                  setNewStaffCount(prev => Math.max(0, prev - 1));
                }
              }
            })(),
            
            console.log("User deleted from Firestore and Authentication."),
          ]
        : alert("User deletion cancelled.");
    } catch (error) {
      setError(error.message);
    }
  };

  const value = {
    staff,
    loading,
    error,
    selectedStaff,
    getStaffById,
    showDetails,
    handleRowClick,
    closeDetails,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    newStaffCount,
  };

  return (
    <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
  );
};