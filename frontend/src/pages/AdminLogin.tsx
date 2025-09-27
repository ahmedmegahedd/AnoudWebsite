import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setError('');

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsRegistering(false);
      return;
    }

    // Validate password length
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsRegistering(false);
      return;
    }

    try {
      console.log('🔧 Attempting admin registration:', { 
        name: registerData.name, 
        email: registerData.email, 
        url: `${API_BASE_URL}${API_ENDPOINTS.ADMIN}/register` 
      });
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          role: 'admin'
        }),
      });

      console.log('🔧 Registration response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Registration successful:', data);
        setError('');
        setShowRegister(false);
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
        alert('Admin account created successfully! You can now login.');
      } else {
        const errorData = await response.json();
        console.log('❌ Registration failed:', response.status, errorData);
        setError(errorData.error || 'Registration failed');
      }
    } catch (err) {
      console.log('❌ Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>🔐 Secure Access</h1>
        <p>Authorized personnel only</p>

        {error && <div className="error-message">{error}</div>}

        {!showRegister ? (
          <>
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

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid #007AFF',
                  color: '#007AFF',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Create Admin Account
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleRegister} className="admin-login-form">
              <div className="form-group">
                <label htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="Enter Gmail address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Enter password (min 6 characters)"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm-password">Confirm Password</label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  required
                />
              </div>

              <button
                type="submit"
                className="admin-login-submit"
                disabled={isRegistering}
              >
                {isRegistering ? 'Creating Account...' : 'Create Admin Account'}
              </button>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setShowRegister(false);
                  setError('');
                  setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #666',
                  color: '#666',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin; 