import React, { Component } from "react";
import LogoutButton from "@/configs/Logout";
import NotificationHeader from "../NotificationHeader";

const navLinksAdmin = () => [
  { to: "/DashboardAdmin", label: "Dashboard" },
  {
    label: "Staff ",
    to: "#",
    subItems: [
      { to: "./staff/manage", label: "Manage Staff" },
      { to: "./staff/addUpdate", label: "Staff Creation" },
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
      { to: "./inventory/viewInventory", label: "View Inventory" },
      { to: "./inventory/createProducts", label: "Product Creation" },
      { to: "./inventory/stockUpdates", label: "Stock Updates/Reminders" },
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
    label: "More",
    to: "#",
    subItems: [
      { to: "./more/reports", label: "Reports" },
      { to: "./more/requests", label: "Requests" },
      { to: "./more/profile", label: "Profile" },
      { to: "./more/notifications", label: "Notifications" },
      { component: <LogoutButton /> },
    ],
  },

];

export default navLinksAdmin;
