import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Use the AuthContext login function which handles admin authentication
      const result = await login(email, password);
      
      if (result.success) {
        // Successfully logged in as admin
        navigate('/admin');
      } else {
        // Login failed
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>🔐 Secure Access</h1>
        <p>Authorized personnel only</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Username</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter credentials"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Access Code</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access code"
              required
            />
          </div>

          <button
            type="submit"
            className="admin-login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Verify Access'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 