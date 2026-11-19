import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const fallbackImage =
    'https://images.unsplash.com/photo-1581291518655-952384377312?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="product-card">
      <div className="product-card-image-wrap">
        <img
          src={product.image || fallbackImage}
          alt={product.title}
          className="product-card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
        <div className="product-card-badge-overlay">
          <StatusBadge status={product.availability} type="availability" />
        </div>
        <span className="product-card-category">{product.category}</span>
      </div>

      <div className="product-card-content">
        <div className="product-card-location">
          <span className="icon">📍</span>
          <span>{product.location || 'Local Pickup'}</span>
        </div>

        <h3 className="product-card-title" title={product.title}>
          <Link to={`/products/${product._id}`}>{product.title}</Link>
        </h3>

        <p className="product-card-desc">
          {product.description && product.description.length > 90
            ? `${product.description.substring(0, 90)}...`
            : product.description}
        </p>

        <div className="product-card-footer">
          <div className="product-card-price">
            <span className="price-val">${product.pricePerDay}</span>
            <span className="price-unit">/ day</span>
          </div>

          <div className="product-card-actions">
            <Link
              to={`/products/${product._id}`}
              className="btn btn-sm btn-outline"
            >
              Details
            </Link>
            {product.availability ? (
              <Link
                to={`/rent/${product._id}`}
                className="btn btn-sm btn-primary"
              >
                Rent Now
              </Link>
            ) : (
              <button className="btn btn-sm btn-disabled" disabled>
                Rented
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
