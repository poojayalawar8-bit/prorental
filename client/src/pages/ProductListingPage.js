import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [availabilityOnly, setAvailabilityOnly] = useState(
    searchParams.get('available') === 'true'
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const categories = [
    'All',
    'Cameras & Optics',
    'Outdoor & Sports',
    'Tools & Equipment',
    'Electronics',
    'Gaming & Tech',
    'Vehicles & Mobility',
    'Party & Events',
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (location) params.location = location;
      if (availabilityOnly) params.availability = 'true';
      if (sort) params.sort = sort;

      const data = await productService.getProducts(params);
      setProducts(data.products || []);
    } catch (err) {
      setError('Failed to load products. Please check if backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, availabilityOnly, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
    // Update URL query params
    const nextParams = {};
    if (search) nextParams.search = search;
    if (category !== 'All') nextParams.category = category;
    if (location) nextParams.location = location;
    if (availabilityOnly) nextParams.available = 'true';
    if (sort !== 'newest') nextParams.sort = sort;
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('');
    setAvailabilityOnly(false);
    setSort('newest');
    setSearchParams({});
    setTimeout(() => {
      productService.getProducts().then((res) => setProducts(res.products || []));
    }, 50);
  };

  return (
    <div className="product-listing-page container">
      {/* Page Title & Breadcrumb */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Explore Rental Equipment</h1>
          <p className="page-subtitle">
            Browse verified rental items available for daily booking
          </p>
        </div>
        <Link to="/owner-dashboard" className="btn btn-primary">
          + List New Item
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="filters-card">
        <form onSubmit={handleSearchSubmit} className="filters-form">
          <div className="filter-input-wrap search-wrap">
            <span className="filter-icon">🔍</span>
            <input
              type="text"
              placeholder="Search gear title, brand, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-input-wrap location-wrap">
            <span className="filter-icon">📍</span>
            <input
              type="text"
              placeholder="Filter by city / area..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-input-wrap sort-wrap">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary filter-submit-btn">
            Filter
          </button>
        </form>

        {/* Category Tabs & Availability Toggle */}
        <div className="category-tabs-row">
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-tab-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="availability-toggle-wrap">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={availabilityOnly}
                onChange={(e) => setAvailabilityOnly(e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-text">Available Only</span>
            </label>
            {(search || category !== 'All' || location || availabilityOnly) && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={handleResetFilters}
              >
                Clear Filters ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid Section */}
      <div className="products-results-header">
        <span className="results-count">
          Showing <strong>{products.length}</strong> {products.length === 1 ? 'item' : 'items'}
          {category !== 'All' && ` in "${category}"`}
        </span>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="skeleton-card"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-catalog-state">
          <div className="empty-icon">📦</div>
          <h3>No Equipment Matches Your Criteria</h3>
          <p>Try adjusting your search terms, clearing category filters, or checking back soon.</p>
          <button onClick={handleResetFilters} className="btn btn-outline">
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListingPage;
