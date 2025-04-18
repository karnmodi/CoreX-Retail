import React from "react";
import { Link } from "react-router-dom";
import { PanelRightClose } from "lucide-react";
import "../css/sidebar.css";
import navLinksAdmin from "./NavLinks/navLinksAdmin";
import LogoutButton from "../configs/Logout";

const Sidebar = ({ isOpen, onClose, activeNavItem, navLinks }) => {
  const activeNav = Array.isArray(navLinks)
    ? navLinks.find((_, index) => index === activeNavItem)
    : null;

  const hasSubItems = activeNav?.subItems?.length > 0;

  return (
    <>
      {/* Overlay */}
      {isOpen && hasSubItems && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className="sidebar"
        style={{ width: isOpen && hasSubItems ? "16rem" : "0" }}
      >
        {/* Sidebar Header */}
        {hasSubItems && (
          <div className="sidebar-header gap-5">
            <button
              onClick={onClose}
              className="sidebar-close-btn"
              aria-label="Close sidebar"
            >
              <PanelRightClose size={20} />
            </button>

            <h2 className="sidebar-title">{activeNav?.label} Management</h2>
          </div>
        )}

        {/* Sidebar Content */}
        {hasSubItems && (
          <nav className="sidebar-nav">
            <ul className="sidebar-nav-list">
              {activeNav.subItems.map((subItem, index) => (
                <li key={index}>
                  {subItem.component ? (
                    
                    <div className="sidebar-nav-link w-full flex justify-start py-2 px-4">
                      {subItem.component}
                    </div>
                  ) : (
                    // Render standard links
                    <Link
                      to={subItem.to}
                      className="sidebar-nav-link w-full flex justify-start py-2 px-4 text-white-700 hover:bg-gray-700 transition-colors"
                      onClick={onClose}
                    >
                      {subItem.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}

        <footer className="justify-items-end"></footer>
      </div>
    </>
  );
};

export default Sidebar;
