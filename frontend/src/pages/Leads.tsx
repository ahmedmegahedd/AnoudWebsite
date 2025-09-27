import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import LeadsKanban from '../components/LeadsKanban';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface Lead {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'In Discussion' | 'Converted' | 'Lost';
  customColumnId?: string | null;
  leadSource: 'Website Form' | 'Manual' | 'Referral' | 'Other';
  notes?: string;
  followUpDate?: string;
  followUpStatus: 'Pending' | 'Completed' | 'Overdue';
  createdBy: {
    adminId: string;
    adminEmail: string;
    adminName: string;
  };
  emailHistory: Array<{
    subject: string;
    body: string;
    sentAt: string;
    opened: boolean;
    clicked: boolean;
  }>;
  auditHistory?: Array<{
    action: 'created' | 'updated' | 'status_changed' | 'deleted';
    adminId: string;
    adminEmail: string;
    adminName: string;
    timestamp: string;
    details: string;
    previousValue?: string;
    newValue?: string;
  }>;
  lastModifiedBy?: {
    adminId: string;
    adminEmail: string;
    adminName: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Analytics {
  statusStats: Array<{ _id: string; count: number }>;
  sourceStats: Array<{ _id: string; count: number }>;
  upcomingFollowUps: Lead[];
  overdueFollowUps: Lead[];
  recentLeads: Lead[];
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  
  // UI states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [importing, setImporting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
    const [selectedLeadForAudit, setSelectedLeadForAudit] = useState<Lead | null>(null);
  
  // View toggle
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  
  // Form states
  const [newLead, setNewLead] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    status: 'New' as Lead['status'],
    leadSource: 'Manual' as Lead['leadSource'],
    notes: '',
    followUpDate: ''
  });
  
  const [emailCampaign, setEmailCampaign] = useState({
    subject: '',
    body: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchAnalytics();
    if (currentUser?.role === 'superadmin') {
      fetchAdmins();
    }
  }, [searchTerm, statusFilter, sourceFilter, adminFilter, dateFrom, dateTo, sortBy, sortOrder, currentPage]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (sourceFilter !== 'all') params.append('leadSource', sourceFilter);
      if (adminFilter !== 'all') params.append('adminId', adminFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', currentPage.toString());
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADS}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads);
      setTotalPages(data.pagination.total);
      setTotalLeads(data.pagination.totalLeads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADS}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADS}/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      setAdmins(data.admins);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleAddLead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLead)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add lead');
      }

      setShowAddModal(false);
      setNewLead({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        status: 'New',
        leadSource: 'Manual',
        notes: '',
        followUpDate: ''
      });
      fetchLeads();
      fetchAnalytics();
      showNotification('Lead created successfully!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add lead';
      showNotification(errorMessage, 'error');
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      console.log('🔄 Updating lead:', leadId, 'with updates:', updates);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const url = `${API_BASE_URL}${API_ENDPOINTS.LEADS}/${leadId}`;
      console.log('📡 Making request to:', url);
      console.log('📦 Request body:', JSON.stringify(updates));
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update lead`);
      }

      const result = await response.json();
      console.log('✅ Lead updated successfully:', result);
      setEditingLead(null);
      await fetchLeads();
      await fetchAnalytics();
      showNotification('Lead updated successfully!', 'success');
    } catch (err) {
      console.error('❌ Error in handleUpdateLead:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lead';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADS}/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete lead');
      }

      fetchLeads();
      fetchAnalytics();
      showNotification('Lead deleted successfully!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lead';
      showNotification(errorMessage, 'error');
    }
  };

  const handleSendEmail = async () => {
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead to send email to.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADS}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadIds: selectedLeads,
          subject: emailCampaign.subject,
          body: emailCampaign.body
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      setShowEmailModal(false);
      setEmailCampaign({ subject: '', body: '' });
      setSelectedLeads([]);
      fetchLeads();
      showNotification('Email campaign sent successfully!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      showNotification(errorMessage, 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADS}/export-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadIds: selectedLeads.length > 0 ? selectedLeads : undefined,
          filters: {
            status: statusFilter !== 'all' ? statusFilter : undefined,
            leadSource: sourceFilter !== 'all' ? sourceFilter : undefined,
            search: searchTerm || undefined
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export leads');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'leads_export.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export leads');
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      showNotification('Please select a CSV file to import.', 'warning');
      return;
    }

    // Validate file type
    if (!csvFile.name.toLowerCase().endsWith('.csv')) {
      showNotification('Please select a valid CSV file.', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (csvFile.size > 5 * 1024 * 1024) {
      showNotification('File size must be less than 5MB.', 'error');
      return;
    }

    try {
      setImporting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotification('Authentication required. Please log in again.', 'error');
        return;
      }

      console.log('Importing CSV:', {
        fileName: csvFile.name,
        fileSize: csvFile.size,
        hasToken: !!token,
        tokenLength: token ? token.length : 0
      });
      
      const formData = new FormData();
      formData.append('csv', csvFile);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADS}/import-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type header for FormData - browser will set it automatically with boundary
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('CSV Import Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData: JSON.stringify(errorData, null, 2)
        });
        
        if (response.status === 401) {
          showNotification('Authentication failed. Please log in again.', 'error');
          return;
        }
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessage = errorData.errors.slice(0, 3).join(', ') + (errorData.errors.length > 3 ? '...' : '');
          throw new Error(`Import failed: ${errorMessage}`);
        }
        
        throw new Error(errorData.error || 'Failed to import CSV');
      }

      const result = await response.json();
      showNotification(`Successfully imported ${result.imported} leads!`, 'success');
      
      // Reset form and close modal
      setShowImportModal(false);
      setCsvFile(null);
      
      // Refresh data
      fetchLeads();
      fetchAnalytics();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import CSV';
      showNotification(errorMessage, 'error');
      console.error('CSV Import Error:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead._id));
    }
  };

  const handleLeadsImported = (importedLeads: any[]) => {
    fetchLeads();
    fetchAnalytics();
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'New': return 'var(--primary)';
      case 'Contacted': return 'var(--warning)';
      case 'In Discussion': return 'var(--secondary)';
      case 'Converted': return 'var(--success)';
      case 'Lost': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  const getFollowUpStatusColor = (status: Lead['followUpStatus']) => {
    switch (status) {
      case 'Pending': return 'var(--warning)';
      case 'Completed': return 'var(--success)';
      case 'Overdue': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  const showAuditHistory = (lead: Lead) => {
    setSelectedLeadForAudit(lead);
    setShowAuditModal(true);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading leads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--error)' }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
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
          <h1>Leads Management</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* View Toggle */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-secondary)', 
            borderRadius: 'var(--radius)',
            padding: '0.25rem',
            border: '1px solid var(--border)'
          }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'table' ? 'white' : 'var(--text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              📊 Table View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                background: viewMode === 'kanban' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'kanban' ? 'white' : 'var(--text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              📋 Kanban View
            </button>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
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
            Add Lead
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              background: 'var(--secondary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            Import CSV
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          {/* Status Stats */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Lead Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {analytics.statusStats.map(stat => (
                <div key={stat._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{stat._id}:</span>
                  <span style={{ fontWeight: 600, color: getStatusColor(stat._id as Lead['status']) }}>
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Stats */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Lead Sources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {analytics.sourceStats.map(stat => (
                <div key={stat._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{stat._id}:</span>
                  <span style={{ fontWeight: 600 }}>{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Reminders */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Follow-up Reminders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Upcoming:</span>
                <span style={{ fontWeight: 600, color: 'var(--warning)' }}>
                  {analytics.upcomingFollowUps.length}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Overdue:</span>
                <span style={{ fontWeight: 600, color: 'var(--error)' }}>
                  {analytics.overdueFollowUps.length}
                </span>
              </div>
            </div>
          </div>

          {/* Total Leads */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Total Leads</h3>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)' }}>
              {totalLeads}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: 'var(--radius)', 
        border: '1px solid var(--border)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.9rem'
            }}
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.9rem'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="In Discussion">In Discussion</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
          
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.9rem'
            }}
          >
            <option value="all">All Sources</option>
            <option value="Website Form">Website Form</option>
            <option value="Manual">Manual</option>
            <option value="Referral">Referral</option>
            <option value="Other">Other</option>
          </select>

          {/* Admin filter - only for superadmins */}
          {currentUser?.role === 'superadmin' && (
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem'
              }}
            >
              <option value="all">All Admins</option>
              {admins.map(admin => (
                <option key={admin._id} value={admin._id}>
                  {admin.name} ({admin.role})
                </option>
              ))}
            </select>
          )}

          {/* Date range filters */}
          <input
            type="date"
            placeholder="From Date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.9rem'
            }}
          />

          <input
            type="date"
            placeholder="To Date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.9rem'
            }}
          />
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.9rem'
            }}
          >
            <option value="createdAt-desc">Date Added (Newest)</option>
            <option value="createdAt-asc">Date Added (Oldest)</option>
            <option value="companyName-asc">Company Name (A-Z)</option>
            <option value="companyName-desc">Company Name (Z-A)</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="followUpDate-asc">Follow-up Date (Earliest)</option>
          </select>
        </div>

        {/* Clear filters button */}
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSourceFilter('all');
              setAdminFilter('all');
              setDateFrom('');
              setDateTo('');
              setSortBy('createdAt');
              setSortOrder('desc');
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--text-secondary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Action Buttons - Only show in table view */}
      {viewMode === 'table' && selectedLeads.length > 0 && (
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '1rem', 
          borderRadius: 'var(--radius)', 
          marginBottom: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <span>{selectedLeads.length} lead(s) selected</span>
          <button
            onClick={() => setShowEmailModal(true)}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Send Email
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              background: 'var(--secondary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Export Selected
          </button>
        </div>
      )}

      {/* Conditional View Rendering */}
      {viewMode === 'table' ? (
        /* Table View */
        <div style={{ 
          background: 'white', 
          borderRadius: 'var(--radius)', 
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Company</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Contact</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Source</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Follow-up</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead._id)}
                    onChange={() => handleSelectLead(lead._id)}
                  />
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>{lead.companyName}</div>
                  {lead.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {lead.notes.length > 50 ? `${lead.notes.substring(0, 50)}...` : lead.notes}
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>{lead.contactPerson}</td>
                <td style={{ padding: '1rem' }}>{lead.email}</td>
                <td style={{ padding: '1rem' }}>{lead.phone}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'white',
                    background: getStatusColor(lead.status)
                  }}>
                    {lead.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{lead.leadSource}</td>
                <td style={{ padding: '1rem' }}>
                  {lead.followUpDate ? (
                    <div>
                      <div>{new Date(lead.followUpDate).toLocaleDateString()}</div>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'white',
                        background: getFollowUpStatusColor(lead.followUpStatus)
                      }}>
                        {lead.followUpStatus}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>No follow-up</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setEditingLead(lead)}
                      style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead._id)}
                      style={{
                        background: 'var(--error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Delete
                    </button>
                    {currentUser?.role === 'superadmin' && lead.auditHistory && lead.auditHistory.length > 0 && (
                      <button
                        onClick={() => showAuditHistory(lead)}
                        style={{
                          background: 'var(--secondary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius)',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        History
                      </button>
                    )}
                  </div>
                  {/* Audit information for super admins */}
                  {currentUser?.role === 'superadmin' && lead.lastModifiedBy && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.7rem', 
                      color: 'var(--text-secondary)',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '0.25rem'
                    }}>
                      <div>Last modified by: {lead.lastModifiedBy.adminName}</div>
                      <div>Email: {lead.lastModifiedBy.adminEmail}</div>
                      <div>Date: {new Date(lead.lastModifiedBy.timestamp).toLocaleString()}</div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : (
        /* Kanban View */
        <LeadsKanban
          key={`kanban-${leads.length}-${leads.map(l => l.status).join('-')}`}
          leads={leads}
          onLeadUpdate={handleUpdateLead}
          onLeadDelete={handleDeleteLead}
        />
      )}

      {/* Pagination - Only show in table view */}
      {viewMode === 'table' && totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          marginTop: '2rem' 
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          
          <span style={{ padding: '0.5rem 1rem' }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
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
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Add New Lead</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Company Name *"
                value={newLead.companyName}
                onChange={(e) => setNewLead(prev => ({ ...prev, companyName: e.target.value }))}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              
              <input
                type="text"
                placeholder="Contact Person *"
                value={newLead.contactPerson}
                onChange={(e) => setNewLead(prev => ({ ...prev, contactPerson: e.target.value }))}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              
              <input
                type="email"
                placeholder="Email *"
                value={newLead.email}
                onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              
              <input
                type="tel"
                placeholder="Phone *"
                value={newLead.phone}
                onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              
              <select
                value={newLead.status}
                onChange={(e) => setNewLead(prev => ({ ...prev, status: e.target.value as Lead['status'] }))}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
              
              <select
                value={newLead.leadSource}
                onChange={(e) => setNewLead(prev => ({ ...prev, leadSource: e.target.value as Lead['leadSource'] }))}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              >
                <option value="Manual">Manual</option>
                <option value="Website Form">Website Form</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
              
              <input
                type="date"
                placeholder="Follow-up Date"
                value={newLead.followUpDate}
                onChange={(e) => setNewLead(prev => ({ ...prev, followUpDate: e.target.value }))}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              
              <textarea
                placeholder="Notes"
                value={newLead.notes}
                onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => setShowAddModal(false)}
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
                onClick={handleAddLead}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer'
                }}
              >
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Campaign Modal */}
      {showEmailModal && (
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>
              Send Email Campaign ({selectedLeads.length} leads)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Email Subject *"
                value={emailCampaign.subject}
                onChange={(e) => setEmailCampaign(prev => ({ ...prev, subject: e.target.value }))}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              
              <textarea
                placeholder="Email Body *"
                value={emailCampaign.body}
                onChange={(e) => setEmailCampaign(prev => ({ ...prev, body: e.target.value }))}
                rows={10}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => setShowEmailModal(false)}
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
                onClick={handleSendEmail}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer'
                }}
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
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
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Import Leads from CSV</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setCsvFile(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Required CSV Format:</h4>
              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '1rem', 
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem',
                fontFamily: 'monospace'
              }}>
                Company Name, Contact Person, Email, Phone, Status, Lead Source, Notes, Follow-up Date
              </div>
              <button
                onClick={() => {
                  const csvContent = 'Company Name,Contact Person,Email,Phone,Status,Lead Source,Notes,Follow-up Date\nExample Company,John Doe,john@example.com,+1234567890,New,Website Form,Example lead,2024-01-15\nAnother Company,Jane Smith,jane@example.com,+1987654321,Contacted,Referral,Follow up needed,2024-01-20';
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'leads_template.csv';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                }}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Download Template
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="csv-file" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Select CSV File:
              </label>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setCsvFile(file);
                }}
                style={{
                  padding: '0.75rem',
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius)',
                  width: '100%',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--border)';
                  const files = e.dataTransfer.files;
                  if (files.length > 0 && files[0].type === 'text/csv' || files[0].name.endsWith('.csv')) {
                    setCsvFile(files[0]);
                  }
                }}
              />
            </div>
            
            {csvFile && (
              <div style={{ 
                marginBottom: '1rem',
                padding: '1rem', 
                background: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Selected file:</strong> {csvFile.name}
                  </div>
                  <button
                    onClick={() => setCsvFile(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--error)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0.25rem'
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                  Size: {(csvFile.size / 1024).toFixed(1)} KB
                </div>
              </div>
            )}

                          <div style={{ 
                background: 'var(--warning)', 
                color: 'var(--text)', 
                padding: '1rem', 
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem',
                marginBottom: '1.5rem'
              }}>
                <strong>Note:</strong> The first row should contain column headers. Required fields are Company Name, Contact Person, and Email.
                <br /><br />
                <strong>Valid values:</strong><br />
                Status: New, Contacted, In Discussion, Converted, Lost<br />
                Lead Source: Website Form, Manual, Referral, Other
              </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setCsvFile(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                disabled={importing}
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                disabled={!csvFile || importing}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: csvFile && !importing ? 'var(--primary)' : 'var(--text-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: csvFile && !importing ? 'pointer' : 'not-allowed',
                  fontWeight: 500,
                  transition: 'background-color 0.2s ease'
                }}
              >
                {importing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Importing...
                  </span>
                ) : (
                  'Import CSV'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
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
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Edit Lead</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Company Name *"
                value={editingLead.companyName}
                onChange={(e) => setEditingLead(prev => prev ? { ...prev, companyName: e.target.value } : null)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              
              <input
                type="text"
                placeholder="Contact Person *"
                value={editingLead.contactPerson}
                onChange={(e) => setEditingLead(prev => prev ? { ...prev, contactPerson: e.target.value } : null)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              
              <input
                type="email"
                placeholder="Email *"
                value={editingLead.email}
                onChange={(e) => setEditingLead(prev => prev ? { ...prev, email: e.target.value } : null)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              
              <input
                type="tel"
                placeholder="Phone *"
                value={editingLead.phone}
                onChange={(e) => setEditingLead(prev => prev ? { ...prev, phone: e.target.value } : null)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              
              <select
                value={editingLead.status}
                onChange={(e) => setEditingLead(prev => prev ? { ...prev, status: e.target.value as Lead['status'] } : null)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
              
              <select
                value={editingLead.leadSource}
                onChange={(e) => setEditingLead(prev => prev ? { ...prev, leadSource: e.target.value as Lead['leadSource'] } : null)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              >
                <option value="Manual">Manual</option>
                <option value="Website Form">Website Form</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
              
              <input
                type="date"
                placeholder="Follow-up Date"
                value={editingLead.followUpDate ? editingLead.followUpDate.split('T')[0] : ''}
                onChange={(e) => setEditingLead(prev => prev ? { ...prev, followUpDate: e.target.value } : null)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              
              <textarea
                placeholder="Notes"
                value={editingLead.notes || ''}
                onChange={(e) => setEditingLead(prev => prev ? { ...prev, notes: e.target.value } : null)}
                rows={3}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => setEditingLead(null)}
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
                onClick={() => editingLead && handleUpdateLead(editingLead._id, editingLead)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer'
                }}
              >
                Update Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {showAuditModal && selectedLeadForAudit && (
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
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>
              Audit History - {selectedLeadForAudit.companyName}
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Lead Details:</strong>
              <div>Company: {selectedLeadForAudit.companyName}</div>
              <div>Contact: {selectedLeadForAudit.contactPerson}</div>
              <div>Email: {selectedLeadForAudit.email}</div>
            </div>

            {selectedLeadForAudit.auditHistory && selectedLeadForAudit.auditHistory.length > 0 ? (
              <div>
                <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Modification History:</h4>
                <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                  {selectedLeadForAudit.auditHistory.map((audit, index) => (
                    <div key={index} style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      background: 'var(--bg-secondary)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'white',
                          background: audit.action === 'created' ? 'var(--success)' : 
                                   audit.action === 'updated' ? 'var(--primary)' :
                                   audit.action === 'deleted' ? 'var(--error)' : 'var(--warning)'
                        }}>
                          {audit.action.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(audit.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Admin:</strong> {audit.adminName} ({audit.adminEmail})
                      </div>
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Details:</strong> {audit.details}
                      </div>
                      
                      {audit.previousValue && audit.newValue && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <div><strong>Previous:</strong> {audit.previousValue}</div>
                          <div><strong>New:</strong> {audit.newValue}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                No audit history available for this lead.
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  setShowAuditModal(false);
                  setSelectedLeadForAudit(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Leads; 