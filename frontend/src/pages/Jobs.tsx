import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import JobList from '../components/JobList';
import JobDetail from '../components/JobDetail';
import ApplicationForm from '../components/ApplicationForm';
import { useJobs } from '../context/JobContext';
import { Job } from '../components/JobList'; // Import Job interface from JobList

const Jobs: React.FC = () => {
  const { t } = useTranslation();
  const { jobs, loading, error, fetchJobs } = useJobs();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleViewDetails = (id: string) => {
    const job = jobs.find(j => j._id === id) || null;
    setSelectedJob(job);
    setShowForm(false);
  };

  const handleApply = () => {
    setShowForm(true);
  };

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      // Add the jobId to the form data
      formData.append('jobId', selectedJob!._id);
      
      const response = await fetch('https://www.anoudjob.com/api/applications', {
        method: 'POST',
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
          {selectedJob && !showForm && <JobDetail job={selectedJob} onApply={handleApply} />}
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