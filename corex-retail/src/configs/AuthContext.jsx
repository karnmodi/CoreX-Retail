import React, { createContext, useContext, useEffect, useState } from "react";
import { auth,db } from "./FirebaseConfig";
import { onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    const [userData, setUserData] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async(currentUser) => {
            setUser(currentUser);
            if(currentUser){
                await fetchUserData(currentUser.uid);
            }
            else{
                setUserData(null)
            }
            setLoading(false)

        });
        return () => unsubscribe();

    }, [])


    const fetchUserData = async(uid) => {
        try{
            const userRef = doc(db,"staffs", uid);
            const userSnap = await getDoc(userRef);
            if(userSnap.exists()){
                setUserData(userSnap.data());
            }
            else{
                console.log("No User Data found");
            }
        }catch(error){
            console.error("Error fetching user data" , error);
        }
    };

    const loginwithEmailPassword = async(email, password) => {
        try{
            await signInWithEmailAndPassword(auth, email, password);
        } catch(error){
            console.error(error.message)
            throw error;
            
        }
    };

    const logout = async () => {
        setUserData(null)
        await signOut(auth);
    };

    const getCurrentUser = () => {
        return auth.currentUser;
      };


    return(
        <AuthContext.Provider value = {{user, userData, loginwithEmailPassword, logout, loading, getCurrentUser}}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext)