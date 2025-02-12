import React from "react";
import Header from "../components/Header";
import { useAuth } from "../configs/AuthContext";

const Home = () => {
  const { user, userData } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    !user && { to: "/login", label: "Login" },
    userData?.role === "admin" && { to: "/dashboardAdmin", label: "Dashboard" },
    userData?.role === "store manager" && { to: "/dashboardManager", label: "Dashboard" },
    userData?.role === "staff" && { to: "/dashboardStaff", label: "Dashboard" },
  ].filter(Boolean);

  const buttons = user
    ? [
        {
          label: "Logout",
          className: "logout-btn",
          onClick: () => console.log("Logging out..."),
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
      <Header navLinks={navLinks} buttons={buttons} />
      <h1>Welcome to Home Page</h1>
    </>
  );
};

export default Home;
