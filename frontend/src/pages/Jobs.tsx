import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import JobList from '../components/JobList';
import JobDetail from '../components/JobDetail';
import ApplicationForm from '../components/ApplicationForm';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useCompanies } from '../context/CompanyContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { Job } from '../components/JobList'; // Import Job interface from JobList

const Jobs: React.FC = () => {
  const { t } = useTranslation();
  const { jobs, loading, error, fetchJobs } = useJobs();
  const { user, token } = useAuth();
  const { companies } = useCompanies();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleViewDetails = (id: string) => {
    const job = jobs.find(j => j._id === id) || null;
    setSelectedJob(job);
    setShowForm(false);
  };

  const handleApply = async (jobId: string) => {
    // Remove authentication requirement - allow anyone to apply
    setShowForm(true);
  };

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      // Add the jobId to the form data
      formData.append('jobId', selectedJob!._id);
      
      // Use the main applications endpoint which handles file uploads
      const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.APPLICATIONS}`;
      console.log('Submitting application to:', apiUrl);
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('API_ENDPOINTS.APPLICATIONS:', API_ENDPOINTS.APPLICATIONS);
      console.log('FormData contents:', {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        education: formData.get('education'),
        selfIntro: formData.get('selfIntro'),
        jobId: formData.get('jobId'),
        resume: formData.get('resume') ? 'File present' : 'No file'
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        // Don't set Content-Type header - let browser set it with boundary for FormData
        body: formData,
      });

      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit application');
        } else {
          // Response is HTML (likely an error page)
          const errorText = await response.text();
          console.error('Server returned HTML instead of JSON:', errorText);
          throw new Error('Server error - please try again later');
        }
      }

      const result = await response.json();
      alert(t('applicationForm.success'));
      setSubmitting(false);
      setShowForm(false);
      setSelectedJob(null); // Go back to job list
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(`${t('applicationForm.error')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            {t('jobs.loading')}
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
            <button className="btn btn-primary" onClick={fetchJobs}>
              {t('jobs.tryAgain')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Header Section with Background Image */}
      <section 
        className="jobs-header-section"
        style={{ 
          backgroundImage: 'url("/images/header image.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll',
          position: 'relative',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 0',
          marginTop: 'var(--header-height)'
        }}
      >
        {/* Dark overlay for text readability */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1
          }}
        />
        
        {/* Content */}
        <div 
          className="container" 
          style={{ 
            position: 'relative', 
            zIndex: 2,
            textAlign: 'center'
          }}
        >
          <h1 
            style={{ 
              color: 'white', 
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '1rem',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              lineHeight: '1.2'
            }}
          >
            {t('jobs.title', 'Available Positions')}
          </h1>
          <p 
            style={{ 
              color: 'rgba(255, 255, 255, 0.95)', 
              fontSize: '1.25rem',
              fontWeight: '400',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}
          >
            {t('jobs.subtitle', 'Discover opportunities that match your skills and career goals')}
          </p>
        </div>
      </section>

      {/* Jobs Content */}
      <section className="section">
        <div className="container">
          {!selectedJob && <JobList jobs={jobs} onViewDetails={handleViewDetails} />}
          {selectedJob && !showForm && <JobDetail job={selectedJob} onApply={() => handleApply(selectedJob._id)} />}
          {selectedJob && showForm && <ApplicationForm onSubmit={handleSubmit} submitting={submitting} />}
          {selectedJob && (
            <div className="text-center mt-lg">
              <button className="btn btn-secondary" onClick={() => setSelectedJob(null)}>
                {t('jobs.backToJobs')}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Jobs; 