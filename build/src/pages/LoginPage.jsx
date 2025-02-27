"use client";

import React, { useState } from "react";
import Registerr from "../components/Registerr.jsx";
import Loginn from "../components/Loginn.jsx";

function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="relative min-h-screen bg-gray-100">
      <div className="relative">
        {!showRegister ? (
          <div className="flex flex-col items-center">
            <Loginn />
            <div className="mt-6 text-center text-gray-600">
              <span className="mr-2">Don't have an account?</span>
              <button
                onClick={() => setShowRegister(true)}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
              >
                Register Now
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Registerr />
            <div className="mt-6 text-center text-gray-600">
              <span className="mr-2">Have an Account?</span>
              <button
                onClick={() => setShowRegister(false)}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
              >
                Login Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
