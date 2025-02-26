import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./FirebaseConfig";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  // const fetchAllUsers = async () => {
  //   try {
  //     const usersRef = collection(db, "employees");
  //     const snapshot = await getDocs(usersRef);
  //     const usersList = snapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     console.log(usersList);
  //     return usersList;
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //     return [];
  //   }
  // };

  const loginwithEmailPassword = async (email, password) => {
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User Logged In:", userCredentials.user);

      setUser(userCredentials.user);
      //await fetchAllUsers(userCredentials.user.uid);

      return userCredentials.user;
    } catch (error) {
      console.error(error.message);
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
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
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
