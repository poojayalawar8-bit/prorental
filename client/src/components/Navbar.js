import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <div className="navbar-brand-icon">⚡</div>
          <div className="navbar-brand-text">
            <span>Pro</span>
            <span className="brand-accent">Rental</span>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Navigation Links */}
        <nav className={`navbar-nav ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="navbar-links">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              onClick={closeMobileMenu}
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              onClick={closeMobileMenu}
            >
              Explore Products
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/my-rentals"
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                  onClick={closeMobileMenu}
                >
                  My Rentals
                </NavLink>
                <NavLink
                  to="/owner-dashboard"
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                  onClick={closeMobileMenu}
                >
                  Owner Portal
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin-dashboard"
                    className={({ isActive }) =>
                      isActive ? 'nav-link active admin-link' : 'nav-link admin-link'
                    }
                    onClick={closeMobileMenu}
                  >
                    Admin Panel
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* User Auth Section */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="navbar-user-menu">
                <Link
                  to="/profile"
                  className="user-pill"
                  onClick={closeMobileMenu}
                  title="View Profile"
                >
                  <div className="user-avatar-circle">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-name">{user?.name}</span>
                  {user?.role === 'admin' ? (
                    <span className="user-role-badge badge-admin">Admin</span>
                  ) : (
                    <span className="user-role-badge badge-user">User</span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="navbar-guest-actions">
                <Link
                  to="/login"
                  className="btn btn-sm btn-outline"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-sm btn-primary"
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
