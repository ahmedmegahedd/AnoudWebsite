import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import './LatestJobs.css';

const LatestJobs: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { featuredJobs, loading } = useJobs();
  const { user } = useAuth();
  const currentLang = i18n.language;

  if (loading) {
    return (
      <section className="latest-jobs-section">
        <div className="container">
          <div className="text-center">
            <div className="loading">
              <div className="spinner"></div>
              {t('jobs.loading')}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredJobs || featuredJobs.length === 0) {
    return null; // Don't show section if no featured jobs
  }

  return (
    <section className="latest-jobs-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            {currentLang === 'ar' ? 'أحدث الوظائف' : 'Latest Jobs'}
          </h2>
          <p className="section-subtitle">
            {currentLang === 'ar' 
              ? 'اكتشف أحدث الفرص الوظيفية المميزة' 
              : 'Discover the latest featured job opportunities'
            }
          </p>
        </div>
        
        <div className="jobs-grid">
          {featuredJobs.slice(0, 6).map((job) => (
            <div key={job._id}>
              {/* Applicant Count Badge - Only visible for admin users */}
              {(user?.role === 'admin' || user?.role === 'superadmin') && job.applicantCount !== undefined && (
                <div className="applicant-count-badge">
                  <span className="applicant-count-number">{job.applicantCount}</span>
                  <span className="applicant-count-label">
                    {job.applicantCount === 1 ? t('jobs.applicant') : t('jobs.applicants')}
                  </span>
                </div>
              )}
              
              <div className="job-card">
                <div className="job-card-content">
                  <h3 className="job-title">
                    {currentLang === 'ar' ? job.title_ar : job.title_en}
                  </h3>
                  <div className="job-location">
                    <span className="location-icon">📍</span>
                    <span className="location-text">
                      {currentLang === 'ar' ? job.location_ar : job.location_en}
                    </span>
                  </div>
                  <Link 
                    to={`/jobs/${job._id}`} 
                    className="view-details-btn"
                  >
                    {currentLang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="view-all-container">
          <Link to="/jobs" className="view-all-btn">
            {currentLang === 'ar' ? 'عرض جميع الوظائف' : 'View All Jobs'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestJobs;
