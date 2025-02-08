import React from "react";
import { useAuth } from "../configs/AuthContext";
import Header from "../components/Header.jsx";

const  Dashboard = () => {

    const {user, userData,logout, getCurrentUser} = useAuth();

    return (
        <>
        <Header/>
        <h1>Welcome, {getCurrentUser || "Loading..."} </h1>
        <h1>Welcome, {userData?.name || "Loading..."} </h1>
        <p>{user?.email}</p>
        <button onClick={logout}>LogOut</button>
        </>
    );
};

export default Dashboard;