import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "./FirebaseConfig";
// StaffContext.jsx
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

  useEffect(() => {
    const q = query(collection(db, "employees"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const staffMembers = [];
        querySnapshot.forEach((doc) => {
          staffMembers.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setStaff(staffMembers);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching staff: ", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addStaffMember = async (staffData) => {
    try {
      await addDoc(collection(db, "employees"), {
        ...staffData,
        createdAt: new Date(),
      });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateStaffMember = async (id, updates) => {
    try {
      const staffRef = doc(db, "employees", id);
      await updateDoc(staffRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const deleteStaffMember = async (id) => {
    try {
      await deleteDoc(doc(db, "employees", id));
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    staff,
    loading,
    error,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
  };

  return (
    <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
  );
};
