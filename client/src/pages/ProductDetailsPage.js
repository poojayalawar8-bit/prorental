import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import rentalService from '../services/rentalService';
import { useAuth } from '../services/AuthContext';
import StatusBadge from '../components/StatusBadge';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rental Request form states
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await productService.getProductById(id);
        setProduct(data.product);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Calculate rental duration and price breakdown
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const days = calculateDays();
  const totalPrice = product ? days * product.pricePerDay : 0;

  const isOwner =
    user && product && product.ownerId &&
    (product.ownerId._id === user._id || product.ownerId === user._id);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError('');
      setBookingSuccess('');

      await rentalService.createRental({
        productId: product._id,
        startDate,
        endDate,
      });

      setBookingSuccess(
        'Rental request submitted successfully! Status is now Pending owner approval.'
      );
    } catch (err) {
      setBookingError(
        err.response?.data?.message || 'Failed to submit rental request. Please try again.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container error-container">
        <div className="alert alert-danger">
          <h3>Product Not Found</h3>
          <p>{error || 'The requested product listing could not be found.'}</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            ← Back to Equipment Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav">
        <Link to="/products">Equipment Catalog</Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-cat">{product.category}</span>
        <span className="crumb-sep">/</span>
        <span className="crumb-active">{product.title}</span>
      </nav>

      <div className="product-details-layout">
        {/* Left Column: Image Gallery & Description */}
        <div className="product-main-info">
          <div className="product-main-image-wrap">
            <img
              src={product.image}
              alt={product.title}
              className="product-main-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://images.unsplash.com/photo-1581291518655-952384377312?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="product-badges-row">
              <span className="category-pill-tag">{product.category}</span>
              <StatusBadge status={product.availability} type="availability" />
            </div>
          </div>

          <div className="product-desc-section">
            <h1 className="product-page-title">{product.title}</h1>
            <div className="product-meta-strip">
              <span className="meta-item">
                <span className="icon">📍</span> {product.location}
              </span>
              <span className="meta-item">
                <span className="icon">👤</span> Listed by {product.ownerId?.name || 'Verified Owner'}
              </span>
              <span className="meta-item">
                <span className="icon">📅</span> Listed {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="desc-content-box">
              <h3>Equipment Description & Specifications</h3>
              <p className="product-full-desc">{product.description}</p>
            </div>

            {/* Rental Policy Assurance */}
            <div className="rental-policy-card">
              <h4>🛡️ ProRental Guarantee</h4>
              <ul>
                <li>Inspected and verified equipment by the listing owner.</li>
                <li>Clear status flow: Pending → Approved → Returned.</li>
                <li>Direct contact with owner upon rental approval.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Rental Action Box */}
        <div className="product-sidebar-card">
          <div className="price-tag-banner">
            <span className="price-number">${product.pricePerDay}</span>
            <span className="price-period">/ day</span>
          </div>

          {bookingSuccess ? (
            <div className="booking-success-box">
              <div className="success-icon">🎉</div>
              <h3>Rental Requested!</h3>
              <p>{bookingSuccess}</p>
              <div className="booking-success-actions">
                <Link to="/my-rentals" className="btn btn-primary btn-block">
                  Go to My Rentals
                </Link>
                <button
                  type="button"
                  className="btn btn-outline btn-block"
                  onClick={() => setBookingSuccess('')}
                >
                  Book Another Date
                </button>
              </div>
            </div>
          ) : isOwner ? (
            <div className="owner-listing-box">
              <div className="owner-badge">Your Listing</div>
              <h4>You own this product</h4>
              <p>You can manage bookings, update details, or remove this listing from your Owner Dashboard.</p>
              <Link to="/owner-dashboard" className="btn btn-primary btn-block">
                Open Owner Dashboard
              </Link>
            </div>
          ) : !product.availability ? (
            <div className="unavailable-listing-box">
              <div className="unavailable-icon">⏳</div>
              <h4>Currently Rented</h4>
              <p>This item is currently out on an active rental. Please check back soon or browse alternatives.</p>
              <Link to="/products" className="btn btn-outline btn-block">
                Browse Other Items
              </Link>
            </div>
          ) : (
            <div className="booking-form-box">
              <h3 className="booking-title">Book This Rental</h3>
              <p className="booking-subtitle">Choose your rental dates below:</p>

              {bookingError && (
                <div className="alert alert-danger">
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="startDate">
                    Rental Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="endDate">
                    Rental End Date (Return)
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                {/* Calculation Breakdown */}
                <div className="price-breakdown">
                  <div className="breakdown-row">
                    <span>Rate</span>
                    <span>${product.pricePerDay} × {days} {days === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div className="breakdown-row total-row">
                    <span>Total Estimated Price</span>
                    <span className="total-highlight">${totalPrice}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Submitting Request...' : 'Request Rental'}
                </button>

                <p className="booking-disclaimer">
                  No immediate payment required. Status will be <strong>Pending</strong> until the owner approves.
                </p>
              </form>
            </div>
          )}

          {/* Owner Quick Profile */}
          <div className="owner-mini-card">
            <h4>Listed by Owner</h4>
            <div className="owner-mini-details">
              <div className="avatar-circle">
                {product.ownerId?.name ? product.ownerId.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div>
                <strong>{product.ownerId?.name || 'Verified Owner'}</strong>
                <span className="verified-tag">✓ Identity Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
