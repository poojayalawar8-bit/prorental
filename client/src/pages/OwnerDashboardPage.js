import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import rentalService from '../services/rentalService';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';

const OwnerDashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / Form state for Add / Edit
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    category: 'Cameras & Optics',
    pricePerDay: '',
    image: '',
    location: '',
    availability: true,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const categories = [
    'Cameras & Optics',
    'Outdoor & Sports',
    'Tools & Equipment',
    'Electronics',
    'Gaming & Tech',
    'Vehicles & Mobility',
    'Party & Events',
  ];

  const sampleImages = [
    { label: 'Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
    { label: 'Drone', url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Bike', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Power Tools', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Tent', url: 'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Scooter', url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80' },
  ];

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [prodsRes, reqsRes] = await Promise.all([
        productService.getMyProducts(),
        rentalService.getOwnerRequests(),
      ]);
      setProducts(prodsRes.products || []);
      setRequests(reqsRes.rentals || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load owner dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Open modal for adding a new product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      description: '',
      category: 'Cameras & Optics',
      pricePerDay: '',
      image: sampleImages[0].url,
      location: '',
      availability: true,
    });
    setShowProductModal(true);
  };

  // Open modal for editing existing product
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      category: product.category,
      pricePerDay: product.pricePerDay,
      image: product.image,
      location: product.location,
      availability: product.availability,
    });
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.description || !productForm.pricePerDay || !productForm.image || !productForm.location) {
      setError('Please fill in all product fields');
      return;
    }

    try {
      setModalLoading(true);
      setError('');
      setSuccess('');

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, productForm);
        setSuccess('Product updated successfully!');
      } else {
        await productService.createProduct(productForm);
        setSuccess('Product listed successfully!');
      }

      handleCloseModal();
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete listing "${title}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await productService.deleteProduct(id);
      setSuccess(`Listing "${title}" removed successfully.`);
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Approve rental request
  const handleApprove = async (rentalId) => {
    try {
      setActionLoadingId(rentalId);
      setError('');
      setSuccess('');
      await rentalService.approveRental(rentalId);
      setSuccess('Rental request APPROVED! Item marked as rented.');
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject rental request
  const handleReject = async (rentalId) => {
    try {
      setActionLoadingId(rentalId);
      setError('');
      setSuccess('');
      await rentalService.rejectRental(rentalId);
      setSuccess('Rental request REJECTED.');
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mark rental as returned
  const handleReturn = async (rentalId) => {
    try {
      setActionLoadingId(rentalId);
      setError('');
      setSuccess('');
      await rentalService.returnRental(rentalId);
      setSuccess('Item marked as RETURNED! Product is available for rent again.');
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark rental as returned');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'Pending');
  const activeRentals = requests.filter((r) => r.status === 'Approved');
  const totalEarnings = requests
    .filter((r) => r.status === 'Approved' || r.status === 'Returned')
    .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

  return (
    <div className="dashboard-layout container">
      <Sidebar activeTab="owner-dashboard" />

      <main className="dashboard-main-content">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title">Owner Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage your gear listings and incoming rental requests.
            </p>
          </div>
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            + List New Equipment
          </button>
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

        {/* Stats Grid */}
        <div className="stats-cards-grid">
          <div className="stat-card">
            <div className="stat-card-icon icon-blue">🏷️</div>
            <div className="stat-card-info">
              <span className="stat-val">{products.length}</span>
              <span className="stat-label">Listed Equipment</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon icon-amber">⏳</div>
            <div className="stat-card-info">
              <span className="stat-val">{pendingRequests.length}</span>
              <span className="stat-label">Pending Inbound Requests</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon icon-green">🤝</div>
            <div className="stat-card-info">
              <span className="stat-val">{activeRentals.length}</span>
              <span className="stat-label">Active Rented Items</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon icon-indigo">💰</div>
            <div className="stat-card-info">
              <span className="stat-val">${totalEarnings}</span>
              <span className="stat-label">Total Booking Volume</span>
            </div>
          </div>
        </div>

        {/* Section 1: Incoming Rental Requests */}
        <section className="dashboard-section">
          <div className="section-title-bar">
            <h2>Incoming Rental Requests ({requests.length})</h2>
            <span className="section-desc-inline">
              Review, approve or reject rental requests submitted by renters.
            </span>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading incoming requests...</p>
            </div>
          ) : requests.length > 0 ? (
            <div className="table-card">
              <div className="table-responsive">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>Renter</th>
                      <th>Equipment</th>
                      <th>Dates</th>
                      <th>Total Value</th>
                      <th>Status</th>
                      <th>Action Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => {
                      const prod = req.productId || {};
                      const renter = req.renterId || {};
                      const start = new Date(req.startDate).toLocaleDateString();
                      const end = new Date(req.endDate).toLocaleDateString();

                      return (
                        <tr key={req._id}>
                          <td>
                            <div className="table-renter-cell">
                              <span className="renter-name">{renter.name || 'Renter'}</span>
                              <span className="renter-email">{renter.email || ''}</span>
                            </div>
                          </td>

                          <td>
                            <div className="table-item-cell">
                              <img
                                src={
                                  prod.image ||
                                  'https://images.unsplash.com/photo-1581291518655-952384377312?auto=format&fit=crop&w=80&q=80'
                                }
                                alt={prod.title || 'Product'}
                                className="table-item-thumb"
                              />
                              <span className="table-item-title">{prod.title || 'Item'}</span>
                            </div>
                          </td>

                          <td>
                            <div className="table-dates-cell">
                              <span>{start}</span>
                              <span className="date-arrow">→</span>
                              <span>{end}</span>
                            </div>
                          </td>

                          <td>
                            <span className="table-price-val">${req.totalPrice}</span>
                          </td>

                          <td>
                            <StatusBadge status={req.status} />
                          </td>

                          <td>
                            <div className="table-decision-actions">
                              {req.status === 'Pending' && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-approve"
                                    onClick={() => handleApprove(req._id)}
                                    disabled={actionLoadingId === req._id}
                                    title="Approve rental request"
                                  >
                                    ✓ Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-reject"
                                    onClick={() => handleReject(req._id)}
                                    disabled={actionLoadingId === req._id}
                                    title="Reject rental request"
                                  >
                                    ✕ Reject
                                  </button>
                                </>
                              )}

                              {req.status === 'Approved' && (
                                <button
                                  type="button"
                                  className="btn btn-xs btn-return"
                                  onClick={() => handleReturn(req._id)}
                                  disabled={actionLoadingId === req._id}
                                  title="Confirm item has been returned"
                                >
                                  🔄 Mark Returned
                                </button>
                              )}

                              {req.status === 'Returned' && (
                                <span className="action-hint text-muted">Completed</span>
                              )}

                              {req.status === 'Rejected' && (
                                <span className="action-hint text-muted">Declined</span>
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
            <div className="empty-state-card">
              <p>No incoming rental requests yet. When users request your gear, they will appear here.</p>
            </div>
          )}
        </section>

        {/* Section 2: My Equipment Inventory */}
        <section className="dashboard-section" style={{ marginTop: '2.5rem' }}>
          <div className="section-title-bar">
            <h2>My Listed Inventory ({products.length})</h2>
            <button onClick={handleOpenAddModal} className="btn btn-sm btn-outline">
              + Add Item
            </button>
          </div>

          {products.length > 0 ? (
            <div className="table-card">
              <div className="table-responsive">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>Equipment</th>
                      <th>Category</th>
                      <th>Rate</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div className="table-item-cell">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="table-item-thumb"
                            />
                            <div>
                              <Link
                                to={`/products/${p._id}`}
                                className="table-item-title"
                              >
                                {p.title}
                              </Link>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="category-pill-tag-sm">{p.category}</span>
                        </td>

                        <td>
                          <span className="table-price-val">${p.pricePerDay}</span>
                          <span className="text-muted">/day</span>
                        </td>

                        <td>
                          <span>📍 {p.location}</span>
                        </td>

                        <td>
                          <StatusBadge status={p.availability} type="availability" />
                        </td>

                        <td>
                          <div className="table-actions-cell">
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => handleOpenEditModal(p)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-danger"
                              onClick={() => handleDeleteProduct(p._id, p.title)}
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
          ) : (
            <div className="empty-state-card">
              <p>You haven't listed any equipment for rent yet.</p>
              <button
                onClick={handleOpenAddModal}
                className="btn btn-primary"
                style={{ marginTop: '0.75rem' }}
              >
                List Your First Item
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modal for Add / Edit Product */}
      {showProductModal && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Listing Details' : 'Add New Equipment for Rent'}</h3>
              <button type="button" className="modal-close-btn" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleProductFormSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  Item Title *
                </label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  placeholder="e.g. Sony Alpha A7 IV Mirrorless Camera"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="category">
                    Category *
                  </label>
                  <select
                    id="category"
                    className="form-control"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pricePerDay">
                    Price Per Day ($) *
                  </label>
                  <input
                    type="number"
                    id="pricePerDay"
                    className="form-control"
                    min="1"
                    placeholder="e.g. 45"
                    value={productForm.pricePerDay}
                    onChange={(e) =>
                      setProductForm({ ...productForm, pricePerDay: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location">
                  Location (City / Area) *
                </label>
                <input
                  type="text"
                  id="location"
                  className="form-control"
                  placeholder="e.g. San Francisco, CA or Downtown"
                  value={productForm.location}
                  onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="image">
                  Image URL *
                </label>
                <input
                  type="url"
                  id="image"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  required
                />
                <div className="sample-images-bar">
                  <span className="sample-label">Quick Presets:</span>
                  {sampleImages.map((s) => (
                    <button
                      type="button"
                      key={s.label}
                      className="sample-img-pill"
                      onClick={() => setProductForm({ ...productForm, image: s.url })}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Item Description & Accessories *
                </label>
                <textarea
                  id="description"
                  rows="3"
                  className="form-control"
                  placeholder="Describe specifications, condition, included accessories..."
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-check-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.availability}
                    onChange={(e) =>
                      setProductForm({ ...productForm, availability: e.target.checked })
                    }
                  />
                  <span>Mark as Available for Rent Immediately</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;
