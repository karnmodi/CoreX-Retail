import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./FirebaseConfig";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
const API_BASE_URL = import.meta.env.VITE_API_URL;
import { getUserData } from "../services/authAPI";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("jwtToken"));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && token) {
        try {
          const userDetails = await getUserData(token, currentUser.uid);
          console.log("✅ Fetched user data:", userDetails);
          setUserData(userDetails);
        } catch (error) {
          console.error("Error fetching user data:", error.message);
        }
      }else{
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [token]);

  const fetchUserData = async (uid) => {
    try {
      const userRef = doc(db, "employees", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        console.log("No User Data found");
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const loginwithEmailPassword = async (email, password) => {
    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const firebaseToken = await user.getIdToken();
  
      // API call with better error handling
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Adding Accept header to explicitly request JSON
          "Accept": "application/json"
        },
        body: JSON.stringify({ firebaseToken }),
      });
  
      // Check response type before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Log the actual response text for debugging
        const text = await response.text();
        console.error("Received non-JSON response:", text);
        throw new Error(`Expected JSON response but got ${contentType}`);
      }
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Backend login failed");
  
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("firebaseToken", firebaseToken);
  
      setToken(data.token);
      setUserData(data);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const registerWithEmailPassword = async (name, email, password) => {
    try {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = credentials.user;
      setUser(user);

      await updateProfile(user, {
        StaffName: name,
      });

      await setDoc(doc(db, "employees", user.uid), {
        name: name,
        email: email,
        uid: user.uid,
      });

      await fetchUserData(user.uid);
      const token = await user.getIdToken();
      setToken(token);
      localStorage.setItem("firebaseToken", token);

      console.log("User Registered", name, " &", email);
    } catch (error) {
      console.error("Registration Failed:", error.message);
      alert(error.message);
    }
  };

  const PasswordResetEmail = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent successfully!");
    } catch (error) {
      alert(`Error: ${error.code} - ${error.message}`);
    }
  };

  const logout = async () => {
    setUserData(null);
    setToken(null);
    localStorage.removeItem("firebaseToken");
    localStorage.removeItem("jwtToken");
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        token,
        loginwithEmailPassword,
        registerWithEmailPassword,
        PasswordResetEmail,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
