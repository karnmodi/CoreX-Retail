import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  return user
    ? children
    : (alert("Please Login First"), (<Navigate to="/login" />));
};

export default PrivateRoute;
