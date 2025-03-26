import React, { useEffect, useState } from "react";
import { useAuth } from "../configs/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";

function Loginn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { PasswordResetEmail, loginwithEmailPassword, userData } =
    useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginwithEmailPassword(email, password);
      alert("Login Successful.");
    } catch (e) {
      alert("Error : " + e.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await PasswordResetEmail(email);
      alert("Reset Password Link sent Successfully");
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
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Sign in to your account
              </h2>
              <p className="text-sm text-gray-600">
                Sign in for Faster Checkout
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-user text-gray-400"></i>
                  </div>
                  <Input
                    id="Email_Input"
                    name="email"
                    type="email"
                    required
                    className="peer w-full pl-5 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-transparent"
                    placeholder=" "
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label
                    htmlFor="Email_Input"
                    className="absolute left-5 -top-2 bg-white px-1 text-gray-600 text-sm transition-all
                             peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                             peer-placeholder-shown:top-2 peer-focus:-top-2 peer-focus:text-gray-600
                             peer-focus:text-sm z-10"
                  >
                    Email or Phone number
                  </label>
                </div>

                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-lock text-gray-400"></i>
                  </div>
                  <Input
                    id="Login_Password_Input"
                    name="password"
                    type="password"
                    required
                    className="peer w-full pl-5 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-transparent"
                    placeholder=" "
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label
                    htmlFor="Login_Password_Input"
                    className="absolute left-5 -top-2 bg-white px-1 text-gray-600 text-sm transition-all
                             peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                             peer-placeholder-shown:top-2 peer-focus:-top-2 peer-focus:text-gray-600
                             peer-focus:text-sm z-10"
                  >
                    Password
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="RememberMe"
                    name="remember-me"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                  />
                  <label
                    htmlFor="RememberMe"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="font-medium text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                Sign in
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loginn;
