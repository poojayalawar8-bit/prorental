import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../services/productService';
import rentalService from '../services/rentalService';
import { useAuth } from '../services/AuthContext';

const RequestRentalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [notes, setNotes] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
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

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const days = calculateDays();
  const totalPrice = product ? days * product.pricePerDay : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAgreed) {
      setSubmitError('Please agree to the ProRental care & return agreement');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      await rentalService.createRental({
        productId: product._id,
        startDate,
        endDate,
      });
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Failed to submit rental request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Loading rental details...</p>
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

  const isOwner =
    user && product.ownerId &&
    (product.ownerId._id === user._id || product.ownerId === user._id);

  if (isOwner) {
    return (
      <div className="container error-container">
        <div className="auth-card" style={{ maxWidth: '520px', margin: '4rem auto' }}>
          <div className="auth-icon-circle">⚠️</div>
          <h2>Cannot Rent Your Own Item</h2>
          <p>You are listed as the owner of "{product.title}". You can manage this product in your Owner Dashboard.</p>
          <Link to="/owner-dashboard" className="btn btn-primary btn-block">
            Go to Owner Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="request-rental-page container">
      <div className="request-rental-header">
        <Link to={`/products/${id}`} className="back-link">
          ← Back to Product Details
        </Link>
        <h1 className="page-title">Request Rental for {product.title}</h1>
        <p className="page-subtitle">
          Submit your dates to the owner. Status will start as <strong>Pending</strong>.
        </p>
      </div>

      <div className="request-rental-grid">
        {/* Left: Booking Form */}
        <div className="rental-form-card">
          {submitSuccess ? (
            <div className="success-banner-card">
              <div className="success-icon">🎉</div>
              <h2>Rental Request Submitted!</h2>
              <p>
                Your request has been sent to <strong>{product.ownerId?.name || 'the owner'}</strong>.
                You can track the progress and status transitions on your My Rentals dashboard.
              </p>
              <div className="success-actions-row">
                <Link to="/my-rentals" className="btn btn-primary btn-lg">
                  View in My Rentals
                </Link>
                <Link to="/products" className="btn btn-outline btn-lg">
                  Browse More Gear
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rental-request-form">
              <h3>Rental Reservation Details</h3>

              {submitError && (
                <div className="alert alert-danger">
                  <span className="alert-icon">⚠️</span>
                  <span>{submitError}</span>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="startDate">
                    Start Date (Pickup) *
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
                    End Date (Return) *
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
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">
                  Message or Pickup Note (Optional)
                </label>
                <textarea
                  id="notes"
                  rows="3"
                  className="form-control"
                  placeholder="e.g. Shooting an indie film this weekend, looking to pick up Saturday morning..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="form-check-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    required
                  />
                  <span>
                    I agree to return the equipment in good condition and abide by the ProRental Terms of Service.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Request...' : `Confirm & Request Rental ($${totalPrice})`}
              </button>
            </form>
          )}
        </div>

        {/* Right: Summary Card */}
        <div className="rental-summary-card">
          <h3>Rental Summary</h3>
          <div className="summary-item-preview">
            <img
              src={product.image}
              alt={product.title}
              className="summary-thumb"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://images.unsplash.com/photo-1581291518655-952384377312?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <div className="summary-info">
              <h4>{product.title}</h4>
              <span className="summary-category">{product.category}</span>
              <p className="summary-loc">📍 {product.location}</p>
            </div>
          </div>

          <div className="summary-cost-list">
            <div className="summary-row">
              <span>Daily Rate</span>
              <span>${product.pricePerDay} / day</span>
            </div>
            <div className="summary-row">
              <span>Duration</span>
              <span>
                {days} {days === 1 ? 'day' : 'days'} ({startDate} to {endDate})
              </span>
            </div>
            <div className="summary-row">
              <span>Security Deposit</span>
              <span className="text-free">$0.00 (Waived)</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total Rental Cost</span>
              <span className="total-val">${totalPrice}</span>
            </div>
          </div>

          <div className="summary-status-flow-box">
            <h4>Next Status Steps:</h4>
            <div className="status-flow-mini">
              <span className="step-tag active">Pending</span>
              <span className="step-arrow">→</span>
              <span className="step-tag">Approved</span>
              <span className="step-arrow">→</span>
              <span className="step-tag">Returned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestRentalPage;
