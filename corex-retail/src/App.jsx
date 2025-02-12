import React from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import LoginPage from "./Pages/LoginPage";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import DashboardManager from "./pages/DashboardManager";
import DashboardStaff from "./pages/DashboardStaff";
import { AuthProvider } from "./configs/AuthContext";
import PrivateRoute from "./configs/PrivateRoute";


const router = createBrowserRouter([
  {path: "/",
    element: <><Home /></>
  },
  {path: "/login",
    element: <><LoginPage /></>
  },
  {path: "/dashboardAdmin",
    element: (
    <>
    <PrivateRoute>
      <DashboardAdmin />
    </PrivateRoute>
    </>
    )
  },
  {path: "/dashboardManager",
    element: (
    <>
    <PrivateRoute>
      <DashboardManager />
    </PrivateRoute>
    </>
    )
  },
  {path: "/dashboardStaff",
    element: (
    <>
    <PrivateRoute>
      <DashboardStaff />
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
