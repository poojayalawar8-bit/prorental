import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import productService from '../services/productService';
import rentalService from '../services/rentalService';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, usersRes, prodsRes, rentsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        productService.getProducts(),
        rentalService.getRentals(),
      ]);

      setStats(statsRes.stats || null);
      setUsers(usersRes.users || []);
      setProducts(prodsRes.products || []);
      setRentals(rentsRes.rentals || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This will also remove their products and rentals.`)) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await adminService.deleteUser(userId);
      setSuccess(`User "${userName}" deleted successfully.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      setError('');
      setSuccess('');
      await adminService.updateUserRole(userId, nextRole);
      setSuccess(`User role updated to ${nextRole}.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteProduct = async (productId, title) => {
    if (!window.confirm(`Delete product "${title}" from platform?`)) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await productService.deleteProduct(productId);
      setSuccess(`Product "${title}" deleted.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleApproveRental = async (rentalId) => {
    try {
      setError('');
      setSuccess('');
      await rentalService.approveRental(rentalId);
      setSuccess('Rental approved successfully.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve rental');
    }
  };

  const handleRejectRental = async (rentalId) => {
    try {
      setError('');
      setSuccess('');
      await rentalService.rejectRental(rentalId);
      setSuccess('Rental rejected.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject rental');
    }
  };

  const handleReturnRental = async (rentalId) => {
    try {
      setError('');
      setSuccess('');
      await rentalService.returnRental(rentalId);
      setSuccess('Rental marked as returned and product freed.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return rental');
    }
  };

  return (
    <div className="dashboard-layout container">
      <Sidebar activeTab="admin-dashboard" />

      <main className="dashboard-main-content">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title">Platform Administration</h1>
            <p className="dashboard-subtitle">
              Comprehensive overview of users, equipment listings, rentals, and metrics.
            </p>
          </div>
          <span className="badge badge-admin-pill">Admin Master Control</span>
        </div>

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        {stats && (
          <div className="stats-cards-grid">
            <div className="stat-card" onClick={() => setActiveTab('users')}>
              <div className="stat-card-icon icon-blue">👥</div>
              <div className="stat-card-info">
                <span className="stat-val">{stats.totalUsers}</span>
                <span className="stat-label">Total Users</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => setActiveTab('products')}>
              <div className="stat-card-icon icon-amber">📦</div>
              <div className="stat-card-info">
                <span className="stat-val">{stats.totalProducts}</span>
                <span className="stat-label">Total Equipment</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => setActiveTab('rentals')}>
              <div className="stat-card-icon icon-green">📑</div>
              <div className="stat-card-info">
                <span className="stat-val">{stats.totalRentals}</span>
                <span className="stat-label">Total Rental Bookings</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => setActiveTab('stats')}>
              <div className="stat-card-icon icon-indigo">💵</div>
              <div className="stat-card-info">
                <span className="stat-val">${stats.totalRevenue}</span>
                <span className="stat-label">Platform Volume</span>
              </div>
            </div>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="tabs-header-bar">
          <div className="tabs-list">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              📊 Overview & Analytics
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Manage Users ({users.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Manage Products ({products.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'rentals' ? 'active' : ''}`}
              onClick={() => setActiveTab('rentals')}
            >
              📑 Manage Rentals ({rentals.length})
            </button>
          </div>
        </div>

        {/* TAB 1: Statistics & Analytics */}
        {activeTab === 'stats' && stats && (
          <div className="admin-analytics-grid">
            <div className="analytics-card">
              <h3>Rental Status Breakdown</h3>
              <div className="status-bars-list">
                <div className="status-bar-row">
                  <span className="bar-label">Pending</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill bg-amber"
                      style={{
                        width: `${stats.totalRentals ? (stats.pendingRentals / stats.totalRentals) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="bar-val">{stats.pendingRentals}</span>
                </div>

                <div className="status-bar-row">
                  <span className="bar-label">Approved</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill bg-green"
                      style={{
                        width: `${stats.totalRentals ? (stats.approvedRentals / stats.totalRentals) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="bar-val">{stats.approvedRentals}</span>
                </div>

                <div className="status-bar-row">
                  <span className="bar-label">Returned</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill bg-slate"
                      style={{
                        width: `${stats.totalRentals ? (stats.returnedRentals / stats.totalRentals) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="bar-val">{stats.returnedRentals}</span>
                </div>

                <div className="status-bar-row">
                  <span className="bar-label">Rejected</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill bg-rose"
                      style={{
                        width: `${stats.totalRentals ? (stats.rejectedRentals / stats.totalRentals) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="bar-val">{stats.rejectedRentals}</span>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <h3>Category Distribution</h3>
              <div className="category-stats-list">
                {stats.categoryStats && stats.categoryStats.length > 0 ? (
                  stats.categoryStats.map((c) => (
                    <div key={c._id} className="category-stat-item">
                      <span className="cat-name">{c._id}</span>
                      <span className="cat-badge">{c.count} items</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No items in categories yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Manage Users */}
        {activeTab === 'users' && (
          <div className="table-card">
            <div className="table-responsive">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Listed Items</th>
                    <th>Rentals Placed</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="table-user-cell">
                          <div className="avatar-circle-sm">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="user-table-name">{u.name}</span>
                        </div>
                      </td>

                      <td>{u.email}</td>

                      <td>
                        <span className={`role-badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                          {u.role}
                        </span>
                      </td>

                      <td>{u.productCount || 0}</td>
                      <td>{u.rentalCount || 0}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>

                      <td>
                        <div className="table-actions-cell">
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => handleToggleRole(u._id, u.role)}
                          >
                            Toggle {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-danger"
                            onClick={() => handleDeleteUser(u._id, u.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Manage Products */}
        {activeTab === 'products' && (
          <div className="table-card">
            <div className="table-responsive">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Owner</th>
                    <th>Rate</th>
                    <th>Location</th>
                    <th>Availability</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const owner = p.ownerId || {};
                    return (
                      <tr key={p._id}>
                        <td>
                          <div className="table-item-cell">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="table-item-thumb"
                            />
                            <span className="table-item-title">{p.title}</span>
                          </div>
                        </td>

                        <td>
                          <span className="category-pill-tag-sm">{p.category}</span>
                        </td>

                        <td>
                          <div className="table-owner-cell">
                            <span>{owner.name || 'Owner'}</span>
                          </div>
                        </td>

                        <td>
                          <span className="table-price-val">${p.pricePerDay}</span>
                          <span className="text-muted">/day</span>
                        </td>

                        <td>{p.location}</td>

                        <td>
                          <StatusBadge status={p.availability} type="availability" />
                        </td>

                        <td>
                          <button
                            type="button"
                            className="btn btn-xs btn-danger"
                            onClick={() => handleDeleteProduct(p._id, p.title)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Manage Rentals */}
        {activeTab === 'rentals' && (
          <div className="table-card">
            <div className="table-responsive">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Renter</th>
                    <th>Owner</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Admin Override</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((r) => {
                    const prod = r.productId || {};
                    const renter = r.renterId || {};
                    const owner = prod.ownerId || {};
                    const start = new Date(r.startDate).toLocaleDateString();
                    const end = new Date(r.endDate).toLocaleDateString();

                    return (
                      <tr key={r._id}>
                        <td>
                          <div className="table-item-cell">
                            <img
                              src={
                                prod.image ||
                                'https://images.unsplash.com/photo-1581291518655-952384377312?auto=format&fit=crop&w=60&q=80'
                              }
                              alt={prod.title || 'Gear'}
                              className="table-item-thumb"
                            />
                            <span className="table-item-title">{prod.title || 'Product'}</span>
                          </div>
                        </td>

                        <td>{renter.name || 'Renter'}</td>
                        <td>{owner.name || 'Owner'}</td>

                        <td>
                          <div className="table-dates-cell">
                            <span>{start}</span>
                            <span>→</span>
                            <span>{end}</span>
                          </div>
                        </td>

                        <td>
                          <span className="table-price-val">${r.totalPrice}</span>
                        </td>

                        <td>
                          <StatusBadge status={r.status} />
                        </td>

                        <td>
                          <div className="table-decision-actions">
                            {r.status === 'Pending' && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-approve"
                                  onClick={() => handleApproveRental(r._id)}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-reject"
                                  onClick={() => handleRejectRental(r._id)}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {r.status === 'Approved' && (
                              <button
                                type="button"
                                className="btn btn-xs btn-return"
                                onClick={() => handleReturnRental(r._id)}
                              >
                                Return
                              </button>
                            )}

                            {(r.status === 'Returned' || r.status === 'Rejected') && (
                              <span className="text-muted action-hint">{r.status}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
