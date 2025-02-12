import React, { useEffect } from "react";
import { useAuth } from "../../configs/AuthContext.jsx";
import LogoutButton from "../../configs/Logout";
import { useNavigate } from "react-router-dom";


const DashboardAdmin = () => {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <>
      <div className="dashboard-container">
        <h1>
          Welcome Admin,{" "}
          {userData?.firstName + " " + userData?.lastName ||
            user?.displayName ||
            "Loading..."}
        </h1>
        <p>Email: {user?.email}</p>

        <LogoutButton></LogoutButton>
      </div>
    </>
  );
};

export default DashboardAdmin;
