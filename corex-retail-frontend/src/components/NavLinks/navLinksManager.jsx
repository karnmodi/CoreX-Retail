import React, { Component } from "react";
import LogoutButton from "@/configs/Logout";

const navLinksManager = () => [
  { to: "/DashboardManager", label: "Dashboard" },
  {
    label: "Sales",
    to: "#",
    subItems: [
      { to: "./sales/Dashboard", label: "Sales Dashboard" },
      { to: "./sales/Daily", label: "Sales Daily" },
    ],
  },
  { to: "./staff/manage", label: "Staff" },
  { to: "./schedules", label: "Schedules" },
  { to: "./inventory/viewInventory", label: "Inventory" },

  {
    label: "More",
    to: "#",
    subItems: [
      { to: "./reports", label: "Reports" },
      { to: "./more/activity", label: "Activity Logs" },
      { to: "./more/profile", label: "Settings" },
      { to: "./more/notifications", label: "Notifications" },
      { label: "Logout", component: <LogoutButton /> },
    ],
  },
];

export default navLinksManager;
