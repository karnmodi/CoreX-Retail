import React, { useEffect } from "react";
import { useAuth } from "../configs/AuthContext";
import Header from "../components/Header.jsx";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { user, userData, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <>
            <Header />
            <h1>Welcome, {userData?.name || user?.displayName || "Loading..."}</h1>
            <p>Email: {user?.email}</p>
            <button onClick={handleLogout}>Log Out</button>
        </>
    );
};

export default Dashboard;
