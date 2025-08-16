import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { useCompanies } from '../context/CompanyContext';
import { useJobs } from '../context/JobContext';
import JobForm from '../components/JobForm';
import CompanyForm from '../components/CompanyForm';

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
  company?: Company; // Made optional to handle old jobs
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

// Interface for JobForm (with company as string ID)
interface JobFormData {
  _id?: string;
  title_en: string;
  title_ar: string;
  company: string;
  location_en: string;
  location_ar: string;
  type: 'Full-Time' | 'Part-Time' | 'Remote' | 'Contract';
  salary_en: string;
  salary_ar: string;
  experience_en: string;
  experience_ar: string;
  description_en: string;
  description_ar: string;
}

const AdminJobs: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { companies, loading: companiesLoading, error: companiesError, addCompany, updateCompany, deleteCompany } = useCompanies();
  const { jobs, loading: jobsLoading, error: jobsError, addJob, updateJob, deleteJob } = useJobs();
  
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCompanyExpansion = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        showNotification('Job deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting job:', error);
        showNotification('Failed to delete job', 'error');
      }
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setShowCompanyForm(true);
  };

  const handleDeleteCompany = async (company: Company) => {
    const companyJobs = getJobsByCompany(company._id);
    
    if (companyJobs.length > 0) {
      showNotification(`This company has ${companyJobs.length} job listing(s) and cannot be deleted. Please remove the jobs first.`, 'warning');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${company.name_en}"?`)) {
      try {
        await deleteCompany(company._id);
        showNotification('Company deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting company:', error);
        if (error instanceof Error && error.message.includes('job listings')) {
          showNotification('This company has job listings and cannot be deleted. Please remove the jobs first.', 'warning');
        } else {
          showNotification('Error deleting company. Please try again.', 'error');
        }
      }
    }
  };

  const handleAddJob = (company: Company) => {
    setSelectedCompany(company);
    setEditingJob(undefined);
    setShowJobForm(true);
  };

  const getJobsByCompany = (companyId: string) => {
    return jobs.filter(job => job.company && job.company._id === companyId);
  };

  // Convert Job with Company object to JobFormData with company ID
  const convertJobForForm = (job: Job | undefined): JobFormData | undefined => {
    if (!job) return undefined;
    return {
      _id: job._id,
      title_en: job.title_en,
      title_ar: job.title_ar,
      company: job.company?._id || '', // Convert Company object to company ID
      location_en: job.location_en,
      location_ar: job.location_ar,
      type: job.type as 'Full-Time' | 'Part-Time' | 'Remote' | 'Contract',
      salary_en: job.salary_en,
      salary_ar: job.salary_ar,
      experience_en: job.experience_en,
      experience_ar: job.experience_ar,
      description_en: job.description_en,
      description_ar: job.description_ar
    };
  };

  if (companiesLoading || jobsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (companiesError || jobsError) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--error)' }}>
        <div>Error: {companiesError || jobsError}</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
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
            ← Back to Admin Page
          </button>
          <h1>Jobs Management</h1>
        </div>
        <button
          onClick={() => setShowCompanyForm(true)}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          ➕ Create New Company
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        {companies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No companies found. Create your first company to get started.
          </div>
        ) : (
          <>
            {/* Unassigned Jobs Section */}
            {(() => {
              const unassignedJobs = jobs.filter(job => !job.company);
              if (unassignedJobs.length > 0) {
                const isExpanded = expandedCompanies.has('unassigned');
                return (
                  <div style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)',
                    marginBottom: '1rem',
                    overflow: 'hidden'
                  }}>
                    <div
                      onClick={() => toggleCompanyExpansion('unassigned')}
                      style={{
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 600
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '1.1rem', color: 'var(--text)' }}>
                          Unassigned Jobs
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          Jobs without a company assignment
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          {unassignedJobs.length} job{unassignedJobs.length !== 1 ? 's' : ''}
                        </span>
                        <span style={{ fontSize: '1.2rem' }}>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div style={{ padding: '1rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <h3 style={{ margin: 0 }}>Unassigned Jobs</h3>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {unassignedJobs.map(job => (
                            <div key={job._id} style={{
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)',
                              padding: '1rem',
                              background: 'white'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                marginBottom: '0.5rem'
                              }}>
                                <div>
                                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)' }}>
                                    {job.title_en}
                                  </h4>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {job.location_en} • {job.type} • {job.salary_en}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => navigate(`/admin/applicants/${job._id}`)}
                                    style={{
                                      background: 'var(--primary)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: 'var(--radius)',
                                      padding: '0.25rem 0.75rem',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    View Applicants
                                  </button>
                                  <button
                                    onClick={() => handleEditJob(job)}
                                    style={{
                                      background: 'var(--warning)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: 'var(--radius)',
                                      padding: '0.25rem 0.75rem',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteJob(job._id)}
                                    style={{
                                      background: 'var(--error)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: 'var(--radius)',
                                      padding: '0.25rem 0.75rem',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            {/* Company Jobs Sections */}
            {companies.map(company => {
              const companyJobs = getJobsByCompany(company._id);
              const isExpanded = expandedCompanies.has(company._id);
              
              return (
                <div key={company._id} style={{ 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)',
                  marginBottom: '1rem',
                  overflow: 'hidden'
                }}>
                  <div
                    onClick={() => toggleCompanyExpansion(company._id)}
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: 600
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '1.1rem', color: 'var(--text)' }}>
                        {company.name_en}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {company.location_en} {company.industry_en && `• ${company.industry_en}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {companyJobs.length} job{companyJobs.length !== 1 ? 's' : ''}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCompany(company);
                          }}
                          className="company-action-btn edit"
                          title="Edit Company"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCompany(company);
                          }}
                          className="company-action-btn delete"
                          title="Delete Company"
                        >
                          🗑️
                        </button>
                      </div>
                      <span style={{ fontSize: '1.2rem' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={{ padding: '1rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <h3 style={{ margin: 0 }}>Jobs</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddJob(company);
                          }}
                          style={{
                            background: 'var(--success)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          ➕ Add New Job
                        </button>
                      </div>
                      
                      {companyJobs.length === 0 ? (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '1rem', 
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic'
                        }}>
                          No jobs for this company yet.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {companyJobs.map(job => (
                            <div key={job._id} style={{
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)',
                              padding: '1rem',
                              background: 'white'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                marginBottom: '0.5rem'
                              }}>
                                <div>
                                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)' }}>
                                    {job.title_en}
                                  </h4>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {job.location_en} • {job.type} • {job.salary_en}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => navigate(`/admin/applicants/${job._id}`)}
                                    style={{
                                      background: 'var(--primary)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: 'var(--radius)',
                                      padding: '0.25rem 0.75rem',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    View Applicants
                                  </button>
                                  <button
                                    onClick={() => handleEditJob(job)}
                                    style={{
                                      background: 'var(--warning)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: 'var(--radius)',
                                      padding: '0.25rem 0.75rem',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteJob(job._id)}
                                    style={{
                                      background: 'var(--error)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: 'var(--radius)',
                                      padding: '0.25rem 0.75rem',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Company Form Modal */}
      {showCompanyForm && (
        <CompanyForm
          company={editingCompany}
          onSubmit={async (companyData) => {
            try {
              setIsSubmitting(true);
              if (editingCompany) {
                await updateCompany(editingCompany._id, companyData);
              } else {
                await addCompany(companyData);
              }
              setShowCompanyForm(false);
              setEditingCompany(null);
            } catch (error) {
              console.error('Error saving company:', error);
            } finally {
              setIsSubmitting(false);
            }
          }}
          onCancel={() => {
            setShowCompanyForm(false);
            setEditingCompany(null);
          }}
          submitting={isSubmitting}
        />
      )}

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          job={convertJobForForm(editingJob)}
          onSubmit={async (jobData: JobFormData) => {
            try {
              setIsSubmitting(true);
              if (editingJob) {
                await updateJob(editingJob._id, jobData);
              } else {
                // For new jobs, we need to include the company ID
                if (selectedCompany) {
                  await addJob({ ...jobData, company: selectedCompany._id });
                }
              }
              setShowJobForm(false);
              setEditingJob(undefined);
              setSelectedCompany(null);
            } catch (error) {
              console.error('Error saving job:', error);
            } finally {
              setIsSubmitting(false);
            }
          }}
          onCancel={() => {
            setShowJobForm(false);
            setEditingJob(undefined);
            setSelectedCompany(null);
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default AdminJobs; 