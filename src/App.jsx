import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import LoginPage from "./pages/LoginPage";
import DashboardManager from "./pages/DashboardManager";
import DashboardStaff from "./pages/DashboardStaff";
import { AuthProvider } from "./configs/AuthContext";
import PrivateRoute from "./configs/PrivateRoute";
import navLinksAdmin from "./components/NavLinks/navLinksAdmin";
import MainLayout from "./configs/MainLayout";
import { StaffProvider } from "./configs/StaffContext";
import { TooltipProvider } from "./components/ui/tooltip";
import ManageStaffPage from "./pages/Staff_Management/ManageStaff";
import Add_Update_StaffPage from "./pages/Staff_Management/Add_UpdateStaff";
import RemoveStaff from "./pages/Staff_Management/Remove_Staff";

function App() {
  const logoSrc = "/assets/WebsiteLogo.jpg"; 

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <Header navLinks={[{ to: "/login", label: "Login" }]} />
          <Home />
        </>
      ),
    },
    {
      path: "/login",
      element: (
        <>
          <Header
            navLinks={[
              { to: "/", label: "Home" },
              { to: "/login", label: "Login" },
            ].filter(Boolean)}
          />
          <LoginPage />
        </>
      ),
    },
    {
      path: "/dashboardAdmin",
      element: (
        <PrivateRoute>
          <MainLayout
            logoSrc={logoSrc}
            navLinks={navLinksAdmin()}
          />
        </PrivateRoute>
      ),
      children: [
        {
          path: "manageStaff",
          element: <ManageStaffPage />,
        },
        {
          path: "addUpdateStaff",
          element: <Add_Update_StaffPage />,
        },
        {
          path: "addUpdateStaff/:id",  //for Update Staff - passing the id to fetch the data
          element: <Add_Update_StaffPage />,
        },
        {
          path: "removeStaff",
          element: <RemoveStaff />,
        },

        {
          path: "removeStaff/:id",  //for Delete Staff - passing the id to fetch the data
          element: <RemoveStaff />,
        },
        {
          path: "",
          element: <DashboardAdmin />,
        },
      ],
    },

    {
      path: "/dashboardManager",
      element: (
        <PrivateRoute>
          <DashboardManager />
        </PrivateRoute>
      ),
    },
    {
      path: "/dashboardStaff",
      element: (
        <PrivateRoute>
          <DashboardStaff />
        </PrivateRoute>
      ),
    },
  ]);


  return (
    <AuthProvider>
      <TooltipProvider>
      <StaffProvider>
      <RouterProvider router={router} />
      </StaffProvider>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
