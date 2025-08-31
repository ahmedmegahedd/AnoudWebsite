import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Job {
  _id: string;
  title: string;
  company?: {
    _id: string;
    name: string;
    location: string;
  };
  location: string;
  type: string;
  salary: string;
  experience: string;
  description: string;
}

interface Application {
  _id: string;
  name: string;
  email: string;
  phone: string;
  education: string;
  selfIntro: string;
  resume?: string;
  cvText?: string; // Extracted text content from CV for search
  status: 'New' | 'Shortlisted' | 'Interviewed' | 'Rejected' | 'Hired';
  isFlagged: boolean;
  isStarred: boolean;
  notes?: string;
  appliedAt: string;
  job: Job;
}

const ApplicantView: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [flaggedFilter, setFlaggedFilter] = useState(false);
  const [starredFilter, setStarredFilter] = useState(false);
  const [sortBy, setSortBy] = useState('appliedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Application management state
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesText, setNotesText] = useState('');

  // Bulk download state
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchJobAndApplications();
  }, [jobId]);

  const fetchJobAndApplications = async () => {
    if (!jobId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch job details
      const jobResponse = await fetch(`https://www.anoudjob.com/api/jobs/${jobId}`);
      if (!jobResponse.ok) {
        throw new Error('Job not found');
      }
      const jobData = await jobResponse.json();
      setJob(jobData);
      
      // Fetch applications
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!jobId) return;
    
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (flaggedFilter) params.append('flagged', 'true');
      if (starredFilter) params.append('starred', 'true');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const response = await fetch(`https://www.anoudjob.com/api/applications/job/${jobId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    }
  };

  // Bulk download functions
  const handleSelectApplicant = (applicantId: string) => {
    setSelectedApplicants(prev => 
      prev.includes(applicantId) 
        ? prev.filter(id => id !== applicantId)
        : [...prev, applicantId]
    );
  };

  const handleSelectAll = () => {
    const applicantsWithResumes = applications
      .filter(app => app.resume)
      .map(app => app._id);
    
    if (selectedApplicants.length === applicantsWithResumes.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(applicantsWithResumes);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedApplicants.length === 0) {
      alert('Please select at least one applicant to download CVs.');
      return;
    }

    setDownloading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://www.anoudjob.com/api/applications/download-cvs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicantIds: selectedApplicants
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download CVs');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Selected_CVs.zip';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Clear selection after successful download
      setSelectedApplicants([]);
      
    } catch (err) {
      console.error('Error downloading CVs:', err);
      alert(err instanceof Error ? err.message : 'Failed to download CVs');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportData = async () => {
    if (!jobId) return;

    setExporting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://www.anoudjob.com/api/applications/export-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId: jobId,
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          flagged: flaggedFilter ? 'true' : undefined,
          starred: starredFilter ? 'true' : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export data');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'applicants_export.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Error exporting data:', err);
      alert(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://www.anoudjob.com/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update the application in the local state
      setApplications(prev => 
        prev.map(app => 
          app._id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleToggleFlag = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://www.anoudjob.com/api/applications/${applicationId}/flag`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle flag');
      }

      const data = await response.json();

      // Update the application in the local state
      setApplications(prev => 
        prev.map(app => 
          app._id === applicationId 
            ? { ...app, isFlagged: data.isFlagged }
            : app
        )
      );
    } catch (err) {
      console.error('Error toggling flag:', err);
      alert('Failed to toggle flag');
    }
  };

  const handleToggleStar = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://www.anoudjob.com/api/applications/${applicationId}/star`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle star');
      }

      const data = await response.json();

      // Update the application in the local state
      setApplications(prev => 
        prev.map(app => 
          app._id === applicationId 
            ? { ...app, isStarred: data.isStarred }
            : app
        )
      );
    } catch (err) {
      console.error('Error toggling star:', err);
      alert('Failed to toggle star');
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedApplication) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://www.anoudjob.com/api/applications/${selectedApplication._id}/notes`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: notesText })
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      // Update the application in the local state
      setApplications(prev => 
        prev.map(app => 
          app._id === selectedApplication._id 
            ? { ...app, notes: notesText }
            : app
        )
      );

      setShowNotesModal(false);
      setSelectedApplication(null);
      setNotesText('');
    } catch (err) {
      console.error('Error updating notes:', err);
      alert('Failed to update notes');
    }
  };

  const openNotesModal = (application: Application) => {
    setSelectedApplication(application);
    setNotesText(application.notes || '');
    setShowNotesModal(true);
  };

  const downloadResume = (resumeFilename: string) => {
    window.open(`https://www.anoudjob.com/uploads/${resumeFilename}`, '_blank');
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'New': return '#2196F3';
      case 'Shortlisted': return '#FF9800';
      case 'Interviewed': return '#9C27B0';
      case 'Rejected': return '#F44336';
      case 'Hired': return '#4CAF50';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--error)' }}>
        <div>Error: {error}</div>
        <button
          onClick={() => navigate('/admin/applicants')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer'
          }}
        >
          Back to Applicants
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Job not found</div>
      </div>
    );
  }

  const applicantsWithResumes = applications.filter(app => app.resume);
  const allSelected = applicantsWithResumes.length > 0 && 
    selectedApplicants.length === applicantsWithResumes.length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/admin/applicants')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Applicants
        </button>
        
        <div style={{ 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          background: 'var(--bg-secondary)'
        }}>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>{job.title}</h1>
          <div style={{ color: 'var(--text-secondary)' }}>
            {job.company ? job.company.name : 'No Company'} • {job.location} • {job.type} • {job.salary}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
        marginBottom: '2rem',
        background: 'white'
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Search & Filters</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interviewed">Interviewed</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
          </div>

          {/* Flagged Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Flagged
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={flaggedFilter}
                onChange={(e) => setFlaggedFilter(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span>Show flagged only</span>
            </label>
          </div>

          {/* Starred Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Starred
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={starredFilter}
                onChange={(e) => setStarredFilter(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span>Show starred only</span>
            </label>
          </div>

          {/* Sort */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem'
              }}
            >
              <option value="appliedAt">Date Applied</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem'
              }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchApplications}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer'
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Applications List */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0' }}>
          Applications ({applications.length})
        </h3>
        
        {applications.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            background: 'white'
          }}>
            No applications found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map((application) => (
              <div
                key={application._id}
                className="applicant-card"
              >
                {/* Checkbox for bulk selection */}
                <div className="applicant-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedApplicants.includes(application._id)}
                    onChange={() => handleSelectApplicant(application._id)}
                    disabled={!application.resume}
                    title={application.resume ? 'Select for bulk download' : 'No CV available'}
                  />
                </div>

                {/* Application Details */}
                <div className="applicant-details">
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <h4 className="applicant-name">
                      {application.name}
                    </h4>
                    <span className={`status-badge status-${application.status.toLowerCase()}`}>
                      {application.status}
                    </span>
                  </div>
                  
                  <div className="applicant-meta">
                    {application.email} • {application.phone}
                  </div>
                  
                  <div className="applicant-date">
                    Applied: {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                  
                  {application.notes && (
                    <div className="applicant-notes">
                      Notes: {application.notes}
                    </div>
                  )}
                </div>
                
                <div className="applicant-actions">
                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button
                      onClick={() => handleToggleFlag(application._id)}
                      className={`action-btn ${application.isFlagged ? 'flagged' : ''}`}
                    >
                      {application.isFlagged ? 'Unflag' : 'Flag'}
                    </button>
                    
                    <button
                      onClick={() => handleToggleStar(application._id)}
                      className={`action-btn ${application.isStarred ? 'starred' : ''}`}
                    >
                      {application.isStarred ? 'Unstar' : 'Star'}
                    </button>
                  </div>
                  
                  <div className="action-buttons">
                    <button
                      onClick={() => openNotesModal(application)}
                      className="action-btn"
                    >
                      Notes
                    </button>
                    
                    {application.resume && (
                      <button
                        onClick={() => downloadResume(application.resume!)}
                        className="action-btn download"
                      >
                        Download CV
                      </button>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusChange(application._id, e.target.value as Application['status'])}
                    className="status-select"
                  >
                    <option value="New">New</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interviewed">Interviewed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Hired">Hired</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Download Section - Moved to end */}
      {applications.length > 0 && (
        <div className="bulk-download-section">
          <div className="bulk-download-header">
            <h3>Bulk CV Download</h3>
            {selectedApplicants.length > 0 && (
              <span className="selected-count">
                {selectedApplicants.length} applicant(s) selected
              </span>
            )}
          </div>
          
          <div className="bulk-download-controls">
            <label className="select-all-label">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="select-all-checkbox"
              />
              <span>Select All ({applicantsWithResumes.length} with CVs)</span>
            </label>
            
            <div className="bulk-actions">
              {selectedApplicants.length > 0 && (
                <button
                  onClick={handleBulkDownload}
                  disabled={downloading}
                  className="download-selected-btn"
                >
                  {downloading ? 'Downloading...' : `Download Selected CVs (${selectedApplicants.length})`}
                </button>
              )}
              
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="export-data-btn"
              >
                {exporting ? 'Exporting...' : 'Export Applicants Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedApplication && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: 'var(--radius)',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>
              Notes for {selectedApplication.name}
            </h3>
            
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Enter notes..."
              rows={5}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedApplication(null);
                  setNotesText('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateNotes}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer'
                }}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantView; 