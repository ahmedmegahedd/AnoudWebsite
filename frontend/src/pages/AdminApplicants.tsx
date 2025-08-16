import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '../context/CompanyContext';
import { useJobs } from '../context/JobContext';

const AdminApplicants: React.FC = () => {
  const navigate = useNavigate();
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies();
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs();
  
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  const toggleCompanyExpansion = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  const getJobsByCompany = (companyId: string) => {
    return jobs.filter(job => job.company && job.company._id === companyId);
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
          <h1>Applicants Management</h1>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        {companies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No companies found. Create companies and jobs to start receiving applications.
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
                        <div style={{ marginBottom: '1rem' }}>
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
                                <button
                                  onClick={() => navigate(`/admin/applicants/${job._id}`)}
                                  style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                  }}
                                >
                                  View All Applicants
                                </button>
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
                      <span style={{ fontSize: '1.2rem' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={{ padding: '1rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Jobs</h3>
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
                                <button
                                  onClick={() => navigate(`/admin/applicants/${job._id}`)}
                                  style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                  }}
                                >
                                  View All Applicants
                                </button>
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
    </div>
  );
};

export default AdminApplicants; 