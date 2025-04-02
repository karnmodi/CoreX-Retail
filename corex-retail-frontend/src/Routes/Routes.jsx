import React from "react";
import Home from "../pages/Home";
import Header from "../components/Header";
import PrivateRoute from "../configs/PrivateRoute";
import LoginPage from "../pages/LoginPage";
import DashboardManager from "../pages/DashboardManager";
import DashboardStaff from "../pages/DashboardStaff";
import DashboardAdmin from "../pages/0.admin/DashboardAdmin";
import navLinksAdmin from "../components/NavLinks/navLinksAdmin";
import MainLayout from "../configs/MainLayout";
import ManageStaffPage from "../pages/1.Staff_Management/ManageStaff";
import Add_Update_StaffPage from "../pages/1.Staff_Management/Add_UpdateStaff";
import RemoveStaff from "../pages/1.Staff_Management/Remove_Staff";
import RosterManagementPage from "@/pages/2.Rosters_Management/ManageRosters";
import RosterApprovalRequest from "@/pages/2.Rosters_Management/requestApproval";
import ViewInventory from "../pages/3.Invenotry_Management/ViewInventory.jsx";
import CreateProducts from "@/pages/3.Invenotry_Management/CreateProduct.jsx";
import SalesOverview from "../pages/4.Sales_Management/SalesOverview";
import SalesDaily from "../pages/4.Sales_Management/SalesDaily";
import SalesTargetsPage from "../pages/4.Sales_Management/SalesTarget";
import SalesDashboard from "../pages/4.Sales_Management/SalesDashboard";
import ReportsPage from "../pages/5.More/1.Reports.jsx";
import RequestsPage from "../pages/5.More/2.Requests.jsx";
import ProfilePage from "../pages/5.More/5.Profile.jsx";
import SettingsPage from "../pages/5.More/3.Settings.jsx";
import NotificationsPage from "../pages/5.More/4.Notifications.jsx";
import StockUpdateReminder from "../pages/3.Invenotry_Management/StockUpdates.jsx";

const logoSrc = "/assets/WebsiteLogo.jpg";

// Home and public routes
const publicRoutes = [
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
];

// Staff management routes
const staffRoutes = [
  { path: "manage", element: <ManageStaffPage /> },
  { path: "addUpdate", element: <Add_Update_StaffPage /> },
  { path: "addUpdate/:id", element: <Add_Update_StaffPage /> },
  { path: "remove/:id?", element: <RemoveStaff /> },
];

// Roster management routes
const rosterRoutes = [
  { path: "manageRosters", element: <RosterManagementPage /> },
  { path: "approveRosters", element: <RosterApprovalRequest /> },
];

// Inventory management routes
const inventoryRoutes = [
  { path: "viewInventory", element: <ViewInventory /> },
  { path: "createProducts", element: <CreateProducts /> },
  { path: "stockUpdates", element: <StockUpdateReminder /> },
  { path: "editProduct/:id", element: <CreateProducts /> },
];

// Sales management routes
const salesRoutes = [
  { path: "salesOverview", element: <SalesOverview /> },
  { path: "salesTarget", element: <SalesTargetsPage /> },
  { path: "salesDaily", element: <SalesDaily /> },
  { path: "salesDashboard", element: <SalesDashboard /> },
];

// More Routes
const moreRoutes = [
  {path: "reports", element: <ReportsPage />},
  {path: "requests", element: <RequestsPage />},
  {path: "settings", element: <SettingsPage />},
  {path: "notifications", element: <NotificationsPage />},
  {path: "profile", element: <ProfilePage />},
];

// Admin dashboard routes
const adminRoutes = {
  path: "/dashboardAdmin",
  element: (
    <PrivateRoute>
      <MainLayout logoSrc={logoSrc} navLinks={navLinksAdmin()} />
    </PrivateRoute>
  ),
  children: [
    { path: "", element: <DashboardAdmin /> }, // Default Dashboard
    {
      path: "staff",
      children: staffRoutes,
    },
    {
      path: "rosters",
      children: rosterRoutes,
    },
    {
      path: "inventory",
      children: inventoryRoutes,
    },
    {
      path: "sales",
      children: salesRoutes,
    },
    {
      path: "more",
      children: moreRoutes,
    },
  ],
};

// Other role dashboards
const otherDashboards = [
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
];

// Combine all routes
const routes = [...publicRoutes, adminRoutes, ...otherDashboards];

export default routes;
