import React, { useState } from "react";
import { useAuth } from "../configs/AuthContext";
import { useNavigate } from "react-router-dom";

const Registerr = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { registerWithEmailPassword } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      registerWithEmailPassword(name, email, password);
      alert("User Created Successfully");
      navigate("/dashboard")
    } 
    catch (error) {
      console.error("Registration Failed:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Register Here</h2>
            </div>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="relative">
                <input
                  id="Name"
                  type="text"
                  name="Name"
                  placeholder="First & Last Name"
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-transparent"
                />
                <label 
                  htmlFor="Name"
                  className="absolute left-4 -top-6 text-gray-600 text-sm transition-all
                           peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                           peer-placeholder-shown:top-2 peer-focus:-top-6 peer-focus:text-gray-600
                           peer-focus:text-sm"
                >
                  First & Last Name
                </label>
              </div>

              <div className="relative">
                <input
                  id="Email"
                  type="email"
                  name="Email"
                  placeholder="Email Address"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-transparent"
                />
                <label 
                  htmlFor="Email"
                  className="absolute left-4 -top-6 text-gray-600 text-sm transition-all
                           peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                           peer-placeholder-shown:top-2 peer-focus:-top-6 peer-focus:text-gray-600
                           peer-focus:text-sm"
                >
                  Email Address
                </label>
              </div>

              <div className="relative">
                <input
                  id="ChkEmail"
                  type="email"
                  name="ChkEmail"
                  placeholder="Re-Enter Email Address"
                  required
                  className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-transparent"
                />
                <label 
                  htmlFor="ChkEmail"
                  className="absolute left-4 -top-6 text-gray-600 text-sm transition-all
                           peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                           peer-placeholder-shown:top-2 peer-focus:-top-6 peer-focus:text-gray-600
                           peer-focus:text-sm"
                >
                  Re-Enter Email Address
                </label>
              </div>

              <div className="relative">
                <input
                  id="Password"
                  type="password"
                  name="Password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-transparent"
                />
                <label 
                  htmlFor="Password"
                  className="absolute left-4 -top-6 text-gray-600 text-sm transition-all
                           peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                           peer-placeholder-shown:top-2 peer-focus:-top-6 peer-focus:text-gray-600
                           peer-focus:text-sm"
                >
                  Password
                </label>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="TCApply"
                    name="TCApply"
                    required
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                  />
                </div>
                <label htmlFor="TCApply" className="ml-2 text-sm text-gray-600">
                  I agree to Corex Retails's Terms of Service and Privacy Policy.
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 text-white font-semibold bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registerr;