import React, { useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "@/configs/Logout";
import { Menu, X, ChevronDown } from "lucide-react";
import Sidebar from "./sidebar";
import "../css/Header.css";

const Header = ({ navLinks, buttons }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeButtonDropdown, setActiveButtonDropdown] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSidebarNav, setActiveSidebarNav] = useState(null);

  const handleNavClick = (index) => {
    setActiveSidebarNav(index);
    setIsSidebarOpen(true);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-container">
              <a href="/" className="flex items-center">
                <div className="flex justify-center items-center w-14 h-10 mr-2">
                  <img
                    src="/Website_Logo.png"
                    alt="Logo"
                    className="m-3 logo-image h-10 w-10"
                  />
                </div>
                <span className="text-white text-lg leading-tight">
                  CoreX Retail <br />
                  Solutions
                </span>
              </a>
            </div>

            <button
              className={`mobile-menu-btn ${isMenuOpen ? "open" : ""}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Navigation Menu */}
            <nav className={`nav-menu ${isMenuOpen ? "open" : ""}`}>
              <ul className="nav-list">
                {navLinks.map((link, index) => (
                  <li key={index} className="nav-item">
                    <div
                      className="nav-link-container"
                      onMouseEnter={() => setActiveDropdown(null)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <Link
                        to={link.to}
                        className="nav-link"
                        onClick={() => {
                          handleNavClick(index);
                          setIsMenuOpen(false);
                        }}
                      >
                        {link.label}
                      </Link>

                      {/* Submenu for Links */}
                      {link.subItems && activeDropdown === index && (
                        <ul className="dropdown-menu">
                          {link.subItems.map((subItem, subIndex) => (
                            <li
                              key={subIndex}
                              style={{ listStyleType: "none" }}
                            >
                              <Link to={subItem.to} className="dropdown-link">
                                {subItem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
                {/* Buttons with Dropdowns */}
                <div className="header-buttons">
                  {buttons?.map((btn, index) => (
                    <div className="button-dropdown-container" key={index}>
                      <button
                        className={`nav-button ${btn.className}`}
                        onClick={() =>
                          setActiveButtonDropdown(
                            activeButtonDropdown === index ? null : index
                          )
                        }
                        style={{ cursor: "pointer" }}
                      >
                        {btn.label}
                        {btn.subItems && (
                          <ChevronDown className="dropdown-icon" />
                        )}
                      </button>

                      {/* Dropdown Menu for Buttons */}
                      {btn.subItems && activeButtonDropdown === index && (
                        <ul className="dropdown-menu">
                          {btn.subItems.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              <Link to={subItem.to} className="dropdown-link">
                                {subItem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Add Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeNavItem={activeSidebarNav}
        navLinks={navLinks}
      />
    </>
  );
};

export default Header;
