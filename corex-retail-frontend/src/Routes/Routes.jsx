import React from "react";
import Home from "../pages/Home";
import Header from "../components/Header";
import PrivateRoute from "../configs/PrivateRoute";
import RoleBasedRoute from "./RoleBasedRoutes.jsx"; // Import RoleBasedRoute
import LoginPage from "../pages/LoginPage";
import DashboardManager from "../pages/DashboardManager";
import DashboardStaff from "../pages/DashboardStaff";
import DashboardAdmin from "../pages/0.admin/DashboardAdmin";
import navLinksAdmin from "../components/NavLinks/navLinksAdmin";
import MainLayout from "../components/MainLayout";
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
import CreateRequests from "../pages/5.More/CreateRequests.jsx";
import ProfilePage from "../pages/5.More/3.Profile.jsx";
import NotificationsPage from "../pages/5.More/4.Notifications.jsx";
import StockUpdateReminder from "../pages/3.Invenotry_Management/StockUpdates.jsx";
import navLinksManager from "../components/NavLinks/navLinksManager.jsx";
import SalesPage from "../pages/4.Sales_Management/Sales.jsx";
import SchedulePage from "../pages/2.Rosters_Management/Schedules.jsx";
import ActivityLogs from "../components/Manager/ActivityLogs.jsx";

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

// Sales management routes for Manager
const salesRoutesManager = [
  { path: "Daily", element: <SalesDaily /> },
  { path: "Dashboard", element: <SalesDashboard /> },
];

// More Routes
const moreRoutes = [
  { path: "reports", element: <ReportsPage /> },
  { path: "requests", element: <RequestsPage /> },
  { path: "profile", element: <ProfilePage /> },
  { path: "notifications", element: <NotificationsPage /> },
];

// Admin dashboard routes
const adminRoutes = {
  path: "/dashboardAdmin",
  element: (
    <RoleBasedRoute allowedRoles={["admin"]} redirectPath="auto">
      <MainLayout logoSrc={logoSrc} navLinks={navLinksAdmin()} />
    </RoleBasedRoute>
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

const managerRoutes = {
  path: "/dashboardManager",
  element: (
    <RoleBasedRoute
      allowedRoles={["store manager", "admin"]}
      redirectPath="auto"
    >
      <MainLayout logoSrc={logoSrc} navLinks={navLinksManager()} />
    </RoleBasedRoute>
  ),
  children: [
    { path: "", element: <DashboardManager /> }, // Default Dashboard
    { path: "schedules", element: <SchedulePage /> },
    { path: "more/requests", element: <RequestsPage /> },
    { path: "more/requests/create", element: <CreateRequests /> },
    { path: "more/activity", element: <ActivityLogs /> },
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
      children: salesRoutesManager,
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
    path: "/dashboardStaff",
    element: (
      <RoleBasedRoute
        allowedRoles={["staff", "store manager", "admin"]}
        redirectPath="auto"
      >
        <DashboardStaff />
      </RoleBasedRoute>
    ),
  },
];

// Combine all routes
const routes = [
  ...publicRoutes,
  adminRoutes,
  managerRoutes,
  ...otherDashboards,
];

export default routes;
