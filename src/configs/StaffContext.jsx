import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../configs/AuthContext"; 
import { serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./FirebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { getAllEmployees, getEmployeeByID, postStaff, deleteStaff, putStaff } from "../services/staffAPI";

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
  const {token} = useAuth()

  useEffect(() => {
    if (!token) return;

    const loadUsers = async () => {
      try {
        const users = await getAllEmployees(token); // Fetch from Backend API
        setStaff(users);
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
      const newStaff = await postStaff(staffData, token);
      setStaff([...staff, newStaff]);
      
    } catch (error) {
      setError(error.message);
    }
  };

  const updateStaffMember = async (id, updates) => {
    try {
      await putStaff(id, updates, token);
      setStaff(staff.map((staff) => (staff.id === id ? { ...staff, ...updates } : staff)));
      
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteStaffMember = async (id) => {
    try {

      confirm("Are you sure you want to delete this user?")
        ? [
            await deleteStaff(id, token),
            setStaff(staff.filter((staff) => staff.id !== id)),
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
  };

  return (
    <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
  );
};
