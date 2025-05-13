import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../configs/AuthContext";

const RoleBasedRoute = ({ allowedRoles, children, redirectPath = "/" }) => {
  const { userData, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userData || !userData.role) {
    const storedRole = localStorage.getItem("userRole");

    if (storedRole) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (roles.includes(storedRole)) {
        return children;
      }
    }

    console.error("No role information available for user");
    return <Navigate to="/login" replace />;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasRequiredRole = roles.includes(userData.role);

  if (!hasRequiredRole) {
    let fallbackPath = redirectPath;

    if (redirectPath === "auto") {
      switch (userData.role) {
        case "admin":
          fallbackPath = "/dashboardAdmin";
          break;
        case "store manager":
          fallbackPath = "/dashboardManager";
          break;
        case "staff":
          fallbackPath = "/dashboardStaff";
          break;
        default:
          fallbackPath = "/";
      }
    }

    console.log(
      `User has role ${userData.role}, but needs one of ${roles.join(
        ", "
      )}. Redirecting to ${fallbackPath}`
    );
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleBasedRoute;
