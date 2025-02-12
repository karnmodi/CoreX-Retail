import React, { createContext, useEffect, useState } from "react";
import { useAuth } from "../configs/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Loginn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginwithEmailPassword, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginwithEmailPassword(email, password);
      alert("Login Successful");
    } catch (e) {
      alert("Error : " + e.message);
    }
  };

  useEffect(() => {
    if (userData?.role) {
      if (userData?.role == "admin") {
        navigate("/dashboardAdmin");
      } else if (userData?.role == "store manager") {
        navigate("/dashboardManager");
      } else if (userData?.role == "staff") {
        navigate("/dashboardStaff");
      }
    }
  }, [userData, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in for Faster Checkout
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="Email_Input" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-user text-gray-400"></i>
                </div>
                <Input
                  id="Email_Input"
                  name="email"
                  type="email"
                  required
                  className="pl-10 w-full"
                  placeholder="Email or Phone Number"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="Login_Password_Input" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-400"></i>
                </div>
                <Input
                  id="Login_Password_Input"
                  name="password"
                  type="password"
                  required
                  className="pl-10 w-full"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="RememberMe"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="RememberMe" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary/80">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-2 px-4"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Loginn;