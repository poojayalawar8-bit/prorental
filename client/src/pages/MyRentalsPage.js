import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import rentalService from '../services/rentalService';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';

const MyRentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await rentalService.getMyRentals();
      setRentals(data.rentals || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your rental records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleReturnProduct = async (rentalId) => {
    if (!window.confirm('Confirm returning this item to the owner? The status will update to Returned.')) {
      return;
    }

    try {
      setActionLoadingId(rentalId);
      setError('');
      setSuccessMessage('');
      await rentalService.returnRental(rentalId);
      setSuccessMessage('Item marked as Returned! Thank you for using ProRental.');
      await fetchRentals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update rental status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter rentals
  const filteredRentals = rentals.filter((r) => {
    if (statusFilter === 'All') return true;
    return r.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Calculations for stats cards
  const totalCount = rentals.length;
  const pendingCount = rentals.filter((r) => r.status === 'Pending').length;
  const approvedCount = rentals.filter((r) => r.status === 'Approved').length;
  const returnedCount = rentals.filter((r) => r.status === 'Returned').length;

  return (
    <div className="dashboard-layout container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab="my-rentals" />

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title">My Rentals & Bookings</h1>
            <p className="dashboard-subtitle">
              Track the progress, status, and dates of your requested gear rentals.
            </p>
          </div>
          <Link to="/products" className="btn btn-primary">
            + Rent New Gear
          </Link>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard Metric Stat Cards */}
        <div className="stats-cards-grid">
          <div className="stat-card" onClick={() => setStatusFilter('All')}>
            <div className="stat-card-icon icon-blue">📦</div>
            <div className="stat-card-info">
              <span className="stat-val">{totalCount}</span>
              <span className="stat-label">Total Rentals</span>
            </div>
          </div>

          <div className="stat-card" onClick={() => setStatusFilter('Pending')}>
            <div className="stat-card-icon icon-amber">⏳</div>
            <div className="stat-card-info">
              <span className="stat-val">{pendingCount}</span>
              <span className="stat-label">Pending Requests</span>
            </div>
          </div>

          <div className="stat-card" onClick={() => setStatusFilter('Approved')}>
            <div className="stat-card-icon icon-green">✅</div>
            <div className="stat-card-info">
              <span className="stat-val">{approvedCount}</span>
              <span className="stat-label">Active / Approved</span>
            </div>
          </div>

          <div className="stat-card" onClick={() => setStatusFilter('Returned')}>
            <div className="stat-card-icon icon-slate">🔄</div>
            <div className="stat-card-info">
              <span className="stat-val">{returnedCount}</span>
              <span className="stat-label">Returned / Done</span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="tabs-header-bar">
          <div className="tabs-list">
            {['All', 'Pending', 'Approved', 'Returned', 'Rejected'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`tab-btn ${statusFilter === tab ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab}
                {tab === 'Pending' && pendingCount > 0 && (
                  <span className="tab-badge">{pendingCount}</span>
                )}
                {tab === 'Approved' && approvedCount > 0 && (
                  <span className="tab-badge badge-active-count">{approvedCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Rentals Table */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your rental history...</p>
          </div>
        ) : filteredRentals.length > 0 ? (
          <div className="table-card">
            <div className="table-responsive">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Owner</th>
                    <th>Rental Dates</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRentals.map((rental) => {
                    const product = rental.productId || {};
                    const owner = product.ownerId || {};
                    const startFormatted = new Date(rental.startDate).toLocaleDateString();
                    const endFormatted = new Date(rental.endDate).toLocaleDateString();

                    return (
                      <tr key={rental._id}>
                        <td>
                          <div className="table-item-cell">
                            <img
                              src={
                                product.image ||
                                'https://images.unsplash.com/photo-1581291518655-952384377312?auto=format&fit=crop&w=100&q=80'
                              }
                              alt={product.title || 'Gear'}
                              className="table-item-thumb"
                            />
                            <div>
                              {product._id ? (
                                <Link
                                  to={`/products/${product._id}`}
                                  className="table-item-title"
                                >
                                  {product.title}
                                </Link>
                              ) : (
                                <span className="table-item-title text-muted">
                                  Product No Longer Listed
                                </span>
                              )}
                              <span className="table-item-category">
                                {product.category || 'Gear'} • 📍 {product.location || 'Local'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="table-owner-cell">
                            <span className="owner-name">{owner.name || 'Owner'}</span>
                            <span className="owner-email">{owner.email || ''}</span>
                          </div>
                        </td>

                        <td>
                          <div className="table-dates-cell">
                            <span>{startFormatted}</span>
                            <span className="date-arrow">→</span>
                            <span>{endFormatted}</span>
                          </div>
                        </td>

                        <td>
                          <span className="table-price-val">${rental.totalPrice}</span>
                        </td>

                        <td>
                          <StatusBadge status={rental.status} />
                        </td>

                        <td>
                          <div className="table-actions-cell">
                            {product._id && (
                              <Link
                                to={`/products/${product._id}`}
                                className="btn btn-xs btn-outline"
                              >
                                View
                              </Link>
                            )}

                            {rental.status === 'Approved' && (
                              <button
                                type="button"
                                className="btn btn-xs btn-primary"
                                onClick={() => handleReturnProduct(rental._id)}
                                disabled={actionLoadingId === rental._id}
                              >
                                {actionLoadingId === rental._id ? 'Updating...' : 'Return Item'}
                              </button>
                            )}

                            {rental.status === 'Pending' && (
                              <span className="action-hint text-amber">Awaiting Approval</span>
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
        ) : (
          <div className="empty-state-box">
            <div className="empty-icon">📦</div>
            <h3>No Rentals Found</h3>
            <p>
              {statusFilter === 'All'
                ? "You haven't rented any equipment yet. Explore top gear in your area!"
                : `No rentals found with status "${statusFilter}".`}
            </p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Browse Equipment Catalog
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRentalsPage;
