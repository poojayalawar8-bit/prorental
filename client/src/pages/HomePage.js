import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getProducts({ sort: 'newest' });
        if (data.products) {
          setFeaturedProducts(data.products.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const categories = [
    { name: 'Cameras & Optics', icon: '📷' },
    { name: 'Outdoor & Sports', icon: '🏕️' },
    { name: 'Tools & Equipment', icon: '🛠️' },
    { name: 'Electronics', icon: '💻' },
    { name: 'Gaming & Tech', icon: '🎮' },
    { name: 'Vehicles & Mobility', icon: '🛴' },
    { name: 'Party & Events', icon: '🎉' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            Peer-to-Peer Rental Platform
          </div>
          <h1 className="hero-title">
            Rent Anything, <span className="highlight-text">Anywhere</span> with ProRental.
          </h1>
          <p className="hero-description">
            Access high-end cameras, outdoor gear, power tools, electronics, and vehicles without
            the steep purchase price. Rent directly from trusted owners in your community.
          </p>

          {/* Search Form */}
          <form className="hero-search-box" onSubmit={handleSearchSubmit}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search cameras, drones, tents, power tools, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="btn btn-primary hero-search-btn">
              Find Rental
            </button>
          </form>

          {/* Quick CTA Buttons */}
          <div className="hero-action-links">
            <Link to="/products" className="btn btn-secondary">
              Browse All Listings
            </Link>
            <Link to="/owner-dashboard" className="btn btn-outline-white">
              List Your Gear & Earn
            </Link>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="categories-strip">
        <div className="container">
          <div className="categories-scroll">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="category-pill-card"
              >
                <span className="category-pill-icon">{cat.icon}</span>
                <span className="category-pill-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gear Section */}
      <section className="featured-section container">
        <div className="section-header">
          <div>
            <span className="section-subtitle">Top-Rated Equipment</span>
            <h2 className="section-title">Explore Available Gear</h2>
          </div>
          <Link to="/products" className="view-all-link">
            View All Items →
          </Link>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="skeleton-card"></div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state-box">
            <p>No products currently available.</p>
            <Link to="/owner-dashboard" className="btn btn-primary">
              List the first product
            </Link>
          </div>
        )}
      </section>

      {/* Rental Status Flow Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="text-center section-header-centered">
            <span className="section-subtitle">Clear & Transparent Process</span>
            <h2 className="section-title">How ProRental Status Flow Works</h2>
            <p className="section-desc">
              Every rental follows a structured lifecycle to ensure accountability for both renters and owners.
            </p>
          </div>

          <div className="flow-steps-grid">
            {/* Step 1 */}
            <div className="flow-card">
              <div className="flow-step-num">01</div>
              <div className="flow-icon">📝</div>
              <h3 className="flow-title">1. Request Rental</h3>
              <p className="flow-desc">
                Select your required rental dates. The system automatically computes total price and submits a <strong>Pending</strong> request to the owner.
              </p>
              <div className="flow-badge-preview">
                <span className="badge badge-pending">
                  <span className="badge-dot"></span> Pending
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flow-card">
              <div className="flow-step-num">02</div>
              <div className="flow-icon">✅</div>
              <h3 className="flow-title">2. Owner Review</h3>
              <p className="flow-desc">
                The product owner reviews the request on their Owner Dashboard and can either <strong>Approve</strong> or <strong>Reject</strong> the booking.
              </p>
              <div className="flow-badge-preview">
                <span className="badge badge-approved">
                  <span className="badge-dot"></span> Approved
                </span>
                <span className="or-text">or</span>
                <span className="badge badge-rejected">
                  <span className="badge-dot"></span> Rejected
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flow-card">
              <div className="flow-step-num">03</div>
              <div className="flow-icon">🔄</div>
              <h3 className="flow-title">3. Safe Return</h3>
              <p className="flow-desc">
                Once the rental period ends and the gear is handed back, the status transitions to <strong>Returned</strong>, and the item is marked available again.
              </p>
              <div className="flow-badge-preview">
                <span className="badge badge-returned">
                  <span className="badge-dot"></span> Returned
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner container">
        <div className="cta-banner-card">
          <div className="cta-content">
            <h2 className="cta-heading">Ready to Start Renting or Listing?</h2>
            <p className="cta-sub">
              Join thousands of creators, adventurers, and handy hobbyists sharing gear every day.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
              <Link to="/products" className="btn btn-outline-white btn-lg">
                Browse Rental Items
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
