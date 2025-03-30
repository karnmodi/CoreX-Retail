import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Button variant="destructive" onClick={handleLogout} size="lg">
      <LogOut className="mr-2 h-5 w-5" />
      Logout
    </Button>
  );
};

export default LogoutButton;
