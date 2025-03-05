import React, { Component } from "react";
import LogoutButton from "../../configs/Logout";

const navLinksAdmin = () => [
  { to: "/DashboardAdmin", label: "Dashboard" },
  {
    label: "Staff ",
    to: "#",
    subItems: [
      { to: "./staff/manage", label: "Manage Staff"},
      { to: "./staff/addUpdate", label: "Add/Update Staff" },
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
      { to: "./viewInventory", label: "View Inventory" },
      { to: "./createProducts", label: "Product Creation" },
      { to: "./stockUpdates", label: "Stock Updates/Reminders" },
    ],
  },
  {
    label: "Sales",
    to: "#",
    subItems: [
      { to: "./dailySales", label: "Daily Sales" },
      { to: "./salesTarget", label: "Sales Targets" },
      { to: "./salesOverview", label: "Sales Overview" },
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
      { to: "./settings", label: "Settings" }, //UserRoles and Permissions
      { to: "./notifications", label: "Notifications" },
      { to: "./profile", label: "Profile" },
      <LogoutButton></LogoutButton>

    ],
  },
];

export default navLinksAdmin;
