import React from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import LoginPage from "./Pages/LoginPage";
import Dashboard from "./Pages/Dashboard";
import { AuthProvider } from "./configs/AuthContext";
import PrivateRoute from "./configs/PrivateRoute";
// import "./App.css"


const router = createBrowserRouter([
  {path: "/",
    element: <><Home /></>
  },
  {path: "/login",
    element: <><LoginPage /></>
  },
  {path: "/dashboard",
    element: (
    <>
    <PrivateRoute adminOnly>
      <Dashboard />
    </PrivateRoute>
    </>
    )
  }
])


function App() {

  return (
    <>  
    
      <AuthProvider>
      <RouterProvider router = {router}/>
      </AuthProvider>
    </>
  )
}

export default App
