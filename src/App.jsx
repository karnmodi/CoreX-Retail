import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import PrivateRoute from "./configs/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import DashboardManager from "./pages/DashboardManager";
import DashboardStaff from "./pages/DashboardStaff";
import { AuthProvider } from "./configs/AuthContext";
import DashboardAdmin from "./pages/0.admin/DashboardAdmin";
import navLinksAdmin from "./components/NavLinks/navLinksAdmin";
import MainLayout from "./configs/MainLayout";
import { StaffProvider } from "./configs/StaffContext";
import { RosterProvider } from "./configs/RostersContext";
import { TooltipProvider } from "./components/ui/tooltip";
import ManageStaffPage from "./pages/1.Staff_Management/ManageStaff";
import Add_Update_StaffPage from "./pages/1.Staff_Management/Add_UpdateStaff";
import RemoveStaff from "./pages/1.Staff_Management/Remove_Staff";
import RosterManagementPage from "@/pages/2.Rosters_Management/ManageRosters";
import RosterApprovalRequest from "@/pages/2.Rosters_Management/requestApproval";
import ViewInventory from "@/pages/3.Invenotry_Management/viewInventory.jsx";
import CreateProducts from "@/pages/3.Invenotry_Management/CreateProduct.jsx";

function App() {
  const logoSrc = "/assets/WebsiteLogo.jpg";

  const router = createBrowserRouter([
    {
      // ! Home Page Route
      path: "/",
      element: (
        <>
          <Header navLinks={[{ to: "/login", label: "Login" }]} />
          <Home />
        </>
      ),
    },
    {
      // ! Login Page Route
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
      // ! Admin Dashboard Route
      path: "/dashboardAdmin",
      element: (
        <PrivateRoute>
          <MainLayout logoSrc={logoSrc} navLinks={navLinksAdmin()} />
        </PrivateRoute>
      ),
      children: [
        { path: "", element: <DashboardAdmin /> }, // Default Dashboard

        {
          // ^ Staff Routes
          path: "staff",
          children: [
            { path: "manage", element: <ManageStaffPage /> },
            { path: "addUpdate", element: <Add_Update_StaffPage /> },
            { path: "addUpdate/:id", element: <Add_Update_StaffPage /> },
            { path: "remove/:id?", element: <RemoveStaff /> },
          ],
        },

        {
          // ^ Roster Routes
          path: "rosters",
          children: [
            { path: "manageRosters", element: <RosterManagementPage /> },
            { path: "approveRosters", element: <RosterApprovalRequest /> },
          ],
        },

        {
          // ^ Inventory Routes
          path: "Inventory",
          children: [
            { path: "ViewInventory", element: <ViewInventory /> },
            { path: "createProducts", element: <CreateProducts /> },
          ],
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
          <RosterProvider>
            <RouterProvider router={router} />
          </RosterProvider>
        </StaffProvider>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
