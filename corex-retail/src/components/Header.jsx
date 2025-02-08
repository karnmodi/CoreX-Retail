import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import '../Header.css'; 

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: '/home', label: 'Home' },
    { to: '/login', label: 'Login' },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="logo-container">
            <img src="src\assets\\Website Logo.jpg" alt="Logo" className="logo-image" />
          </div>
          
          <button
            className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
            <ul className="nav-list">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.to} className="nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;