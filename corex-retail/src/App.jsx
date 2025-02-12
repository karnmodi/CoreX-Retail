import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import LoginPage from "./pages/LoginPage";
import DashboardManager from "./pages/DashboardManager";
import DashboardStaff from "./pages/DashboardStaff";
import ManageStaff from "./pages/Staff_Management/ManageStaff"; // Import ManageStaff
import { AuthProvider } from "./configs/AuthContext";
import PrivateRoute from "./configs/PrivateRoute";
import navLinksAdmin from "./components/NavLinks/navLinksAdmin";
import MainLayout from "./configs/MainLayout";

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
          element: <ManageStaff />,
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
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
