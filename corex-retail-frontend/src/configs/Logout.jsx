import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"

const LogoutButton = () => {
  const { logout } = useAuth(); 
  const navigate = useNavigate(); 

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return <Button onClick={handleLogout} className="w-full flex justify-start py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white transition-colors">Logout</Button>;
};

export default LogoutButton;
