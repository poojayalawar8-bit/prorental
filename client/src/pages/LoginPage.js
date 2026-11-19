import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/products';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    try {
      setIsSubmitting(true);
      setError('');
      await login({ email: demoEmail, password: demoPass });
      navigate(demoEmail.includes('admin') ? '/admin-dashboard' : '/my-rentals', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Demo login failed. Make sure server is running and database seeded.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">🔐</div>
          <h2 className="auth-title">Welcome Back to ProRental</h2>
          <p className="auth-subtitle">Sign in to manage your rentals and listings</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <div className="label-with-link">
              <label className="form-label" htmlFor="password">
                Password
              </label>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Logins for easy evaluation */}
        <div className="demo-login-box">
          <p className="demo-box-title">⚡ Instant Demo Logins:</p>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="btn btn-sm btn-outline demo-btn"
              onClick={() => handleQuickDemo('john@example.com', 'password123')}
              disabled={isSubmitting}
            >
              👤 Demo Owner / Renter
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline demo-btn"
              onClick={() => handleQuickDemo('admin@prorental.com', 'admin123')}
              disabled={isSubmitting}
            >
              🛡️ Demo Admin
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
