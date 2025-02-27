import React from 'react';
import { Link } from 'react-router-dom';
import { PanelLeftClose } from 'lucide-react';
import '../css/sidebar.css';
import navLinksAdmin from './NavLinks/navLinksAdmin';
import LogoutButton from "../configs/Logout";

const Sidebar = ({ isOpen, onClose, activeNavItem, navLinks }) => {
  const activeNav = Array.isArray(navLinks) ? navLinks.find((_, index) => index === activeNavItem) : null;


  const hasSubItems = activeNav?.subItems?.length > 0;

  return (
    <>
      {/* Overlay */}
      {isOpen && hasSubItems && <div className="sidebar-overlay" onClick={onClose} />}

      {/* Sidebar */}
      <div className="sidebar" style={{ width: isOpen && hasSubItems ? '16rem' : '0' }}>
        {/* Sidebar Header */}
        {hasSubItems && (
          <div className="sidebar-header">
            <h2 className="sidebar-title">{activeNav?.label} Management</h2>
            <button
              onClick={onClose}
              className="sidebar-close-btn"
              aria-label="Close sidebar"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>
        )}

        {/* Sidebar Content */}
        {hasSubItems && (
          <nav className="sidebar-nav">
            <ul className="sidebar-nav-list">
              {activeNav.subItems.map((subItem, index) => (
                <li key={index}>
                  <Link to={subItem.to} className="sidebar-nav-link" onClick={onClose}>
                    {subItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}



        <footer className='justify-items-end'>
          <LogoutButton></LogoutButton>
        </footer>
      </div>
    </>
  );
};

export default Sidebar;
