import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { useNotification } from './NotificationContext';

interface Company {
  _id: string;
  name_en: string;
  name_ar: string;
  location_en: string;
  location_ar: string;
  industry_en?: string;
  industry_ar?: string;
}

interface Job {
  _id: string;
  title_en: string;
  title_ar: string;
  location_en: string;
  location_ar: string;
  salary_en: string;
  salary_ar: string;
  experience_en: string;
  experience_ar: string;
  description_en: string;
  description_ar: string;
  type: string;
  featured: boolean;
  postedAt: string;
  company: Company;
  applicantCount?: number; // Number of applicants for this job
}

interface JobContextType {
  jobs: Job[];
  featuredJobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  fetchFeaturedJobs: () => Promise<void>;
  fetchApplicantCounts: () => Promise<void>;
  addJob: (jobData: Omit<Job, '_id' | 'postedAt' | 'company'> & { company: string }) => Promise<void>;
  updateJob: (jobId: string, updatedJob: Partial<Omit<Job, 'company'>> & { company?: string }) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  toggleFeatured: (jobId: string) => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOBS}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOBS}?featured=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured jobs');
      }
      const data = await response.json();
      setFeaturedJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load featured jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicantCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = `${API_BASE_URL}${API_ENDPOINTS.APPLICATIONS}/counts`;
      let headers = {};
      
      if (token) {
        // Use authenticated endpoint if token is available
        headers = {
          'Authorization': `Bearer ${token}`
        };
      } else {
        // Use public endpoint if no token
        endpoint = `${API_BASE_URL}${API_ENDPOINTS.APPLICATIONS}/counts/public`;
        console.log('No token found, using public endpoint for applicant counts');
      }
      
      const response = await fetch(endpoint, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch applicant counts');
      }
      const counts = await response.json();
      
      // Update jobs with applicant counts
      setJobs(prevJobs => prevJobs.map(job => ({
        ...job,
        applicantCount: counts[job._id] || 0
      })));
      
      setFeaturedJobs(prevFeaturedJobs => prevFeaturedJobs.map(job => ({
        ...job,
        applicantCount: counts[job._id] || 0
      })));
    } catch (err) {
      console.error('Failed to fetch applicant counts:', err);
      // Don't set error state for this as it's not critical
    }
  };

  const addJob = async (jobData: Omit<Job, '_id' | 'postedAt' | 'company'> & { company: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOBS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create job');
      }

      const newJob = await response.json();
      setJobs(prevJobs => [newJob.job, ...prevJobs]);
      
      // Show success notification
      showNotification('Job created successfully!', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      throw err;
    }
  };

  const updateJob = async (jobId: string, updatedJob: Partial<Omit<Job, 'company'>> & { company?: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOBS}/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedJob)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update job');
      }

      const updatedJobData = await response.json();
      setJobs(prevJobs => 
        prevJobs.map(job => job._id === jobId ? updatedJobData.job : job)
      );
      
      // Show success notification
      showNotification('Job updated successfully!', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job');
      throw err;
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOBS}/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete job');
      }

      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
      
      // Show success notification
      showNotification('Job deleted successfully!', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
      throw err;
    }
  };

  const toggleFeatured = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOBS}/${jobId}/toggleFeatured`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle featured status');
      }

      setJobs(prevJobs => prevJobs.map(job => 
        job._id === jobId ? { ...job, featured: !job.featured } : job
      ));
      setFeaturedJobs(prevFeatured => prevFeatured.map(job => 
        job._id === jobId ? { ...job, featured: !job.featured } : job
      ));
      
      // Show success notification
      const newFeaturedStatus = !jobs.find(job => job._id === jobId)?.featured;
      showNotification(`Job ${newFeaturedStatus ? 'featured' : 'unfeatured'} successfully!`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle featured status');
      throw err;
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchFeaturedJobs();
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      fetchApplicantCounts();
    }
  }, [jobs.length]);

  const value: JobContextType = {
    jobs,
    featuredJobs,
    loading,
    error,
    fetchJobs,
    fetchFeaturedJobs,
    fetchApplicantCounts,
    addJob,
    updateJob,
    deleteJob,
    toggleFeatured,
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
}; 