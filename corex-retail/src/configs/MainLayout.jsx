import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import { Menu } from 'lucide-react'; 
import '../css/MainLayout.css';
import Sidebar from '../components/sidebar';

const MainLayout = ({ navLinks, buttons }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSidebarNav, setActiveSidebarNav] = useState(null);

  // Handler for nav click from header
  const handleNavClick = (index) => {
    const clickedNav = navLinks[index];

    // Only open sidebar if the clicked item has subitems
    if (clickedNav?.subItems?.length > 0) {
      setActiveSidebarNav(index);
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
      setActiveSidebarNav(null);
    }
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setActiveSidebarNav(null);
  };

  return (
    <div className="layout-container">
      

      {/* Header */}
      <Header
        
        navLinks={navLinks || []}
        buttons={buttons || []}
        onNavClick={handleNavClick}
      />

      <div className="content-wrapper">
        {/* Sidebar (Responsive) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          activeNavItem={activeSidebarNav}
          navLinks={navLinks}
        />

        {/* Main Content */}
        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
