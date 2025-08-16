import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';

interface ExtractedLeadData {
  fullName: string;
  email: string;
  phone: string;
  currentJobTitle?: string;
  yearsOfExperience?: number;
  skills?: string[];
  education?: string;
  location?: string;
  summary?: string;
  fileName: string;
  parsedAt: string;
}

interface LeadsCVImportProps {
  onLeadsImported: (leads: any[]) => void;
}

const LeadsCVImport: React.FC<LeadsCVImportProps> = ({ onLeadsImported }) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingLeads, setIsCreatingLeads] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ExtractedLeadData[]>([]);
  const [selectedCVs, setSelectedCVs] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
        setUploadedFile(file);
        showNotification('ZIP file selected. Click "Process CVs" to extract leads.', 'info');
      } else {
        showNotification('Please select a ZIP file containing CV documents.', 'error');
        event.target.value = '';
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    (event.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)';
    (event.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-secondary)';
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    (event.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
    (event.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    (event.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
    (event.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
        setUploadedFile(file);
        showNotification('ZIP file dropped. Click "Process CVs" to extract leads.', 'info');
      } else {
        showNotification('Please drop a ZIP file containing CV documents.', 'error');
      }
    }
  };

  const processCVs = async () => {
    if (!uploadedFile) {
      showNotification('Please select a ZIP file first.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Authentication required. Please log in again.', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('cvZip', uploadedFile);

      const response = await fetch('http://localhost:3231/api/cv-upload/process-zip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process CV files');
      }

      const result = await response.json();
      
      if (result.success && result.results) {
        const successfulResults = result.results.filter((r: any) => r.success);
        setParsedData(successfulResults.map((r: any) => r.data));
        setSelectedCVs(new Set(successfulResults.map((_: any, index: number) => index)));
        setShowResults(true);
        
        showNotification(
          `Successfully processed ${result.processedFiles} out of ${result.totalFiles} CV files!`,
          'success'
        );
      } else {
        throw new Error('No CV data was extracted');
      }

    } catch (error) {
      console.error('Error processing CVs:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to process CV files',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const createLeads = async () => {
    if (selectedCVs.size === 0) {
      showNotification('Please select at least one CV to create leads.', 'warning');
      return;
    }

    setIsCreatingLeads(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Authentication required. Please log in again.', 'error');
        return;
      }

      const selectedData = Array.from(selectedCVs).map(index => parsedData[index]);

      // Transform CV data to lead format
      const leadsData = selectedData.map(cv => ({
        companyName: cv.currentJobTitle ? `${cv.fullName}'s Company` : 'Unknown Company',
        contactPerson: cv.fullName,
        email: cv.email || '',
        phone: cv.phone || '',
        status: 'New',
        leadSource: 'CV Import',
        notes: `Imported from CV: ${cv.fileName}\n${cv.summary || ''}\nSkills: ${cv.skills?.join(', ') || 'N/A'}\nExperience: ${cv.yearsOfExperience || 'N/A'} years\nEducation: ${cv.education || 'N/A'}\nLocation: ${cv.location || 'N/A'}`
      }));

      // Create leads using the existing leads API
      const results = [];
      const errors = [];

      for (const leadData of leadsData) {
        try {
          const response = await fetch('http://localhost:3231/api/leads', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(leadData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            errors.push({
              fileName: leadData.notes.split('Imported from CV: ')[1]?.split('\n')[0] || 'Unknown',
              error: errorData.error || 'Failed to create lead'
            });
          } else {
            const result = await response.json();
            results.push({
              success: true,
              fileName: leadData.notes.split('Imported from CV: ')[1]?.split('\n')[0] || 'Unknown',
              leadId: result.lead._id,
              contactPerson: result.lead.contactPerson
            });
          }
        } catch (error) {
          errors.push({
            fileName: leadData.notes.split('Imported from CV: ')[1]?.split('\n')[0] || 'Unknown',
            error: 'Network error'
          });
        }
      }

      if (results.length > 0) {
        showNotification(
          `Successfully created ${results.length} leads!${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
          'success'
        );

        // Call callback to refresh leads
        onLeadsImported(results);

        // Reset form
        setParsedData([]);
        setSelectedCVs(new Set());
        setShowResults(false);
        setUploadedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        showNotification('Failed to create any leads. Please try again.', 'error');
      }

    } catch (error) {
      console.error('Error creating leads:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to create leads',
        'error'
      );
    } finally {
      setIsCreatingLeads(false);
    }
  };

  const toggleCVSelection = (index: number) => {
    const newSelected = new Set(selectedCVs);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCVs(newSelected);
  };

  const selectAll = () => {
    setSelectedCVs(new Set(parsedData.map((_, index) => index)));
  };

  const deselectAll = () => {
    setSelectedCVs(new Set());
  };

  const resetForm = () => {
    setParsedData([]);
    setSelectedCVs(new Set());
    setShowResults(false);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>🤖 AI Import Leads from CVs</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Upload a ZIP file containing CV documents (PDF, DOCX, DOC). Our AI will automatically extract 
          contact information and create leads for your CRM.
        </p>
      </div>

      {!showResults ? (
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)'
        }}>
          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius)',
              padding: '3rem 2rem',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              marginBottom: '2rem'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Upload ZIP File</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Drag and drop a ZIP file here, or click to browse
            </p>
            <div style={{ 
              background: 'var(--bg-secondary)', 
              padding: '1rem', 
              borderRadius: 'var(--radius)',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}>
              Supported: ZIP files containing PDF, DOCX, DOC files
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* File Info */}
          {uploadedFile && (
            <div style={{ 
              background: 'var(--bg-secondary)', 
              padding: '1rem', 
              borderRadius: 'var(--radius)',
              marginBottom: '2rem',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Selected file:</strong> {uploadedFile.name}
                  <br />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
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
            </div>
          )}

          {/* Instructions */}
          <div style={{ 
            background: 'var(--warning)', 
            color: 'var(--text)', 
            padding: '1rem', 
            borderRadius: 'var(--radius)',
            marginBottom: '2rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>📋 Instructions:</h4>
            <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>Create a ZIP file containing CV documents (PDF, DOCX, DOC)</li>
              <li>Upload the ZIP file using the area above</li>
              <li>Click "Process CVs" to extract contact information</li>
              <li>Review the extracted data and select which CVs to create leads for</li>
              <li>Click "Create Leads" to add them to your CRM</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={processCVs}
              disabled={!uploadedFile || isProcessing}
              style={{
                padding: '1rem 2rem',
                background: uploadedFile && !isProcessing ? 'var(--primary)' : 'var(--text-secondary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: uploadedFile && !isProcessing ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {isProcessing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Processing CVs...
                </span>
              ) : (
                '🚀 Process CVs'
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Results Display */
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3>📊 Extracted Contact Information</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={selectAll}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer'
                }}
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--text-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer'
                }}
              >
                Deselect All
              </button>
              <button
                onClick={resetForm}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--error)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer'
                }}
              >
                Start Over
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <p>
              <strong>{selectedCVs.size}</strong> of <strong>{parsedData.length}</strong> contacts selected for lead creation
            </p>
          </div>

          {/* CV Results Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {parsedData.map((cv, index) => (
              <div
                key={index}
                style={{
                  border: selectedCVs.has(index) ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: selectedCVs.has(index) ? 'var(--bg-secondary)' : 'white'
                }}
                onClick={() => toggleCVSelection(index)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>
                      {cv.fullName || 'Unknown Name'}
                    </h4>
                    <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {cv.currentJobTitle || 'No job title'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedCVs.has(index)}
                    onChange={() => toggleCVSelection(index)}
                    style={{ marginLeft: '1rem' }}
                  />
                </div>

                <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  <div><strong>Email:</strong> {cv.email || 'Not found'}</div>
                  <div><strong>Phone:</strong> {cv.phone || 'Not found'}</div>
                  <div><strong>Experience:</strong> {cv.yearsOfExperience ? `${cv.yearsOfExperience} years` : 'Not specified'}</div>
                  <div><strong>Education:</strong> {cv.education || 'Not specified'}</div>
                  <div><strong>Location:</strong> {cv.location || 'Not specified'}</div>
                </div>

                {cv.skills && cv.skills.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Skills:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                      {cv.skills.slice(0, 5).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {cv.skills.length > 5 && (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          +{cv.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {cv.summary && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Summary:</strong> {cv.summary}
                  </div>
                )}

                <div style={{ 
                  marginTop: '1rem', 
                  padding: '0.5rem', 
                  background: 'var(--bg-secondary)', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  📄 {cv.fileName}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={createLeads}
              disabled={selectedCVs.size === 0 || isCreatingLeads}
              style={{
                padding: '1rem 2rem',
                background: selectedCVs.size > 0 && !isCreatingLeads ? 'var(--success)' : 'var(--text-secondary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: selectedCVs.size > 0 && !isCreatingLeads ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {isCreatingLeads ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Creating Leads...
                </span>
              ) : (
                `👥 Create ${selectedCVs.size} Lead${selectedCVs.size !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsCVImport; 