"use client";

import React, { useState } from "react";
import Registerr from "../components/Registerr.jsx";
import Loginn from "../components/Loginn.jsx";

function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="relative min-h-screen bg-gray-100">
      <div className="relative">
        <div className="flex flex-col items-center">
          <Loginn />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
