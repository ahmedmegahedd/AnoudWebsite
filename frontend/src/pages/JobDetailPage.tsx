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
    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/jobs');
      return;
    }
    setShowForm(true);
  };

  const handleSubmit = async (formData: any) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPLICATIONS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          userId: user?._id,
          coverLetter: formData.coverLetter || 'I am interested in this position.',
        }),
      });

      if (response.ok) {
        // Application submitted successfully
        setShowForm(false);
        // You can add a success message here
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      // You can add an error message here
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
        <JobDetail job={selectedJob} onApply={() => handleApply(selectedJob._id)} />
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
