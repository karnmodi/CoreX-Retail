import React, { useEffect, useState } from "react";
import { useAuth } from "../configs/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/Loading";

function Loginn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { PasswordResetEmail, loginwithEmailPassword, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginwithEmailPassword(email, password);
      setLoginSuccess(true);
    } catch (e) {
      alert("Error : " + e.message);
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await PasswordResetEmail(email);
      alert("Reset Password Link sent Successfully");
    } catch (e) {
      alert("Error : " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.role) {
      setLoading(true);
      
      if (userData?.role == "admin") {
        navigate("/dashboardAdmin");
      } else if (userData?.role == "store manager") {
        navigate("/dashboardManager");
      } else if (userData?.role == "staff") {
        navigate("/dashboardStaff");
      }
    }
  }, [userData, navigate]);

  if (loginSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

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
                    disabled={loading}
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
                    disabled={loading}
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

              <div className="flex items-center justify-end">

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="font-medium text-blue-500 hover:text-blue-600 transition-colors"
                    disabled={loading}
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    {/* <LoadingSpinner size="sm" /> */}
                    <span className="ml-2">Signing in...</span>
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loginn;