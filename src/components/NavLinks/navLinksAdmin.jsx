import React, { Component } from "react";
import LogoutButton from "@/configs/Logout";

const navLinksAdmin = () => [
  { to: "/DashboardAdmin", label: "Dashboard" },
  {
    label: "Staff ",
    to: "#",
    subItems: [
      { to: "./staff/manage", label: "Manage Staff"},
      { to: "./staff/addUpdate", label: "Add/Update Staff"},
      { to: "./staff/remove", label: "Remove Staff" },
    ],
  },
  {
    label: "Rosters",
    to: "#",
    subItems: [
      { to: "./rosters/manageRosters", label: "Manage Rosters" },
      { to: "./rosters/approveRosters", label: "Approve Rosters Requests" },
    ],
  },
  {
    label: "Inventory",
    to: "#",
    subItems: [
      { to: "./Inventory/viewInventory", label: "View Inventory" },
      { to: "./Inventory/createProducts", label: "Product Creation" },
      { to: "./stockUpdates", label: "Stock Updates/Reminders" },
    ],
  },
  {
    label: "Sales",
    to: "#",
    subItems: [
      { to: "./sales/salesDaily", label: "Daily Sales" },
      { to: "./sales/salesTarget", label: "Sales Targets" },
      { to: "./sales/salesOverview", label: "Sales Overview" },
      { to: "./sales/salesDashboard", label: "Sales Dashboard" },
    ],
  },
  {
    label: "Orders",
    to: "#",
    subItems: [
      { to: "./manageOrders", label: "Manage Orders" },
      { to: "./findOrders", label: "Find Orders" },
      { to: "./deleteOrder", label: "Delete Orders" },
    ],
  },
  {
    label: "More",
    to: "#",
    subItems: [
      { to: "./reports", label: "Reports" },
      { to: "./requests", label: "Requests" },
      { to: "./settings", label: "Settings" }, 
      { to: "./notifications", label: "Notifications" },
      { to: "./profile", label: "Profile" },
      { component: <LogoutButton /> },
    ],
  }
  
  
];

export default navLinksAdmin;
