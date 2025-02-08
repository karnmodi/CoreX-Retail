import React, { createContext, useState } from "react";
import { useAuth, loginwithEmailPassword } from "../configs/AuthContext";
import { useNavigate } from "react-router-dom";


function Loginn(){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loginwithEmailPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            await loginwithEmailPassword(email,password);
            alert("Login Successful")
            navigate("/dashboard")

        } catch(e){
            alert("Error : " + e.message);
        }
    };



    return(
        <>
        <div id="LoginForm">
                <form onSubmit={handleSubmit}>
                    <div class="Tab_Header">
                        <h2 class="tab active" id="LoginTab">Sign in for Faster Checkout.</h2>
                    </div>

                    <div class="input-container">
                        <i class="fa-solid fa-user"></i>
                        <input id="Email_Input" type="text" name="Email" placeholder="Email or Phone Number"
                            required onChange={(e) => setEmail(e.target.value)}/>
                    </div>

                    <div class="input-container">
                        <i class="fa-solid fa-lock"></i>
                        <input type="password" id="Login_Password_Input" name="Password" placeholder="Password"
                            required onChange={(e) => setPassword(e.target.value)}/>
                    </div>

                    <div class="Re_Pass">
                        <div class="RememberMe">
                            <input type="checkbox" id="RememberMe" name="RememberMe"/>
                            <label for="RememberMe">Remember Me</label>
                        </div>
                        <a href="" id="ForgotPassword">Forgot your Password?</a>
                    </div>

                    <input type="submit" class="btn BTN_Login" id="btn_Login" value="Login"/> <br />

                </form>
            </div>
        </>
    );

}


export default Loginn;