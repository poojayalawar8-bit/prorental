import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Sidebar = ({ activeTab }) => {
  const { user, isAdmin } = useAuth();

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-user-card">
        <div className="sidebar-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="sidebar-user-details">
          <h4 className="sidebar-user-name">{user?.name || 'User'}</h4>
          <span className="sidebar-user-email">{user?.email || ''}</span>
          <span className={`sidebar-role-tag ${isAdmin ? 'role-admin' : 'role-user'}`}>
            {isAdmin ? 'Platform Admin' : 'Verified Member'}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">User Dashboard</div>
        <NavLink
          to="/my-rentals"
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <span className="sidebar-link-icon">📦</span>
          <span>My Rentals & History</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <span className="sidebar-link-icon">👤</span>
          <span>Profile Settings</span>
        </NavLink>

        <div className="sidebar-section-label">Rental Operations</div>
        <NavLink
          to="/owner-dashboard"
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <span className="sidebar-link-icon">💼</span>
          <span>Owner Dashboard</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <span className="sidebar-link-icon">🔍</span>
          <span>Explore Products</span>
        </NavLink>

        {isAdmin && (
          <>
            <div className="sidebar-section-label admin-label">Administration</div>
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                isActive ? 'sidebar-link active admin-link' : 'sidebar-link admin-link'
              }
            >
              <span className="sidebar-link-icon">🛡️</span>
              <span>Admin Management</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer-hint">
        <p className="hint-title">ProRental Support</p>
        <p className="hint-desc">Need assistance with a rental? We protect both owners & renters.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
