import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

function VerifyEmail() {
  const { token } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    // Prevent double calls in React StrictMode
    if (verificationAttempted.current) return;
    verificationAttempted.current = true;
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await api.verifyEmail(token);
      if (response.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        // Refresh user data if logged in
        if (user) {
          await refreshUser();
        }
      } else {
        setStatus('error');
        setMessage(response.message || 'Verification failed');
      }
    } catch (err) {
      setStatus('error');
      setMessage(
        err.response?.data?.message || 'Invalid or expired verification link'
      );
    }
  };

  const handleContinue = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="form-container">
      <h2>Email Verification</h2>

      {status === 'loading' && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Verifying your email...</p>
        </div>
      )}

      {status === 'success' && (
        <>
          <div className="alert alert-success">
            <strong>✅ Success!</strong>
            <p>{message}</p>
          </div>
          <button onClick={handleContinue} className="btn btn-primary btn-block">
            {user ? 'Go to Dashboard' : 'Login'}
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="alert alert-error">
            <strong>❌ Verification Failed</strong>
            <p>{message}</p>
          </div>
          <p className="form-footer">
            <Link to={user ? '/dashboard' : '/login'}>
              {user ? 'Go to Dashboard' : 'Go to Login'}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export default VerifyEmail;
