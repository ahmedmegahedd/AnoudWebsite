import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { CompanyProvider } from './context/CompanyContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

import LanguageSwitcher from './components/LanguageSwitcher';
import WhatsAppFloat from './components/WhatsAppFloat';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetailPage from './pages/JobDetailPage';
import About from './pages/About';
import RegisterPage from './pages/RegisterPage';
import AdminLogin from './pages/AdminLogin';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminJobs from './pages/AdminJobs';
import AdminApplicants from './pages/AdminApplicants';
import ApplicantView from './pages/ApplicantView';
import Leads from './pages/Leads';
import UserManagement from './pages/UserManagement';
import { initializeLanguage } from './i18n';

const AppContent: React.FC = () => {

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    initializeLanguage();
  }, []);

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.mobile-menu-overlay') && !target.closest('.mobile-menu-toggle')) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  // Close mobile menu with ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showMobileMenu]);

  // Add a small delay when closing the menu to prevent accidental closures
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowUserMenu(false);
    }, 150); // 150ms delay
    setCloseTimeout(timeout);
  };

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setShowUserMenu(true);
  };

  return (
    <>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            {t('nav.brand')}
          </Link>
          
          {/* Desktop Navigation */}
          <div className="nav-links">
            <Link to="/" className="nav-link">{t('nav.home')}</Link>
            <Link to="/jobs" className="nav-link">{t('nav.jobs')}</Link>
            {/* Show About Us link for non-admin/superadmin users and non-logged-in visitors */}
            {(!user || (user.role !== 'admin' && user.role !== 'superadmin')) && (
              <Link to="/about-us" className="nav-link">{t('nav.about')}</Link>
            )}
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <Link to="/admin" className="nav-link">Admin Page</Link>
            )}
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle mobile menu"
          >
            <span className={`hamburger-line ${showMobileMenu ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${showMobileMenu ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${showMobileMenu ? 'open' : ''}`}></span>
          </button>
          
          <div className="nav-actions">
            {/* Social Media Icons */}
            <div className="social-icons">
              <a 
                href="https://www.instagram.com/anoud_recruitment_services/?igsh=Y2w5dmhrYjh5MDEx" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#E4405F">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              <a 
                href="https://www.facebook.com/Anoud.Recruitment.co" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
                aria-label="Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              <a 
                href="https://www.linkedin.com/company/anoud-recruitment/?viewAsMember=true" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
              <a 
                href="https://www.youtube.com/@AnoudRecruitment" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
                aria-label="YouTube"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              
              <a 
                href="https://www.tiktok.com/@mohammed_megahed" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
            
            <LanguageSwitcher />
            
            {user ? (
              <div 
                style={{ position: 'relative' }} 
                className="user-menu-container"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    background: showUserMenu ? 'var(--bg-secondary)' : 'none',
                    border: showUserMenu ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      style={{ 
                        color: 'var(--text-secondary)',
                        transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </button>
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      {user.name}
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to profile page (you can implement this later)
                        console.log('Profile clicked');
                      }}
                      className="user-dropdown-item"
                    >
                      👤 Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="user-dropdown-item user-dropdown-item-danger"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu-overlay ${showMobileMenu ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            {/* Header with Logo and Close */}
            <div className="mobile-menu-header">
              <div className="mobile-brand">
                <span className="mobile-logo">🚀</span>
                <span className="mobile-brand-text">Anoud Jobs</span>
              </div>
              <button 
                className="mobile-menu-close"
                onClick={() => setShowMobileMenu(false)}
                aria-label="Close mobile menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="mobile-menu-scrollable">
            
            {/* Main Navigation */}
            <div className="mobile-nav-section">
              <h4 className="mobile-section-title">Navigation</h4>
              <div className="mobile-nav-links">
                <Link 
                  to="/" 
                  className="mobile-nav-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="mobile-nav-icon">🏠</span>
                  <span>{t('nav.home')}</span>
                </Link>
                
                <Link 
                  to="/jobs" 
                  className="mobile-nav-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="mobile-nav-icon">💼</span>
                  <span>{t('nav.jobs')}</span>
                </Link>
                
                {/* Show About Us link for non-admin/superadmin users and non-logged-in visitors */}
                {(!user || (user.role !== 'admin' && user.role !== 'superadmin')) && (
                  <Link 
                    to="/about-us" 
                    className="mobile-nav-link"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="mobile-nav-icon">ℹ️</span>
                    <span>{t('nav.about')}</span>
                  </Link>
                )}
                
                {/* Admin Panel for admin users */}
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <Link 
                    to="/admin" 
                    className="mobile-nav-link admin-link"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="mobile-nav-icon">⚙️</span>
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>
            </div>
            
            {/* User Section */}
            {user && (
              <div className="mobile-user-section">
                <h4 className="mobile-section-title">Account</h4>
                <div className="mobile-user-info">
                  <div className="mobile-user-avatar">
                    <span className="user-avatar-text">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="mobile-user-details">
                    <span className="mobile-user-name">{user.name}</span>
                    <span className="mobile-user-role">{user.role}</span>
                  </div>
                </div>
                <button 
                  className="mobile-logout-btn"
                  onClick={() => {
                    setShowMobileMenu(false);
                    logout();
                  }}
                >
                  <span className="mobile-nav-icon">🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
            
            </div> {/* End of mobile-menu-scrollable */}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ paddingTop: 'var(--header-height)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/secure-access" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={<ProtectedRoute requireAdmin={true}><AdminPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/jobs"
            element={<ProtectedRoute requireAdmin={true}><AdminJobs /></ProtectedRoute>}
          />
          <Route
            path="/admin/applicants"
            element={<ProtectedRoute requireAdmin={true}><AdminApplicants /></ProtectedRoute>}
          />
          <Route
            path="/admin/applicants/:jobId"
            element={<ProtectedRoute requireAdmin={true}><ApplicantView /></ProtectedRoute>}
          />
          <Route
            path="/admin/leads"
            element={<ProtectedRoute requireAdmin={true}><Leads /></ProtectedRoute>}
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute requireAdmin={true}><UserManagement /></ProtectedRoute>}
          />
          <Route
            path="/admin/user-management"
            element={<ProtectedRoute requireAdmin={true}><UserManagement /></ProtectedRoute>}
          />
        </Routes>
      </main>


    </>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CompanyProvider>
          <JobProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppContent />
              <WhatsAppFloat />
            </Router>
          </JobProvider>
        </CompanyProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

// Add a global route handler for better compatibility
window.addEventListener('load', () => {
  const intendedRoute = sessionStorage.getItem('intendedRoute');
  if (intendedRoute && intendedRoute !== window.location.pathname) {
    sessionStorage.removeItem('intendedRoute');
    window.history.replaceState(null, '', intendedRoute);
  }
});

export default App;
