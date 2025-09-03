import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import JobDetail from '../components/JobDetail';
import ApplicationForm from '../components/ApplicationForm';

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { jobs, loading } = useJobs();
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (jobId && jobs.length > 0) {
      const job = jobs.find(j => j._id === jobId);
      if (job) {
        setSelectedJob(job);
      } else {
        // Job not found, redirect to jobs page
        navigate('/jobs');
      }
    }
  }, [jobId, jobs, navigate]);

  const handleApply = async (jobId: string) => {
    // Remove authentication requirement - allow anyone to apply
    setShowForm(true);
  };

  const handleSubmit = async (formData: any) => {
    setSubmitting(true);
    try {
      // Use the public route which doesn't require authentication
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPLICATIONS}/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          education: formData.get('education'),
          selfIntro: formData.get('selfIntro'),
          jobId: jobId,
        }),
      });

      if (response.ok) {
        // Application submitted successfully
        alert('Application submitted successfully!');
        setShowForm(false);
        navigate('/jobs'); // Redirect back to jobs page
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(`Error submitting application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center">
          <div className="loading">
            <div className="spinner"></div>
            {t('jobs.loading')}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div className="container">
        <div className="text-center">
          <p>{t('jobs.error')}</p>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
            {t('jobs.backToJobs')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-lg">
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/jobs')}
        >
          ← {t('jobs.backToJobs')}
        </button>
      </div>

      {!showForm ? (
        <>
          <JobDetail job={selectedJob} onApply={() => handleApply(selectedJob._id)} />
        </>
      ) : (
        <div>
          <ApplicationForm onSubmit={handleSubmit} submitting={submitting} />
          <div className="text-center mt-lg">
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowForm(false)}
            >
              {t('jobs.backToJobs')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
