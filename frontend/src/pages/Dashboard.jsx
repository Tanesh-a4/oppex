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
      {/* Verification Banner */}
      {!user.isVerified && (
        <div className="dashboard-card">
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

      {/* Verified Banner */}
      {user.isVerified && (
        <div className="dashboard-card">
          <div className="alert alert-success">
            <strong>✅ Your email is validated.</strong>
            <p>You can access the full portal.</p>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="dashboard-card">
        <h2>Welcome to your Dashboard</h2>
        <div className="user-info">
          <span>Email</span>
          <strong>{user.email}</strong>
        </div>
        <div className="user-info" style={{ marginTop: '1rem' }}>
          <span>Account Status</span>
          <span
            className={`status-badge ${
              user.isVerified ? 'status-verified' : 'status-unverified'
            }`}
          >
            {user.isVerified ? 'Verified' : 'Pending Verification'}
          </span>
        </div>
      </div>

      {/* Protected Content */}
      {user.isVerified && (
        <div className="dashboard-card">
          <h2>Protected Content</h2>
          <p>
            This section is only visible to verified users. You now have full
            access to all portal features.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
