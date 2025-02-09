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
    <>
      <div>
        <h2>Register Here</h2>
        <form onSubmit={handleRegister}>
          <div className="input-container">
            <i className="fa-solid fa-user"></i>
            <input
              id="Name"
              type="text"
              name="Name"
              placeholder="First & Last Name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-container">
            <i className="fa-solid fa-user"></i>
            <input
              id="Email"
              type="email"
              name="Email"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-container">
            <i className="fa-solid fa-user"></i>
            <input
              id="ChkEmail"
              type="email"
              name="ChkEmail"
              placeholder="Re-Enter Email Address"
              required
            />
          </div>

          <div className="input-container">
            <i className="fa-solid fa-user"></i>
            <input
              id="Password"
              type="password"
              name="Password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="TCApply">
            <input type="checkbox" id="TCApply" name="TCApply" required />
            <label htmlFor="TCApply">
              I agree to Corex Retails's Terms of Service and Privacy Policy.
            </label>
          </div>

          <button type="submit" className="btn BTN_SignUp" id="btn_Register">
            Register
          </button>
        </form>
      </div>
    </>
  );
};

export default Registerr;
