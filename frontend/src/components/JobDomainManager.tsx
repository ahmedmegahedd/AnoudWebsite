import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { JobURLGenerator, JobURLConfig } from '../utils/jobUrlGenerator';

interface Job {
  _id: string;
  title_en: string;
  title_ar: string;
  company?: {
    name_en?: string;
    name_ar?: string;
  };
  location_en?: string;
  location_ar?: string;
  postedAt: string;
}

interface JobDomainManagerProps {
  jobs: Job[];
}

const JobDomainManager: React.FC<JobDomainManagerProps> = ({ jobs }) => {
  const { t, i18n } = useTranslation();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [domainType, setDomainType] = useState<string>('subdomain');
  const [customDomain, setCustomDomain] = useState<string>('');
  const [showDomainInfo, setShowDomainInfo] = useState(false);
  
  const currentLang = i18n.language;

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setShowDomainInfo(true);
    
    // Generate default domain based on type
    const config: JobURLConfig = {
      jobId: job._id,
      title: currentLang === 'ar' ? job.title_ar : job.title_en,
      company: job.company ? (currentLang === 'ar' ? job.company.name_ar : job.company.name_en) : undefined,
      location: currentLang === 'ar' ? job.location_ar : job.location_en,
    };
    
    const domains = JobURLGenerator.getAllDomainVariations(config);
    setCustomDomain(domains[domainType as keyof typeof domains] || '');
  };

  const handleDomainTypeChange = (type: string) => {
    setDomainType(type);
    if (selectedJob) {
      const config: JobURLConfig = {
        jobId: selectedJob._id,
        title: currentLang === 'ar' ? selectedJob.title_ar : selectedJob.title_en,
        company: selectedJob.company ? (currentLang === 'ar' ? selectedJob.company.name_ar : selectedJob.company.name_en) : undefined,
        location: currentLang === 'ar' ? selectedJob.location_ar : selectedJob.location_en,
      };
      
      const domains = JobURLGenerator.getAllDomainVariations(config);
      setCustomDomain(domains[type as keyof typeof domains] || '');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(t('jobDomain.copied', 'Domain copied to clipboard!'));
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(t('jobDomain.copied', 'Domain copied to clipboard!'));
    }
  };

  const generateQRCode = (domain: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(domain)}`;
    window.open(qrUrl, '_blank');
  };

  const exportDomains = () => {
    const domainsData = jobs.map(job => {
      const config: JobURLConfig = {
        jobId: job._id,
        title: currentLang === 'ar' ? job.title_ar : job.title_en,
        company: job.company ? (currentLang === 'ar' ? job.company.name_ar : job.company.name_en) : undefined,
        location: currentLang === 'ar' ? job.location_ar : job.location_en,
      };
      
      const domains = JobURLGenerator.getAllDomainVariations(config);
      return {
        jobId: job._id,
        title: currentLang === 'ar' ? job.title_ar : job.title_en,
        company: job.company ? (currentLang === 'ar' ? job.company.name_ar : job.company.name_en) : 'N/A',
        location: currentLang === 'ar' ? job.location_ar : job.location_en || 'N/A',
        subdomain: domains.subdomain,
        customDomain: domains.customDomain,
        professionalDomain: domains.professionalDomain,
        locationDomain: domains.locationDomain,
        urlPath: domains.urlPath,
      };
    });

    const csvContent = [
      'Job ID,Title,Company,Location,Subdomain,Custom Domain,Professional Domain,Location Domain,URL Path',
      ...domainsData.map(row => 
        `"${row.jobId}","${row.title}","${row.company}","${row.location}","${row.subdomain}","${row.customDomain}","${row.professionalDomain}","${row.locationDomain}","${row.urlPath}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `job-domains-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="job-domain-manager">
      <div className="manager-header mb-lg">
        <h2 className="headline-medium mb-md">
          {t('jobDomain.managerTitle', 'Job Domain Manager')}
        </h2>
        <p className="body-medium text-secondary mb-lg">
          {t('jobDomain.managerSubtitle', 'Manage unique domain extensions for each job posting')}
        </p>
        
        <div className="manager-actions">
          <button 
            onClick={exportDomains}
            className="btn btn-secondary"
          >
            {t('jobDomain.exportAll', 'Export All Domains')}
          </button>
        </div>
      </div>

      <div className="manager-content grid grid-2 gap-lg">
        {/* Job List */}
        <div className="job-list-section">
          <h3 className="headline-small mb-md">
            {t('jobDomain.selectJob', 'Select a Job')}
          </h3>
          
          <div className="job-list">
            {jobs.map(job => (
              <div 
                key={job._id}
                className={`job-item ${selectedJob?._id === job._id ? 'selected' : ''}`}
                onClick={() => handleJobSelect(job)}
              >
                <div className="job-title">
                  {currentLang === 'ar' ? job.title_ar : job.title_en}
                </div>
                <div className="job-company">
                  {job.company ? (currentLang === 'ar' ? job.company.name_ar : job.company.name_en) : 'N/A'}
                </div>
                <div className="job-location">
                  {currentLang === 'ar' ? job.location_ar : job.location_en || 'N/A'}
                </div>
                <div className="job-date">
                  {new Date(job.postedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Domain Information */}
        {showDomainInfo && selectedJob && (
          <div className="domain-info-section">
            <h3 className="headline-small mb-md">
              {t('jobDomain.domainInfo', 'Domain Information')}
            </h3>
            
            <div className="domain-type-selector mb-md">
              <label className="form-label">
                {t('jobDomain.domainType', 'Domain Type')}
              </label>
              <select 
                value={domainType}
                onChange={(e) => handleDomainTypeChange(e.target.value)}
                className="form-select"
              >
                <option value="subdomain">{t('jobDomain.subdomain', 'Subdomain')}</option>
                <option value="customDomain">{t('jobDomain.customDomain', 'Custom Domain')}</option>
                <option value="professionalDomain">{t('jobDomain.professionalDomain', 'Professional Domain')}</option>
                <option value="locationDomain">{t('jobDomain.locationDomain', 'Location Domain')}</option>
                <option value="urlPath">{t('jobDomain.urlPath', 'URL Path')}</option>
              </select>
            </div>

            <div className="domain-display mb-md">
              <label className="form-label">
                {t('jobDomain.generatedDomain', 'Generated Domain')}
              </label>
              <div className="domain-input-group">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="domain-input"
                  placeholder={t('jobDomain.domainPlaceholder', 'Domain will be generated here')}
                />
                <button
                  onClick={() => copyToClipboard(customDomain)}
                  className="btn btn-secondary btn-small"
                >
                  {t('jobDomain.copy', 'Copy')}
                </button>
              </div>
            </div>

            <div className="domain-actions">
              <button
                onClick={() => generateQRCode(customDomain)}
                className="btn btn-primary"
              >
                {t('jobDomain.generateQR', 'Generate QR Code')}
              </button>
              
              <button
                onClick={() => window.open(customDomain, '_blank')}
                className="btn btn-secondary"
              >
                {t('jobDomain.testDomain', 'Test Domain')}
              </button>
            </div>

            <div className="domain-preview mt-lg">
              <h4 className="headline-small mb-md">
                {t('jobDomain.allVariations', 'All Domain Variations')}
              </h4>
              
              {(() => {
                const config: JobURLConfig = {
                  jobId: selectedJob._id,
                  title: currentLang === 'ar' ? selectedJob.title_ar : selectedJob.title_en,
                  company: selectedJob.company ? (currentLang === 'ar' ? selectedJob.company.name_ar : selectedJob.company.name_en) : undefined,
                  location: currentLang === 'ar' ? selectedJob.location_ar : selectedJob.location_en,
                };
                
                const domains = JobURLGenerator.getAllDomainVariations(config);
                
                return (
                  <div className="domain-variations">
                    {Object.entries(domains).map(([key, domain]) => (
                      <div key={key} className="domain-variation">
                        <span className="variation-label">
                          {t(`jobDomain.${key}`, key)}:
                        </span>
                        <span className="variation-value">{domain}</span>
                        <button
                          onClick={() => copyToClipboard(domain)}
                          className="btn btn-small btn-secondary"
                        >
                          {t('jobDomain.copy', 'Copy')}
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDomainManager;
