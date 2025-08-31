import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  company: Company;
  location_en: string;
  location_ar: string;
  type: string;
  salary_en: string;
  salary_ar: string;
  experience_en: string;
  experience_ar: string;
  description_en: string;
  description_ar: string;
  postedAt: string;
}

interface JobContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  addJob: (jobData: Omit<Job, '_id' | 'postedAt' | 'company'> & { company: string }) => Promise<void>;
  updateJob: (jobId: string, updatedJob: Partial<Omit<Job, 'company'>> & { company?: string }) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://www.anoudjob.com/api/jobs');
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

  const addJob = async (jobData: Omit<Job, '_id' | 'postedAt' | 'company'> & { company: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://www.anoudjob.com/api/jobs', {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      throw err;
    }
  };

  const updateJob = async (jobId: string, updatedJob: Partial<Omit<Job, 'company'>> & { company?: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://www.anoudjob.com/api/jobs/${jobId}`, {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job');
      throw err;
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://www.anoudjob.com/api/jobs/${jobId}`, {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
      throw err;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const value: JobContextType = {
    jobs,
    loading,
    error,
    fetchJobs,
    addJob,
    updateJob,
    deleteJob,
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
}; 