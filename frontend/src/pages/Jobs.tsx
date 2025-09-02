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
    if (!user) {
      alert('Please log in to apply for jobs');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPLICATIONS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          userId: user._id,
          coverLetter: 'I am interested in this position.',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
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

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      // Add the jobId to the form data
      formData.append('jobId', selectedJob!._id);
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPLICATIONS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // FormData is automatically set with correct Content-Type
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
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
      {/* Header Section */}
      <section className="section" style={{ background: 'var(--background-secondary)' }}>
        <div className="container">
          <div className="text-center">
            <h1 className="headline-large mb-md">{t('jobs.title', 'Available Positions')}</h1>
            <p className="body-large text-secondary">
              {t('jobs.subtitle', 'Discover opportunities that match your skills and career goals')}
            </p>
          </div>
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