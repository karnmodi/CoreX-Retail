import React from "react";

function Loginn(){

    return(
        <>
        <div id="LoginForm">
                <form action="" method="post">
                    <div class="Tab_Header">
                        <span class="tab active" id="LoginTab">Sign in for Faster Checkout.</span>
                    </div>

                    <div class="input-container">
                        <i class="fa-solid fa-user"></i>
                        <input id="Username_Input" type="text" name="Email" placeholder="Email or Phone Number"
                            required/>
                    </div>

                    <div class="input-container">
                        <i class="fa-solid fa-lock"></i>
                        <input type="password" id="Login_Password_Input" name="Password" placeholder="Password"
                            required/>
                    </div>

                    <div class="Re_Pass">
                        <div class="RememberMe">
                            <input type="checkbox" id="RememberMe" name="RememberMe"/>
                            <label for="RememberMe">Remember Me</label>
                        </div>
                        <a href="" id="ForgotPassword">Forgot your Password?</a>
                    </div>

                    <input type="submit" class="btn BTN_Login" id="btn_Login" value="Login"/> <br />

                    <span>Don't have account?<button> Register Now</button></span>

                </form>
            </div>
        </>
    );

}


export default Loginn;