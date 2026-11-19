import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-root">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <span className="brand-icon">⚡</span>
              <span className="brand-name">Pro<span>Rental</span></span>
            </div>
            <p className="footer-tagline">
              The modern peer-to-peer equipment and product rental management platform.
              Rent cameras, outdoor gear, tech, power tools, and vehicles with confidence.
            </p>
            <div className="footer-status-indicator">
              <span className="status-live-dot"></span>
              <span>Platform Status: Operational</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-title">Platform</h4>
            <ul className="footer-list">
              <li><Link to="/products">Browse All Items</Link></li>
              <li><Link to="/owner-dashboard">List Your Equipment</Link></li>
              <li><Link to="/my-rentals">My Rentals</Link></li>
              <li><Link to="/profile">Profile Settings</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-title">Popular Categories</h4>
            <ul className="footer-list">
              <li><Link to="/products?category=Cameras%20%26%20Optics">Cameras & Optics</Link></li>
              <li><Link to="/products?category=Outdoor%20%26%20Sports">Outdoor & Camping</Link></li>
              <li><Link to="/products?category=Tools%20%26%20Equipment">Tools & Machinery</Link></li>
              <li><Link to="/products?category=Electronics">Electronics & Tech</Link></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="footer-col">
            <h4 className="footer-title">Trust & Safety</h4>
            <ul className="footer-list">
              <li><span>🛡️ Verified Owners & Renters</span></li>
              <li><span>📑 Clear Rental Status Flow</span></li>
              <li><span>🔒 JWT Secure Authentication</span></li>
              <li><span>💬 24/7 Rental Protection</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ProRental Management Platform. All rights reserved.</p>
          <div className="footer-bottom-links">
            <span>Built with React.js, Node.js, Express & MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
