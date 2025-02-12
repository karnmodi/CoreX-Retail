import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, PanelLeftClose } from 'lucide-react';
import '.././css/sidebar.css';

const Sidebar = ({ isOpen, onClose, activeNavItem, navLinks }) => {
  const activeNav = navLinks.find((link, index) => index === activeNavItem);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className="sidebar"
        style={{ width: isOpen ? '16rem' : '0' }}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">{activeNav?.label}</h2>
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            aria-label="Close sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        {/* Sidebar Content */}
        {activeNav?.subItems && (
          <nav className="sidebar-nav">
            <ul className="sidebar-nav-list">
              {activeNav.subItems.map((subItem, index) => (
                <li key={index}>
                  <Link
                    to={subItem.to}
                    className="sidebar-nav-link"
                    onClick={onClose}
                  >
                    {subItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
};

export default Sidebar;