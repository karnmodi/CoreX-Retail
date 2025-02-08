import React from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import Login from "./components/Login";
// import "./App.css"


const router = createBrowserRouter([
  {path: "home",
    element: <><Home /></>
  },
  {path: "/login",
    element: <><Login/></>
  }
])


function App() {

  return (
    <>  
    
      <RouterProvider router = {router}/>
    </>
  )
}

export default App
