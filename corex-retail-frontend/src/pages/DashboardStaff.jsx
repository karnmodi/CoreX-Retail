import React, { useEffect } from "react";
import { useAuth } from "../configs/AuthContext.jsx";
import Header from "../components/Header.jsx";
import { useNavigate } from "react-router-dom";

const DashboardStaff = () => {
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

    const navLinks = [
        {to: "/", label: "Home"},
        {to: "/login", label: "Login"}
      ].filter(Boolean)

    return (
        <>
            <Header navLinks={navLinks}/>
            <h1>Welcome Staff, {userData?.firstName + " " + userData?.lastName || user?.displayName || "Loading..."}</h1>
            <p>Email: {user?.email}</p>
            <button onClick={handleLogout}>Log Out</button>
        </>
    );
};

export default DashboardStaff;
