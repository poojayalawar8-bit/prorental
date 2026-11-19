import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import authService from '../services/authService';
import Sidebar from '../components/Sidebar';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    if (password && password.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const updateData = { name: name.trim() };
      if (password) {
        updateData.password = password;
      }

      const res = await authService.updateProfile(updateData);
      updateUser(res.user);
      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout container">
      <Sidebar activeTab="profile" />

      <main className="dashboard-main-content">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title">Profile Settings</h1>
            <p className="dashboard-subtitle">
              Manage your personal account details, credentials, and rental profile.
            </p>
          </div>
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

        <div className="profile-layout-grid">
          {/* Left: Profile Overview Card */}
          <div className="profile-card profile-overview-card">
            <div className="profile-avatar-big">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="profile-overview-name">{user?.name}</h2>
            <p className="profile-overview-email">{user?.email}</p>

            <div className="profile-role-pill-wrap">
              <span className={`role-badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                {user?.role === 'admin' ? '🛡️ Administrator' : '👤 Verified Renter / Owner'}
              </span>
            </div>

            <div className="profile-info-list">
              <div className="info-list-item">
                <span className="info-key">User ID:</span>
                <span className="info-value font-mono">{user?._id || 'N/A'}</span>
              </div>
              <div className="info-list-item">
                <span className="info-key">Account Role:</span>
                <span className="info-value text-capitalize">{user?.role}</span>
              </div>
              <div className="info-list-item">
                <span className="info-key">Member Since:</span>
                <span className="info-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Update Form Card */}
          <div className="profile-card profile-form-card">
            <h3 className="card-section-title">Edit Personal Details</h3>
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control form-control-disabled"
                  value={user?.email || ''}
                  disabled
                  title="Email cannot be changed directly"
                />
                <span className="form-hint">Email address is tied to your JWT login.</span>
              </div>

              <div className="form-divider">
                <span>Change Password (Leave blank to keep unchanged)</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-control"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
