import React from "react";
import { auth } from "../configs/Firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";

const Register = () =>{

    const[name, setName] = useState("");
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");

    const handleRegister = async(e) => {
      e.preventDefault();
      try{
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        const user = credentials.user;

        await updateProfile(user,{
          displayName: name,
        });

        

        alert("User Successfully created.");


      } 
      catch(error){
        console.error("Registration Failed :", error.message);
      }
    };




return(
    <>
      <div>
        Register Here
        <form onSubmit= {handleRegister}>
          <div class="input-container">
            <i class="fa-solid fa-user"></i>
            <input
              id="Name"
              type="text"
              name="Name"
              placeholder="First & Last Name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div class="input-container">
            <i class="fa-solid fa-user"></i>
            <input
              id="Email"
              type="email"
              name="Email"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              required
            ></input>
          </div>

          <div class="input-container">
            <i class="fa-solid fa-user"></i>
            <input
              id="ChkEmail"
              type="email"
              name="Email"
              placeholder="Re-Enter Email Address"
              required
            ></input>
          </div>

          <div class="input-container">
            <i class="fa-solid fa-user"></i>
            <input
              id="Password"
              type="password"
              name="Password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            ></input>
          </div>

          <div class="TCApply">
            <input type="checkbox" id="TCApply" name="TCApply"></input>
            <label for="TCApply">
              I agree to Corex Retails's Terms of Service and Privacy Policy.
            </label>
          </div>

          <button
            type="submit"
            class="btn BTN_SignUp"
            id="btn_Register"
            onClick={handleRegister}
          >Register</button>
        </form>
      </div>
    </>
);

}

export default Register;