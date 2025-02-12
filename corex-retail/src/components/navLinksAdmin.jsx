import React from "react";

const navLinksAdmin = () => [
  { to: "/DashboardAdmin", label: "Dashboard" },
  {
    label: "Staff Management",
    to: "#",
    subItems: [
      { to: "/manage_Staff", label: "Manage Staff" },
      { to: "/addUpdate_Staff", label: "Add/Update Staff" },
      { to: "/remove_Staff", label: "Remove Staff" },
    ],
  },
  {
    label: "Rosters Management",
    to: "#",
    subItems: [
      { to: "/createRosters", label: "Create Rosters" },
      { to: "/approveRosters", label: "Approve Rosters Requests" },
      { to: "/editRosters", label: "Edit Rosters" },
    ],
  },
  {
    label: "Inventory Management",
    to: "#",
    subItems: [
      { to: "/viewInventory", label: "View Inventory" },
      { to: "/createProducts", label: "Product Creation" },
      { to: "/stockUpdates", label: "Stock Updates/Reminders" },
    ],
  },
  {
    label: "Sales",
    to: "#",
    subItems: [
      { to: "/dailySales", label: "Daily Sales" },
      { to: "/salesTarget", label: "Sales Targets" },
      { to: "/salesOverview", label: "Sales Overview" },
    ],
  },
  {
    label: "More",
    to: "#",
    subItems: [
      { to: "/reports", label: "Reports" },
      { to: "/requests", label: "Requests" },
      { to: "/settings", label: "Settings" }, //UserRoles and Permissions
      { to: "/notifications", label: "Notifications" },
      { to: "/profile", label: "Profile" },
    ],
  },
];

export default navLinksAdmin;
