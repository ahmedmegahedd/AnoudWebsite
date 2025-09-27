import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import JobForm from '../components/JobForm';
import JobDomainManager from '../components/JobDomainManager';
import { Job } from '../components/JobList'; // Import Job interface from JobList

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { jobs, loading, error } = useJobs();
  const [activeTab, setActiveTab] = useState('overview');
  const [showJobForm, setShowJobForm] = useState(false);
  const [showDomainManager, setShowDomainManager] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get translated content with fallback
  const getTranslatedContent = (content: string, contentAr?: string) => {
    return i18n.language === 'ar' ? (contentAr || content) : content;
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleCancelJobForm = () => {
    setShowJobForm(false);
    setEditingJob(undefined);
  };

  const handleCreateJob = async (jobData: any) => {
    setIsSubmitting(true);
    try {
      // Job creation logic would go here
      setShowJobForm(false);
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateJob = async (jobData: any) => {
    setIsSubmitting(true);
    try {
      // Job update logic would go here
      setShowJobForm(false);
      setEditingJob(undefined);
    } catch (error) {
      console.error('Error updating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (window.confirm(`${t('admin.dashboard.confirmDelete')} "${getTranslatedContent(jobTitle)}"?`)) {
      try {
        // Job deletion logic would go here
        console.log('Job deleted:', jobId);
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };


  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            {t('common.loadingDashboard')}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <div className="error-state">
            <div className="error-message">{error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Admin Header */}
      <section className="admin-header">
        <div className="admin-content">
          <div className="flex justify-between items-center">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate('/admin')}
                style={{
                  background: 'var(--text-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ← Back to Admin Hub
              </button>
              <div>
                <h1 className="headline-large">{t('admin.dashboard.title')}</h1>
                <p className="body-large text-secondary">{t('admin.dashboard.managePlatform')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            <div className="card" onClick={() => navigate('/admin/jobs')}>
              <div className="card-body text-center">
                <div className="mb-lg">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '24px',
                    color: 'white'
                  }}>
                    💼
                  </div>
                </div>
                <h3 className="headline-small mb-md">{t('admin.dashboard.actions.manageJobs')}</h3>
                <p className="body-medium text-secondary">
                  {t('admin.dashboard.actions.createEditJobs')}
                </p>
              </div>
            </div>

            <div className="card" onClick={() => navigate('/admin/applicants')}>
              <div className="card-body text-center">
                <div className="mb-lg">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--success)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '24px',
                    color: 'white'
                  }}>
                    👥
                  </div>
                </div>
                <h3 className="headline-small mb-md">{t('admin.dashboard.actions.viewApplicants')}</h3>
                <p className="body-medium text-secondary">
                  {t('admin.dashboard.actions.reviewApplications')}
                </p>
              </div>
            </div>

            <div className="card" onClick={() => navigate('/admin/leads')}>
              <div className="card-body text-center">
                <div className="mb-lg">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--secondary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '24px',
                    color: 'white'
                  }}>
                    📊
                  </div>
                </div>
                <h3 className="headline-small mb-md">Leads CRM</h3>
                <p className="body-medium text-secondary">
                  Manage marketing leads and campaigns
                </p>
              </div>
            </div>

            <div className="card" onClick={() => navigate('/admin/user-management')}>
              <div className="card-body text-center">
                <div className="mb-lg">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--warning)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '24px',
                    color: 'white'
                  }}>
                    ⚙️
                  </div>
                </div>
                <h3 className="headline-small mb-md">Manage Users</h3>
                <p className="body-medium text-secondary">
                  Promote or remove users
                </p>
              </div>
            </div>


            <div className="card" onClick={() => setShowDomainManager(true)}>
              <div className="card-body text-center">
                <div className="mb-lg">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--success)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '24px',
                    color: 'white'
                  }}>
                    🌐
                  </div>
                </div>
                <h3 className="headline-small mb-md">Domain Manager</h3>
                <p className="body-medium text-secondary">
                  Manage unique domain extensions for all jobs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="section" style={{ background: 'var(--background-secondary)' }}>
        <div className="container">
          <h2 className="headline-medium text-center mb-2xl">{t('admin.dashboard.quickOverview')}</h2>
          <div className="grid grid-4">
            <div className="text-center">
              <div className="headline-large mb-sm" style={{ color: 'var(--primary)' }}>
                {jobs.length}
              </div>
              <p className="body-medium text-secondary">{t('admin.dashboard.stats.activeJobs')}</p>
            </div>
            
            <div className="text-center">
              <div className="headline-large mb-sm" style={{ color: 'var(--success)' }}>
                0
              </div>
              <p className="body-medium text-secondary">{t('admin.dashboard.stats.totalApplications')}</p>
            </div>
            
            <div className="text-center">
              <div className="headline-large mb-sm" style={{ color: 'var(--warning)' }}>
                0
              </div>
              <p className="body-medium text-secondary">{t('admin.dashboard.stats.pendingReviews')}</p>
            </div>
            
            <div className="text-center">
              <div className="headline-large mb-sm" style={{ color: 'var(--secondary)' }}>
                0
              </div>
              <p className="body-medium text-secondary">{t('admin.dashboard.stats.companies')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="section">
        <div className="container">
          <div className="flex justify-between items-center mb-xl">
            <h2 className="headline-medium">{t('admin.dashboard.recentJobPostings')}</h2>
            <button 
              onClick={() => navigate('/admin/jobs')}
              className="btn btn-primary btn-small"
            >
              {t('admin.dashboard.viewAllJobs')}
            </button>
          </div>
          
          {jobs.length === 0 ? (
            <div className="empty-state">
              <h3 className="headline-small mb-lg">{t('admin.dashboard.noJobsPosted')}</h3>
              <p className="body-large text-secondary">
                {t('admin.dashboard.startCreating')}
              </p>
              <button 
                onClick={() => navigate('/admin/jobs')}
                className="btn btn-primary mt-lg"
              >
                {t('admin.dashboard.createFirstJob')}
              </button>
            </div>
          ) : (
            <div className="grid grid-2">
              {jobs.slice(0, 4).map(job => (
                <div className="job-card" key={job._id}>
                  {/* Applicant Count Badge */}
                  {job.applicantCount !== undefined && (
                    <div className="applicant-count-badge">
                      <span className="applicant-count-number">{job.applicantCount}</span>
                      <span className="applicant-count-label">
                        {job.applicantCount === 1 ? t('jobs.applicant') : t('jobs.applicants')}
                      </span>
                    </div>
                  )}
                  
                  <div className="job-title">{getTranslatedContent(job.title_en, job.title_ar)}</div>
                  <div className="job-company">{job.company ? getTranslatedContent(job.company.name_en, job.company.name_ar) : t('jobDetail.noCompany')}</div>
                  <div className="job-meta">
                    <span>{getTranslatedContent(job.location_en, job.location_ar)}</span>
                    <span className="job-type">{t(`jobTypes.${job.type.toLowerCase().replace(/\s+/g, '')}`) || job.type}</span>
                    <span>{new Date(job.postedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="job-actions">
                    <button 
                      onClick={() => handleEditJob(job)}
                      className="btn btn-warning btn-small"
                    >
                      {t('common.edit')}
                    </button>
                    <button 
                      onClick={() => handleDeleteJob(job._id, job.title_en)}
                      className="btn btn-error btn-small"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          job={editingJob ? {
            _id: editingJob._id,
            title_en: editingJob.title_en,
            title_ar: editingJob.title_ar,
            company: editingJob.company?._id || '',
            location_en: editingJob.location_en,
            location_ar: editingJob.location_ar,
            type: editingJob.type as 'Full-Time' | 'Part-Time' | 'Remote' | 'Contract',
            salary_en: editingJob.salary_en,
            salary_ar: editingJob.salary_ar,
            experience_en: editingJob.experience_en,
            experience_ar: editingJob.experience_ar,
            description_en: editingJob.description_en,
            description_ar: editingJob.description_ar,
            industry_en: editingJob.industry_en,
            industry_ar: editingJob.industry_ar,
            featured: editingJob.featured || false,
            isActive: editingJob.isActive !== undefined ? editingJob.isActive : true
          } : undefined}
          onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
          onCancel={handleCancelJobForm}
          isSubmitting={isSubmitting}
        />
      )}


      {/* Domain Manager Modal */}
      {showDomainManager && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '95vw',
            maxHeight: '95vh',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem',
              borderBottom: '1px solid var(--border)'
            }}>
              <h2 style={{ margin: 0 }}>🌐 Job Domain Manager</h2>
              <button
                onClick={() => setShowDomainManager(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <JobDomainManager jobs={jobs} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard; 