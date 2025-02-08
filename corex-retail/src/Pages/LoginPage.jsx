"use client"; // Ensure this is added at the top

import React, { useState } from "react";
import Header from "../components/Header.jsx";
import Registerr from "../components/Registerr.jsx";
import Loginn from "../components/Loginn.jsx";

function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <Header />

      {!showRegister ? (
        <>
          <Loginn />
          <span>
            Don't have an account?
            <button onClick={() => setShowRegister(true)}>Register Now</button>
          </span>
        </>
      ) : (
        <>
        <Registerr />
        <span>Have an Account?
          <button onClick={() =>  setShowRegister(false)}>Login Now</button>
        </span>
        </>
      )}

    
    </>
  );
}

export default LoginPage;
