import React, { createContext, useEffect, useState } from "react";
import { useAuth } from "../configs/AuthContext";
import { useNavigate } from "react-router-dom";

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
    if(userData?.role){
        if (userData?.role == "admin") {
            navigate("/dashboardAdmin");
          }else if(userData?.role == "store manager"){
            navigate("/dashboardManager");
          }else if(userData?.role == "staff"){
            navigate("/dashboardStaff");
          }
    }
  }, [userData, navigate]);

  return (
    <>
      <div id="LoginForm">
        <form onSubmit={handleLogin}>
          <div className="Tab_Header">
            <h2 className="tab active" id="LoginTab">
              Sign in for Faster Checkout.
            </h2>
          </div>
          <div className="input-container">
            <i className="fa-solid fa-user"></i>
            <input
              id="Email_Input"
              type="text"
              name="Email"
              placeholder="Email or Phone Number"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-container">
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              id="Login_Password_Input"
              name="Password"
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="Re_Pass">
            <div className="RememberMe">
              <input type="checkbox" id="RememberMe" name="RememberMe" />
              <label htmlFor="RememberMe">Remember Me</label>
            </div>
            <a href="" id="ForgotPassword">
              Forgot your Password?
            </a>
          </div>
          <input
            type="submit"
            className="btn BTN_Login"
            id="btn_Login"
            value="Login"
          />{" "}
          <br />
        </form>
      </div>
    </>
  );
}

export default Loginn;
