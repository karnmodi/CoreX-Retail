import React, { useEffect } from "react";
import { useAuth } from "../../configs/AuthContext.jsx";
import Header from "../../components/Header.jsx";
import { useNavigate } from "react-router-dom";
import navLinksAdmin from "../../components/navLinksAdmin.jsx";

const DashboardAdmin = () => {
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

  const buttons = user
    ? [
        {
          label: "Logout",
          className: "logout-btn",
          onClick: () => handleLogout(),
        },
      ]
    : [
        {
          label: "Sign Up",
          className: "signup-btn",
          onClick: () => console.log("Go to Sign Up"),
        },
      ];

  return (
    <>
      <Header navLinks={navLinksAdmin()} buttons={buttons} />
      <h1>
        Welcome Admin,{" "}
        {userData?.firstName + " " + userData?.lastName ||
          user?.displayName ||
          "Loading..."}
      </h1>
      <p>Email: {user?.email}</p>
      <button onClick={handleLogout}>Log Out</button>
    </>
  );
};

export default DashboardAdmin;
