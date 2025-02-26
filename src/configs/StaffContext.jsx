import React, { createContext, useContext, useEffect, useState } from "react";
import { serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
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
import { getFunctions, httpsCallable } from "firebase/functions";
import { createUserWithEmailAndPassword,deleteUser } from "firebase/auth";

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
      const staffDocRef = doc(db,"employees", id);
      const staffDoc = await getDoc(staffDocRef);

      if(staffDoc.exists()){
        return {
        id: staffDoc.id,
        ...staffDoc.data()
        };
      } else{
        return null;
      }
    } catch (error) {
      console.log("Error Fetching Staff by ID : ", error);
      setError(error.message)
      throw error;
      
    }
  } 

  const addStaffMember = async (staffData, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        staffData.email,
        password
      );

      const today = new Date();
      const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

      await setDoc(doc(db, "employees", userCredential.user.uid), {
        ...staffData,
        uid: userCredential.user.uid,
        startDate: formattedDate,
        createdAt  : serverTimestamp(),
      });

      return userCredential.user;
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



const deleteStaffMember = async (id, uid) => {
  try {
    // Delete from Firestore Database
    await deleteDoc(doc(db, "employees", id));

    // Delete from Firebase Authentication
    const functions = getFunctions();
    const deleteUserAccount = httpsCallable(functions, "deleteUserAccount");

    await deleteUserAccount({ uid });

    console.log("User deleted from Firestore and Authentication.");
  } catch (error) {
    console.error("Error deleting user:", error);
    setError(error.message);
    throw error;
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
