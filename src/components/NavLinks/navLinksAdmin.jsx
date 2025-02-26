import React, { Component } from "react";
import LogoutButton from "../../configs/Logout";

const navLinksAdmin = () => [
  { to: "/DashboardAdmin", label: "Dashboard" },
  {
    label: "Staff ",
    to: "#",
    subItems: [
      { to: "./manageStaff", label: "Manage Staff"},
      { to: "./addUpdateStaff", label: "Add/Update Staff" },
      { to: "./removeStaff", label: "Remove Staff" },
    ],
  },
  {
    label: "Rosters",
    to: "#",
    subItems: [
      { to: "./createRosters", label: "Create Rosters" },
      { to: "./approveRosters", label: "Approve Rosters Requests" },
      { to: "./editRosters", label: "Edit Rosters" },
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
