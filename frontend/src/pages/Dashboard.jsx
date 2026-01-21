import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendVerification = async () => {
    setResending(true);
    setMessage('');

    try {
      const response = await api.resendVerification();
      if (response.success) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(response.message || 'Failed to send verification email');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Top Banner - Verification Status */}
      {!user.isVerified && (
        <div className="dashboard-banner">
          <div className="alert alert-warning verification-banner">
            <div>
              <strong>⚠️ Email not verified</strong>
              <p>You need to validate your email to access all features.</p>
            </div>
            <button
              onClick={handleResendVerification}
              className="btn btn-secondary"
              disabled={resending}
            >
              {resending ? 'Sending...' : 'Resend Email'}
            </button>
          </div>
          {message && (
            <div className="alert alert-info" style={{ marginTop: '1rem' }}>
              {message}
            </div>
          )}
        </div>
      )}

      {user.isVerified && (
        <div className="dashboard-banner">
          <div className="alert alert-success">
            <strong>✅ Your email is verified!</strong>
            <p>You have full access to all portal features.</p>
          </div>
        </div>
      )}

      {/* Dashboard Grid Layout */}
      <div className="dashboard-grid">
        {/* User Profile Card */}
        <div className="dashboard-card profile-card">
          <div className="card-header">
            <h2>👋 Welcome Back</h2>
          </div>
          <div className="card-content">
            <div className="info-box">
              <span className="info-label">Email</span>
              <strong className="info-value">{user.email}</strong>
            </div>
            <div className="info-box">
              <span className="info-label">Account Status</span>
              <span
                className={`status-badge ${
                  user.isVerified ? 'status-verified' : 'status-unverified'
                }`}
              >
                {user.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="dashboard-card stats-card">
          <div className="card-header">
            <h2>📊 Quick Stats</h2>
          </div>
          <div className="card-content">
            <div className="stat-item">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <span className="stat-label">Status</span>
                <span className="stat-value">{user.isVerified ? 'Active' : 'Pending'}</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📧</div>
              <div className="stat-info">
                <span className="stat-label">Email Status</span>
                <span className="stat-value">{user.isVerified ? 'Verified' : 'Unverified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Protected Content Card */}
        {user.isVerified && (
          <div className="dashboard-card content-card">
            <div className="card-header">
              <h2>🎉 Protected Content</h2>
            </div>
            <div className="card-content">
              <p>
                This section is only visible to verified users. You now have full
                access to all portal features and can explore everything we have to offer.
              </p>
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Full API Access</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Premium Features</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Priority Support</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Card */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h2>📈 Recent Activity</h2>
          </div>
          <div className="card-content">
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-info">
                <span className="activity-title">Account Created</span>
                <span className="activity-time">Recently</span>
              </div>
            </div>
            {user.isVerified && (
              <div className="activity-item">
                <div className="activity-dot verified"></div>
                <div className="activity-info">
                  <span className="activity-title">Email Verified</span>
                  <span className="activity-time">Completed</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
